import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { renderBroadcastEmail, renderStoredEmail } from "@/lib/email-content";
import { testEmailVars } from "@/lib/email-vars";
import { redirectTo } from "@/lib/http";
import { sendEmail } from "@/lib/mail";
import { notifyBroadcast } from "@/lib/notify";
import { listCustomers } from "@/lib/store";
import {
  BROADCAST_KINDS,
  EMAIL_AUDIENCES,
  EMAIL_KINDS,
  type BroadcastKind,
  type EmailAudience,
  type EmailKind,
} from "@/lib/types";
import { listAgencies, listUsers } from "@/lib/users";

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
  const intent = String(form.get("intent") ?? "send");
  const kind = String(form.get("kind") ?? "");
  const subject = String(form.get("subject") ?? "").trim();
  const heading = String(form.get("heading") ?? "").trim() || subject;
  const body = String(form.get("body") ?? "").trim();
  const testTo = parseEmails(String(form.get("testTo") ?? ""))[0] || "";

  if (intent === "test") {
    if (!testTo) {
      return redirectTo(
        `/dashboard/emails?error=${encodeURIComponent("Enter an email address to send the test to.")}&compose=${encodeURIComponent(kind || "info")}&edit=${encodeURIComponent(String(form.get("templateKind") ?? ""))}`,
      );
    }

    const [users, customers, agencies] = await Promise.all([
      listUsers(),
      listCustomers(),
      listAgencies(),
    ]);
    const vars = testEmailVars(testTo, { users, customers, agencies });

    const templateKind = String(form.get("templateKind") ?? "") as EmailKind;
    const ctaRaw = form.get("ctaLabel");
    const content =
      EMAIL_KINDS.includes(templateKind)
        ? await renderStoredEmail(templateKind, vars, {
            subject: subject || undefined,
            heading: heading || undefined,
            body: body || undefined,
            ...(ctaRaw !== null ? { ctaLabel: String(ctaRaw) } : {}),
          })
        : renderBroadcastEmail({
            subject: subject || "GBP Auto Ranker test",
            heading: heading || subject || "Test email",
            body: body || "This is a test email.",
            kind: BROADCAST_KINDS.includes(kind as BroadcastKind)
              ? (kind as BroadcastKind)
              : "info",
            vars,
          });

    const result = await sendEmail({
      ...content,
      subject: `[TEST] ${content.subject}`,
      to: testTo,
      kind: EMAIL_KINDS.includes(templateKind)
        ? templateKind
        : BROADCAST_KINDS.includes(kind as BroadcastKind)
          ? (kind as BroadcastKind)
          : "info",
    });

    const params = new URLSearchParams();
    if (result.delivered || result.status === "logged") {
      params.set("tested", "1");
      params.set("testTo", testTo);
      params.set("testedSubject", content.subject);
      params.set("testedAgency", vars.agency_name || vars.agency);
      params.set("testedBusiness", vars.business_name || vars.business);
    } else {
      params.set(
        "error",
        result.error || "The test email could not be sent.",
      );
    }
    if (BROADCAST_KINDS.includes(kind as BroadcastKind)) {
      params.set("compose", kind);
    }
    if (EMAIL_KINDS.includes(templateKind)) {
      params.set("edit", templateKind);
    }
    return redirectTo(`/dashboard/emails?${params}`);
  }

  const audience = String(form.get("audience") ?? "") as EmailAudience;
  const customTo = String(form.get("customTo") ?? "");

  if (!BROADCAST_KINDS.includes(kind as BroadcastKind)) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Choose new client for agency, marketing, info, or a product update.")}`,
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
  } else if (audience === "business_owners") {
    recipients = users
      .filter((item) => item.role === "business_owner")
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
    kind: kind as BroadcastKind,
    subject,
    heading,
    body,
    recipients: unique,
  });

  return redirectTo(
    `/dashboard/emails?sent=${result.attempted}&delivered=${result.delivered}&logged=${result.logged}&failed=${result.failed}`,
  );
}
