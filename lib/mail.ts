import { Resend } from "resend";
import { appendEmailLog } from "@/lib/email-log";
import { getEmailSettings } from "@/lib/settings";
import type { EmailKind } from "@/lib/types";

export async function getMailConfig() {
  const settings = await getEmailSettings();
  const apiKey = settings.apiKey || process.env.RESEND_API_KEY || "";
  const fromName = settings.fromName || "GBP Auto Ranker";
  const fromEmail =
    settings.fromEmail ||
    process.env.RESEND_FROM?.replace(/^.*<([^>]+)>.*$/, "$1").trim() ||
    "";
  const from = fromEmail
    ? `${fromName} <${fromEmail}>`
    : process.env.RESEND_FROM?.trim() || "";
  return {
    apiKey,
    fromName,
    fromEmail,
    from,
    replyTo: settings.replyTo,
  };
}

export async function isEmailConfigured() {
  return Boolean((await getMailConfig()).apiKey);
}

export async function fromAddress() {
  const config = await getMailConfig();
  return config.from || "GBP Auto Ranker <hello@gbpautoranker.com>";
}

export function appBaseUrl() {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) {
    const host = railway.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  return "http://127.0.0.1:4410";
}

export function appUrl(path: string) {
  const prefix = path.startsWith("/") ? path : `/${path}`;
  return `${appBaseUrl()}${prefix}`;
}

export type SendEmailResult = {
  delivered: boolean;
  status: "sent" | "logged" | "failed";
  error?: string;
};

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  kind: EmailKind;
}): Promise<SendEmailResult> {
  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { delivered: false, status: "failed", error: "No recipient." };
  }

  const config = await getMailConfig();
  let status: SendEmailResult["status"] = "logged";
  let error: string | undefined;
  let resendId: string | undefined;

  if (config.apiKey && config.from) {
    try {
      const resend = new Resend(config.apiKey);
      const { data, error: sendError } = await resend.emails.send({
        from: config.from,
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: config.replyTo || undefined,
      });
      if (sendError) {
        status = "failed";
        error = sendError.message;
      } else {
        status = "sent";
        resendId = data?.id;
      }
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "Could not send email.";
    }
  } else {
    console.info(
      `[mail:${input.kind}] ${input.subject} -> ${recipients.join(", ")}`,
    );
    if (config.apiKey && !config.from) {
      error = "Add a from email in Email settings before sending.";
      status = "failed";
    }
  }

  await appendEmailLog({
    id: `mail_${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    kind: input.kind,
    to: recipients.join(", "),
    subject: input.subject,
    status,
    error,
    resendId,
  });

  return {
    delivered: status === "sent",
    status,
    error,
  };
}
