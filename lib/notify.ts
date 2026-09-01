import { renderBroadcastEmail, renderStoredEmail } from "@/lib/email-content";
import { varsForEmail } from "@/lib/email-vars";
import { appUrl, sendEmail } from "@/lib/mail";
import {
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_NAME,
  STAFF_ALERT_EMAIL,
} from "@/lib/primary-admin";
import type { Agency, BroadcastKind, Customer, User } from "@/lib/types";
import { listCustomers } from "@/lib/store";
import {
  getAgency,
  getUser,
  listAgencies,
  listAgencyUsers,
  listUsers,
} from "@/lib/users";

async function staffAlertEmails() {
  const admins = (await listUsers()).filter((user) => user.role === "admin");
  return [
    ...new Set(
      [PRIMARY_ADMIN_EMAIL, STAFF_ALERT_EMAIL, ...admins.map((user) => user.email)]
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

function staffGreeting(email: string) {
  return email === PRIMARY_ADMIN_EMAIL.toLowerCase()
    ? PRIMARY_ADMIN_NAME
    : "team";
}

export async function notifyConfirmAccount(user: User) {
  if (!user.confirmToken) {
    return { delivered: false, status: "failed" as const, error: "No token." };
  }
  const content = await renderStoredEmail("confirm_account", {
    name: user.name || "there",
    confirm_url: appUrl(`/api/auth/confirm?token=${user.confirmToken}`),
  });
  return sendEmail({ ...content, to: user.email, kind: "confirm_account" });
}

export async function notifyWelcome(user: User) {
  const content = await renderStoredEmail("welcome", {
    name: user.name || "there",
    dashboard_url: appUrl("/dashboard"),
  });
  return sendEmail({ ...content, to: user.email, kind: "welcome" });
}

export async function notifyPasswordReset(user: User, token: string) {
  const content = await renderStoredEmail("password_reset", {
    name: user.name || "there",
    reset_url: appUrl(`/reset-password?token=${token}`),
  });
  return sendEmail({ ...content, to: user.email, kind: "password_reset" });
}

export async function notifyPasswordChanged(user: User) {
  const content = await renderStoredEmail("password_changed", {
    name: user.name || "there",
    login_url: appUrl("/login"),
  });
  return sendEmail({ ...content, to: user.email, kind: "password_changed" });
}

export async function notifyTeamInvite(input: {
  user: User;
  agencyName: string;
  invitedBy: string;
}) {
  const content = await renderStoredEmail("team_invite", {
    name: input.user.name || "there",
    agency_name: input.agencyName,
    invited_by: input.invitedBy,
    login_url: appUrl("/login"),
  });
  return sendEmail({
    ...content,
    to: input.user.email,
    kind: "team_invite",
  });
}

export async function notifyCampaignReceived(
  customer: Customer,
  options?: { notifyAdmins?: boolean },
) {
  const jobs = [];
  if (customer.email) {
    const content = await renderStoredEmail("campaign_received", {
      name: customer.contactName || "there",
      business_name: customer.businessName,
    });
    jobs.push(
      sendEmail({
        ...content,
        to: customer.email,
        kind: "campaign_received",
      }),
    );
  }

  if (options?.notifyAdmins !== false && !customer.agencyId) {
    for (const email of await staffAlertEmails()) {
      const content = await renderStoredEmail("new_intake", {
        name: staffGreeting(email),
        business_name: customer.businessName,
        contact_name: customer.contactName || "A new contact",
        contact_email: customer.email,
        dashboard_url: appUrl(`/dashboard/${customer.id}`),
      });
      jobs.push(sendEmail({ ...content, to: email, kind: "new_intake" }));
    }
  }

  return Promise.all(jobs);
}

function notifyAgencyValues(
  source: FormData | Record<string, unknown> | null | undefined,
) {
  if (!source) return [];
  if (source instanceof FormData) {
    return source.getAll("notifyAgency").map((item) => String(item).toLowerCase());
  }
  const raw = source.notifyAgency;
  if (Array.isArray(raw)) return raw.map((item) => String(item).toLowerCase());
  if (raw === undefined || raw === null) return [];
  return [String(raw).toLowerCase()];
}

export function wantsNotifyAgency(
  source: FormData | Record<string, unknown> | null | undefined,
) {
  const values = notifyAgencyValues(source);
  if (values.length === 0) return true;
  return values.some(
    (value) => value === "yes" || value === "on" || value === "true" || value === "1",
  );
}

export type AssignmentNotifyResult = {
  customerEmailed: boolean;
  agencyEmailed: number;
  agencyRecipients: string[];
  skippedAgency: boolean;
  error?: string;
};

export async function notifyAssignment(
  customer: Customer,
  options?: { notifyAgency?: boolean; notifyCustomer?: boolean },
): Promise<AssignmentNotifyResult> {
  const empty: AssignmentNotifyResult = {
    customerEmailed: false,
    agencyEmailed: 0,
    agencyRecipients: [],
    skippedAgency: options?.notifyAgency === false,
  };
  if (!customer.agencyId) return empty;

  const agency = await getAgency(customer.agencyId);
  const agencyName = agency?.name || "your SEO agency";
  const agencyOwner = agency?.ownerUserId
    ? await getUser(agency.ownerUserId)
    : null;

  let customerEmailed = false;
  if (options?.notifyCustomer !== false && customer.email) {
    const content = await renderStoredEmail("campaign_assigned", {
      name: customer.contactName || "there",
      email: customer.email,
      business_name: customer.businessName,
      agency_name: agencyName,
      agency_owner: agencyOwner?.name || "",
    });
    const sent = await sendEmail({
      ...content,
      to: customer.email,
      kind: "campaign_assigned",
    });
    customerEmailed = sent.status !== "failed";
  }

  if (options?.notifyAgency === false) {
    return { ...empty, customerEmailed, skippedAgency: true };
  }

  const recipients = new Map<string, User>();
  for (const member of await listAgencyUsers(customer.agencyId)) {
    if (member.email) recipients.set(member.email.toLowerCase(), member);
  }
  if (agency?.ownerUserId) {
    const owner = await getUser(agency.ownerUserId);
    if (owner?.email) recipients.set(owner.email.toLowerCase(), owner);
  }
  if (customer.managerUserId) {
    const manager = await getUser(customer.managerUserId);
    if (manager?.email) recipients.set(manager.email.toLowerCase(), manager);
  }

  if (recipients.size === 0) {
    return {
      customerEmailed,
      agencyEmailed: 0,
      agencyRecipients: [],
      skippedAgency: false,
      error: "That agency has no email addresses to notify.",
    };
  }

  const agencyRecipients: string[] = [];
  const errors: string[] = [];
  for (const recipient of recipients.values()) {
    const content = await renderStoredEmail("agency_new_client", {
      name: recipient.name || "there",
      email: recipient.email,
      user: recipient.name || "there",
      business_name: customer.businessName,
      agency_name: agencyName,
      agency: agencyName,
      agency_owner: agencyOwner?.name || "",
      dashboard_url: appUrl(`/dashboard/${customer.id}`),
    });
    const sent = await sendEmail({
      ...content,
      to: recipient.email,
      kind: "agency_new_client",
    });
    if (sent.status === "failed") {
      errors.push(sent.error || recipient.email);
    } else {
      agencyRecipients.push(recipient.email);
    }
  }

  return {
    customerEmailed,
    agencyEmailed: agencyRecipients.length,
    agencyRecipients,
    skippedAgency: false,
    error: errors.length ? errors.join(" · ") : undefined,
  };
}

export async function notifyStaffAgencySignup(input: {
  user: User;
  agency: Agency;
}) {
  const emails = await staffAlertEmails();
  if (emails.length === 0) return;
  const jobs = emails.map(async (email) => {
    const content = await renderStoredEmail("new_agency_signup", {
      name: input.user.name || "A new owner",
      email: input.user.email,
      agency_name: input.agency.name,
      website: input.agency.website || "No website",
      dashboard_url: appUrl(`/dashboard/agencies/${input.agency.id}`),
    });
    return sendEmail({
      ...content,
      to: email,
      kind: "new_agency_signup",
    });
  });
  return Promise.all(jobs);
}

export async function notifyStaffBusinessSignup(user: User) {
  const emails = await staffAlertEmails();
  if (emails.length === 0) return;
  const jobs = emails.map(async (email) => {
    const content = await renderStoredEmail("new_business_signup", {
      name: user.name || "A new business owner",
      email: user.email,
      dashboard_url: appUrl("/dashboard"),
    });
    return sendEmail({
      ...content,
      to: email,
      kind: "new_business_signup",
    });
  });
  return Promise.all(jobs);
}

export function assignmentNotifyQuery(result: AssignmentNotifyResult) {
  const params = new URLSearchParams();
  if (result.skippedAgency) params.set("notified", "skipped");
  else params.set("notified", String(result.agencyEmailed));
  if (result.agencyRecipients.length) {
    params.set("agencyTo", result.agencyRecipients.join(", "));
  }
  if (result.error) params.set("mailError", result.error);
  return params;
}

export function assignmentNotifyMessage(
  notified?: string,
  agencyTo?: string,
  mailError?: string,
) {
  if (mailError) return mailError;
  if (notified === "skipped") return "Agency email was skipped.";
  if (notified && notified !== "0") {
    return agencyTo
      ? `Emailed the agency (${agencyTo}) that this listing was assigned.`
      : "Emailed the agency that this listing was assigned.";
  }
  if (notified === "0") return "Could not email the agency.";
  return "";
}

export function assignmentChanged(
  previous: Pick<Customer, "agencyId" | "managerUserId">,
  next: Pick<Customer, "agencyId" | "managerUserId">,
) {
  return (
    previous.agencyId !== next.agencyId ||
    previous.managerUserId !== next.managerUserId
  );
}

export async function notifyBroadcast(input: {
  kind: BroadcastKind;
  subject: string;
  heading: string;
  body: string;
  recipients: string[];
}) {
  const unique = [
    ...new Set(
      input.recipients.map((email) => email.trim().toLowerCase()).filter(Boolean),
    ),
  ];
  const [users, customers, agencies] = await Promise.all([
    listUsers(),
    listCustomers(),
    listAgencies(),
  ]);
  const context = { users, customers, agencies };
  const results = [];
  for (const to of unique) {
    const content = renderBroadcastEmail({
      subject: input.subject,
      heading: input.heading,
      body: input.body,
      kind: input.kind,
      vars: varsForEmail(to, context),
    });
    results.push(
      await sendEmail({
        ...content,
        to,
        kind: input.kind,
      }),
    );
  }
  return {
    attempted: unique.length,
    delivered: results.filter((item) => item.delivered).length,
    logged: results.filter((item) => item.status === "logged").length,
    failed: results.filter((item) => item.status === "failed").length,
  };
}
