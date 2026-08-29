import { redirectTo } from "@/lib/http";
import { notifyConfirmAccount } from "@/lib/notify";
import { getUserByEmail, isEmailVerified, issueConfirmToken } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const nextPath = String(form.get("next") ?? "/confirm");
  const safeNext =
    nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath.split("?")[0]
      : "/confirm";

  const user = email ? await getUserByEmail(email) : null;
  if (!user || isEmailVerified(user)) {
    return redirectTo(`${safeNext}?resent=1&email=${encodeURIComponent(email)}`);
  }

  const next = await issueConfirmToken(user.id);
  if (!next) {
    return redirectTo(
      `${safeNext}?error=${encodeURIComponent("Could not resend that confirmation email.")}&email=${encodeURIComponent(email)}`,
    );
  }

  const sent = await notifyConfirmAccount(next);
  const params = new URLSearchParams({ resent: "1", email: next.email });
  if (!sent.delivered && next.confirmToken) {
    params.set("token", next.confirmToken);
  }
  return redirectTo(`${safeNext}?${params.toString()}`);
}
