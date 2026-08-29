import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import { saveEmailTemplate } from "@/lib/settings";
import { EMAIL_KINDS, type EmailKind } from "@/lib/types";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return redirectTo("/dashboard");
  }

  const form = await request.formData();
  const kind = String(form.get("kind") ?? "") as EmailKind;
  const subject = String(form.get("subject") ?? "").trim();
  const heading = String(form.get("heading") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const ctaLabel = String(form.get("ctaLabel") ?? "").trim();

  if (!EMAIL_KINDS.includes(kind)) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Choose an email template.")}`,
    );
  }
  if (!subject || !heading || !body) {
    return redirectTo(
      `/dashboard/emails?edit=${encodeURIComponent(kind)}&error=${encodeURIComponent("Subject, heading, and body are required.")}`,
    );
  }

  await saveEmailTemplate({ kind, subject, heading, body, ctaLabel });
  return redirectTo(
    `/dashboard/emails?edit=${encodeURIComponent(kind)}&template=1`,
  );
}
