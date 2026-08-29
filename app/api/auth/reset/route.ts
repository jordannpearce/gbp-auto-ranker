import { redirectTo } from "@/lib/http";
import { notifyPasswordChanged } from "@/lib/notify";
import { isStrongPassword } from "@/lib/passwords";
import { consumeResetToken, getUser, updateUserPassword } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (!isStrongPassword(password)) {
    return redirectTo(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Password must be at least 8 characters.")}`,
    );
  }
  if (password !== confirm) {
    return redirectTo(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Those passwords do not match.")}`,
    );
  }

  const reset = await consumeResetToken(token);
  if (!reset) {
    return redirectTo(
      `/reset-password?error=${encodeURIComponent("That reset link is invalid or has expired.")}`,
    );
  }

  await updateUserPassword(reset.userId, password);
  const user = await getUser(reset.userId);
  if (user) {
    await notifyPasswordChanged(user);
  }
  return redirectTo("/login?reset=1");
}
