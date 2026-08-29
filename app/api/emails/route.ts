import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import { notifyBroadcast } from "@/lib/notify";
import { listCustomers } from "@/lib/store";
import {
  BROADCAST_KINDS,
  EMAIL_AUDIENCES,
  type BroadcastKind,
  type EmailAudience,
} from "@/lib/types";
import { listUsers } from "@/lib/users";

function parseEmails(value: string) {
  return value
    .split(/[\s,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.includes("@"));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return redirectTo("/dashboard");
  }

  const form = await request.formData();
  const kind = String(form.get("kind") ?? "") as BroadcastKind;
  const audience = String(form.get("audience") ?? "") as EmailAudience;
  const subject = String(form.get("subject") ?? "").trim();
  const heading = String(form.get("heading") ?? "").trim() || subject;
  const body = String(form.get("body") ?? "").trim();
  const customTo = String(form.get("customTo") ?? "");

  if (!BROADCAST_KINDS.includes(kind)) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Choose marketing, info, or update.")}`,
    );
  }
  if (!EMAIL_AUDIENCES.includes(audience)) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Choose who should receive this email.")}`,
    );
  }
  if (!subject || !body) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Subject and body are required.")}`,
    );
  }
  if (subject.length > 200 || body.length > 20000) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Keep the subject under 200 characters and the body under 20,000.")}`,
    );
  }

  const [users, customers] = await Promise.all([listUsers(), listCustomers()]);
  let recipients: string[] = [];
  if (audience === "all_users") {
    recipients = users.map((item) => item.email);
  } else if (audience === "agency_owners") {
    recipients = users
      .filter((item) => item.role === "agency_owner")
      .map((item) => item.email);
  } else if (audience === "agency_members") {
    recipients = users
      .filter((item) => item.role === "agency_member")
      .map((item) => item.email);
  } else if (audience === "customers") {
    recipients = customers.map((item) => item.email);
  } else {
    recipients = parseEmails(customTo);
  }

  const unique = [...new Set(recipients.map((email) => email.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("That audience has no email addresses.")}`,
    );
  }

  const result = await notifyBroadcast({
    kind,
    subject,
    heading,
    body,
    recipients: unique,
  });

  return redirectTo(
    `/dashboard/emails?sent=${result.attempted}&delivered=${result.delivered}&logged=${result.logged}&failed=${result.failed}`,
  );
}
