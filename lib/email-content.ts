import { defaultTemplate } from "@/lib/default-templates";
import { brandEmail } from "@/lib/email-templates";
import { getEmailTemplate } from "@/lib/settings";
import type { EmailKind } from "@/lib/types";

export function applyTemplateVars(
  text: string,
  vars: Record<string, string>,
) {
  return text.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key: string) => {
    return vars[key] ?? "";
  });
}

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
) {
  const template = await getEmailTemplate(kind);
  const subject = applyTemplateVars(template.subject, vars);
  const heading = applyTemplateVars(template.heading, vars);
  const body = applyTemplateVars(template.body, vars);
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

  return {
    subject,
    text: [heading, "", body, ctaUrl ? `\n${ctaUrl}` : ""]
      .filter(Boolean)
      .join("\n"),
    html: brandEmail({
      preheader: subject,
      heading,
      bodyHtml: paragraphsToHtml(body),
      ctaLabel: template.ctaLabel || undefined,
      ctaUrl: template.ctaLabel && ctaUrl ? ctaUrl : undefined,
      footer,
    }),
  };
}

export function renderBroadcastEmail(input: {
  subject: string;
  heading: string;
  body: string;
  kind: EmailKind;
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

export function templateOrDefault(kind: EmailKind) {
  return defaultTemplate(kind);
}
