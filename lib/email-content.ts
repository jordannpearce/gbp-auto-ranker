import { defaultTemplate } from "@/lib/default-templates";
import { applyTemplateVars } from "@/lib/email-vars";
import { brandEmail } from "@/lib/email-templates";
import { getEmailTemplate } from "@/lib/settings";
import type { EmailKind } from "@/lib/types";

export { applyTemplateVars } from "@/lib/email-vars";

function paragraphsToHtml(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => {
      const html = block
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("\n", "<br />");
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#17191D;">${html}</p>`;
    })
    .join("");
}

export async function renderStoredEmail(
  kind: EmailKind,
  vars: Record<string, string>,
  overrides?: {
    subject?: string;
    heading?: string;
    body?: string;
    ctaLabel?: string;
  },
) {
  const template = await getEmailTemplate(kind);
  const subject = applyTemplateVars(
    overrides?.subject || template.subject,
    vars,
  );
  const heading = applyTemplateVars(
    overrides?.heading || template.heading,
    vars,
  );
  const body = applyTemplateVars(overrides?.body || template.body, vars);
  const ctaLabel =
    overrides?.ctaLabel !== undefined ? overrides.ctaLabel : template.ctaLabel;
  const ctaUrl =
    vars.confirm_url ||
    vars.reset_url ||
    vars.dashboard_url ||
    vars.login_url ||
    vars.cta_url ||
    "";
  const footer =
    kind === "marketing"
      ? "You’re receiving this because you have a GBP Auto Ranker account or campaign. Reply if you want off this list."
      : "GBP Auto Ranker · Map-pack ranking for Google Business Profiles";
  const needsBareLink =
    Boolean(ctaUrl) &&
    (kind === "password_reset" || kind === "confirm_account") &&
    !body.includes(ctaUrl);
  const text = [heading, "", body, ctaUrl ? `\n${ctaUrl}` : ""]
    .filter(Boolean)
    .join("\n");
  const linkHtml = needsBareLink
    ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5B6472;word-break:break-all;">If the button does not work, open this link:<br /><a href="${ctaUrl.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}">${ctaUrl.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</a></p>`
    : "";

  return {
    subject,
    text,
    html: brandEmail({
      preheader: subject,
      heading,
      bodyHtml: `${paragraphsToHtml(body)}${linkHtml}`,
      ctaLabel: ctaLabel || undefined,
      ctaUrl: ctaLabel && ctaUrl ? ctaUrl : undefined,
      footer,
    }),
  };
}

export function renderBroadcastEmail(input: {
  subject: string;
  heading: string;
  body: string;
  kind: EmailKind;
  vars?: Record<string, string>;
}) {
  const vars = input.vars ?? {};
  const subject = applyTemplateVars(input.subject, vars);
  const heading = applyTemplateVars(input.heading, vars);
  const body = applyTemplateVars(input.body, vars);
  const footer =
    input.kind === "marketing"
      ? "You’re receiving this because you have a GBP Auto Ranker account or campaign. Reply if you want off this list."
      : "GBP Auto Ranker · Account and campaign updates";
  return {
    subject,
    text: `${heading}\n\n${body}`,
    html: brandEmail({
      preheader: subject,
      heading,
      bodyHtml: paragraphsToHtml(body),
      footer,
    }),
  };
}

export function templateOrDefault(kind: EmailKind) {
  return defaultTemplate(kind);
}
