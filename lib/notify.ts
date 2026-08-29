import {
  broadcastEmail,
  campaignAssignedCustomerEmail,
  campaignReceivedEmail,
  clientAssignedManagerEmail,
  confirmAccountEmail,
  newIntakeAdminEmail,
  passwordChangedEmail,
  passwordResetEmail,
  teamInviteEmail,
  welcomeEmail,
} from "@/lib/email-templates";
import { appUrl, sendEmail } from "@/lib/mail";
import type { BroadcastKind, Customer, User } from "@/lib/types";
import { getAgency, getUser, listUsers } from "@/lib/users";

export async function notifyConfirmAccount(user: User) {
  if (!user.confirmToken) {
    return { delivered: false, status: "failed" as const, error: "No token." };
  }
  const content = confirmAccountEmail({
    name: user.name || "there",
    confirmUrl: appUrl(`/api/auth/confirm?token=${user.confirmToken}`),
  });
  return sendEmail({ ...content, to: user.email, kind: "confirm_account" });
}

export async function notifyWelcome(user: User) {
  const content = welcomeEmail({
    name: user.name || "there",
    dashboardUrl: appUrl("/dashboard"),
  });
  return sendEmail({ ...content, to: user.email, kind: "welcome" });
}

export async function notifyPasswordReset(user: User, token: string) {
  const content = passwordResetEmail({
    name: user.name || "there",
    resetUrl: appUrl(`/reset-password?token=${token}`),
  });
  return sendEmail({ ...content, to: user.email, kind: "password_reset" });
}

export async function notifyPasswordChanged(user: User) {
  const content = passwordChangedEmail({
    name: user.name || "there",
    loginUrl: appUrl("/login"),
  });
  return sendEmail({ ...content, to: user.email, kind: "password_changed" });
}

export async function notifyTeamInvite(input: {
  user: User;
  agencyName: string;
  invitedBy: string;
}) {
  const content = teamInviteEmail({
    name: input.user.name || "there",
    agencyName: input.agencyName,
    invitedBy: input.invitedBy,
    loginUrl: appUrl("/login"),
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
    const content = campaignReceivedEmail({
      contactName: customer.contactName || "there",
      businessName: customer.businessName,
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
    const admins = (await listUsers()).filter((user) => user.role === "admin");
    for (const admin of admins) {
      const content = newIntakeAdminEmail({
        businessName: customer.businessName,
        contactName: customer.contactName || "A new contact",
        email: customer.email,
        dashboardUrl: appUrl(`/dashboard/${customer.id}`),
      });
      jobs.push(
        sendEmail({ ...content, to: admin.email, kind: "new_intake" }),
      );
    }
  }

  return Promise.all(jobs);
}

export async function notifyAssignment(customer: Customer) {
  if (!customer.agencyId) return;

  const agency = await getAgency(customer.agencyId);
  const agencyName = agency?.name || "your SEO agency";

  if (customer.email) {
    const content = campaignAssignedCustomerEmail({
      contactName: customer.contactName || "there",
      businessName: customer.businessName,
      agencyName,
    });
    await sendEmail({
      ...content,
      to: customer.email,
      kind: "campaign_assigned",
    });
  }

  const manager = customer.managerUserId
    ? await getUser(customer.managerUserId)
    : null;
  const owner = agency?.ownerUserId ? await getUser(agency.ownerUserId) : null;
  const recipient = manager || owner;
  if (!recipient) return;

  const content = clientAssignedManagerEmail({
    managerName: recipient.name || "there",
    businessName: customer.businessName,
    agencyName,
    dashboardUrl: appUrl(`/dashboard/${customer.id}`),
  });
  await sendEmail({
    ...content,
    to: recipient.email,
    kind: "client_assigned",
  });
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
  const unique = [...new Set(input.recipients.map((email) => email.trim().toLowerCase()).filter(Boolean))];
  const content = broadcastEmail({
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

