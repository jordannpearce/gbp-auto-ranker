import { redirectTo } from "@/lib/http";
import { createResetToken, getUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const user = email ? await getUserByEmail(email) : null;

  if (!user) {
    return redirectTo("/forgot-password?sent=1");
  }

  const reset = await createResetToken(user.id);
  return redirectTo(`/forgot-password?sent=1&token=${reset.token}`);
}
