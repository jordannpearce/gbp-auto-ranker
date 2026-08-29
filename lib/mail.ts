import { Resend } from "resend";
import { appendEmailLog } from "@/lib/email-log";
import type { EmailKind } from "@/lib/types";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function fromAddress() {
  return (
    process.env.RESEND_FROM?.trim() ||
    "GBP Auto Ranker <beth.t@example.com>"
  );
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

  let status: SendEmailResult["status"] = "logged";
  let error: string | undefined;
  let resendId: string | undefined;

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error: sendError } = await resend.emails.send({
        from: fromAddress(),
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
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
