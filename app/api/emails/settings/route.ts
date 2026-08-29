import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import { saveEmailSettings } from "@/lib/settings";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return redirectTo("/dashboard");
  }

  const form = await request.formData();
  const apiKey = String(form.get("apiKey") ?? "");
  const fromName = String(form.get("fromName") ?? "").trim();
  const fromEmail = String(form.get("fromEmail") ?? "").trim();
  const replyTo = String(form.get("replyTo") ?? "").trim();

  if (fromEmail && !fromEmail.includes("@")) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("From email must be a valid address.")}`,
    );
  }
  if (replyTo && !replyTo.includes("@")) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Reply-to must be a valid address.")}`,
    );
  }

  await saveEmailSettings({
    apiKey,
    fromName,
    fromEmail,
    replyTo,
  });

  return redirectTo("/dashboard/emails?settings=1");
}
