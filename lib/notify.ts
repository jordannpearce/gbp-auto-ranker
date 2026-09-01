import { renderBroadcastEmail, renderStoredEmail } from "@/lib/email-content";
import { appUrl, sendEmail } from "@/lib/mail";
import {
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_NAME,
  STAFF_ALERT_EMAIL,
} from "@/lib/primary-admin";
import type { Agency, BroadcastKind, Customer, User } from "@/lib/types";
import { getAgency, getUser, listAgencyUsers, listUsers } from "@/lib/users";

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

export async function notifyAssignment(customer: Customer) {
  if (!customer.agencyId) return;

  const agency = await getAgency(customer.agencyId);
  const agencyName = agency?.name || "your SEO agency";

  if (customer.email) {
    const content = await renderStoredEmail("campaign_assigned", {
      name: customer.contactName || "there",
      business_name: customer.businessName,
      agency_name: agencyName,
    });
    await sendEmail({
      ...content,
      to: customer.email,
      kind: "campaign_assigned",
    });
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

  for (const recipient of recipients.values()) {
    const content = await renderStoredEmail("client_assigned", {
      name: recipient.name || "there",
      business_name: customer.businessName,
      agency_name: agencyName,
      dashboard_url: appUrl(`/dashboard/${customer.id}`),
    });
    await sendEmail({
      ...content,
      to: recipient.email,
      kind: "client_assigned",
    });
  }
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
  const content = renderBroadcastEmail({
    subject: input.subject,
    heading: input.heading,
    body: input.body,
    kind: input.kind,
  });
  const results = [];
  for (const to of unique) {
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
