function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paragraphsToHtml(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => {
      const html = escapeHtml(block.trim()).replaceAll("\n", "<br />");
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;">${html}</p>`;
    })
    .join("");
}

export function brandEmail({
  preheader,
  heading,
  intro,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footer,
}: {
  preheader: string;
  heading: string;
  intro?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
}) {
  const button =
    ctaLabel && ctaUrl
      ? `<p style="margin:28px 0 8px;">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:linear-gradient(135deg,#0642B5 0%,#1769E8 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">
            ${escapeHtml(ctaLabel)}
          </a>
        </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F7F9FC;font-family:Geist,Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #E3E8EF;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:22px 28px;background:linear-gradient(135deg,#0642B5 0%,#1769E8 100%);">
                <p style="margin:0;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.8);font-weight:700;">GBP Auto Ranker</p>
                <p style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:650;">${escapeHtml(heading)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${intro ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;">${escapeHtml(intro)}</p>` : ""}
                ${bodyHtml}
                ${button}
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;max-width:560px;font-size:12px;line-height:1.5;color:#5B6472;">
            ${escapeHtml(footer || "GBP Auto Ranker · Map-pack ranking for Google Business Profiles")}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function confirmAccountEmail(input: {
  name: string;
  confirmUrl: string;
}) {
  const subject = "Confirm your GBP Auto Ranker account";
  return {
    subject,
    text: `Hi ${input.name},\n\nConfirm your agency account so you can sign in and manage client campaigns.\n\n${input.confirmUrl}\n\nThis link expires in 48 hours.`,
    html: brandEmail({
      preheader: "Confirm your agency account to start ranking listings.",
      heading: "Confirm your account",
      intro: `Hi ${input.name}, thanks for creating a GBP Auto Ranker agency account. Confirm this email so you can sign in.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">The link expires in 48 hours. If you did not create this account, you can ignore this email.</p>",
      ctaLabel: "Confirm email",
      ctaUrl: input.confirmUrl,
    }),
  };
}

export function welcomeEmail(input: { name: string; dashboardUrl: string }) {
  const subject = "Your GBP Auto Ranker account is ready";
  return {
    subject,
    text: `Hi ${input.name},\n\nYour email is confirmed. Sign in to add clients, keywords, and team seats.\n\n${input.dashboardUrl}`,
    html: brandEmail({
      preheader: "Your agency workspace is open.",
      heading: "You’re in",
      intro: `Hi ${input.name}, your email is confirmed. You can add client listings, keywords, and extra team users from the dashboard.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">Start with the businesses you already manage. Public intake from the website lands in the admin queue until you assign it.</p>",
      ctaLabel: "Open dashboard",
      ctaUrl: input.dashboardUrl,
    }),
  };
}

export function passwordResetEmail(input: {
  name: string;
  resetUrl: string;
}) {
  const subject = "Reset your GBP Auto Ranker password";
  return {
    subject,
    text: `Hi ${input.name},\n\nUse this link to choose a new password. It expires in one hour.\n\n${input.resetUrl}\n\nIf you did not ask for this, ignore the email.`,
    html: brandEmail({
      preheader: "This reset link expires in one hour.",
      heading: "Reset your password",
      intro: `Hi ${input.name}, we received a request to reset the password on this account.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">The link works once and expires in one hour. If you did not ask for a reset, you can ignore this email.</p>",
      ctaLabel: "Choose a new password",
      ctaUrl: input.resetUrl,
    }),
  };
}

export function passwordChangedEmail(input: { name: string; loginUrl: string }) {
  const subject = "Your GBP Auto Ranker password was updated";
  return {
    subject,
    text: `Hi ${input.name},\n\nYour password was just updated. Sign in with the new one here:\n\n${input.loginUrl}`,
    html: brandEmail({
      preheader: "Your password was updated.",
      heading: "Password updated",
      intro: `Hi ${input.name}, the password on this account was changed. If that was you, no further action is needed.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">If you did not change it, reset the password again and tell your agency owner.</p>",
      ctaLabel: "Sign in",
      ctaUrl: input.loginUrl,
    }),
  };
}

export function teamInviteEmail(input: {
  name: string;
  agencyName: string;
  invitedBy: string;
  loginUrl: string;
}) {
  const subject = `You’ve been added to ${input.agencyName} on GBP Auto Ranker`;
  return {
    subject,
    text: `Hi ${input.name},\n\n${input.invitedBy} added you to ${input.agencyName} on GBP Auto Ranker. Sign in with the temporary password they shared.\n\n${input.loginUrl}`,
    html: brandEmail({
      preheader: `${input.agencyName} added you to the client workspace.`,
      heading: "You’re on the team",
      intro: `Hi ${input.name}, ${input.invitedBy} added you to ${input.agencyName} so you can manage the same client book.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">Sign in with the temporary password they shared, then change it from the forgot-password flow if you want your own.</p>",
      ctaLabel: "Sign in",
      ctaUrl: input.loginUrl,
    }),
  };
}

export function campaignReceivedEmail(input: {
  contactName: string;
  businessName: string;
}) {
  const subject = `We received the campaign for ${input.businessName}`;
  return {
    subject,
    text: `Hi ${input.contactName},\n\nGBP Auto Ranker received the map-pack campaign for ${input.businessName}. We’ll review the listing, Maps link, and keywords next.\n\nYou do not need to create an account unless your SEO agency invited you.`,
    html: brandEmail({
      preheader: `Campaign received for ${input.businessName}.`,
      heading: "Campaign received",
      intro: `Hi ${input.contactName}, we have the listing, Maps link, and keywords for ${input.businessName}.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">The team reviews new intakes before searches and engagement start. You do not need an account unless your SEO agency invites you into the dashboard.</p>",
    }),
  };
}

export function newIntakeAdminEmail(input: {
  businessName: string;
  contactName: string;
  email: string;
  dashboardUrl: string;
}) {
  const subject = `New campaign intake: ${input.businessName}`;
  return {
    subject,
    text: `New public intake from ${input.contactName} (${input.email}) for ${input.businessName}.\n\n${input.dashboardUrl}`,
    html: brandEmail({
      preheader: `${input.businessName} just submitted a campaign.`,
      heading: "New campaign intake",
      intro: `${input.contactName} submitted ${input.businessName}. The listing is unassigned until you give it to an agency.`,
      bodyHtml: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;">Contact: ${escapeHtml(input.email || "no email")}</p>`,
      ctaLabel: "Open customer",
      ctaUrl: input.dashboardUrl,
    }),
  };
}

export function campaignAssignedCustomerEmail(input: {
  contactName: string;
  businessName: string;
  agencyName: string;
}) {
  const subject = `${input.businessName} is with ${input.agencyName}`;
  return {
    subject,
    text: `Hi ${input.contactName},\n\nThe GBP Auto Ranker campaign for ${input.businessName} is now managed by ${input.agencyName}.`,
    html: brandEmail({
      preheader: `${input.agencyName} is managing this campaign.`,
      heading: "Your campaign was assigned",
      intro: `Hi ${input.contactName}, the map-pack campaign for ${input.businessName} is now with ${input.agencyName}.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">They have the keywords and Maps listing you submitted. Reply to this email if those details change.</p>",
    }),
  };
}

export function clientAssignedManagerEmail(input: {
  managerName: string;
  businessName: string;
  agencyName: string;
  dashboardUrl: string;
}) {
  const subject = `New lead assigned: ${input.businessName}`;
  return {
    subject,
    text: `Hi ${input.managerName},\n\n${input.businessName} was assigned to ${input.agencyName}. Open the client in the dashboard:\n\n${input.dashboardUrl}`,
    html: brandEmail({
      preheader: `${input.businessName} is on your client book.`,
      heading: "New lead assigned",
      intro: `Hi ${input.managerName}, a new business was assigned to ${input.agencyName}: ${input.businessName}.`,
      bodyHtml:
        "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;\">Open the listing, review the Maps URL and keywords, and follow up with the owner.</p>",
      ctaLabel: "Open client",
      ctaUrl: input.dashboardUrl,
    }),
  };
}

export function broadcastEmail(input: {
  subject: string;
  heading: string;
  body: string;
  kind: "marketing" | "info" | "update";
}) {
  const footer =
    input.kind === "marketing"
      ? "You’re receiving this because you have a GBP Auto Ranker account or campaign. Reply if you want off this list."
      : "GBP Auto Ranker · Account and campaign updates";
  return {
    subject: input.subject,
    text: `${input.heading}\n\n${input.body}`,
    html: brandEmail({
      preheader: input.subject,
      heading: input.heading,
      bodyHtml: paragraphsToHtml(input.body),
      footer,
    }),
  };
}
