import { redirectTo } from "@/lib/http";
import { notifyPasswordReset } from "@/lib/notify";
import { listCustomers } from "@/lib/store";
import {
  createResetToken,
  findUserForPasswordReset,
  getUser,
} from "@/lib/users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();

  try {
    const user = email ? await resolveResetUser(email) : null;
    if (!user) {
      return redirectTo("/forgot-password?sent=1");
    }

    const reset = await createResetToken(user.id);
    const sent = await notifyPasswordReset(user, reset.token);
    if (sent.delivered || sent.status === "sent") {
      return redirectTo("/forgot-password?sent=1");
    }
    if (sent.status === "failed") {
      return redirectTo(
        `/forgot-password?sent=1&token=${reset.token}&mailError=${encodeURIComponent(sent.error || "The reset email could not be delivered.")}`,
      );
    }
    return redirectTo(`/forgot-password?sent=1&token=${reset.token}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start a password reset.";
    return redirectTo(
      `/forgot-password?error=${encodeURIComponent(message)}`,
    );
  }
}

async function resolveResetUser(email: string) {
  const direct = await findUserForPasswordReset(email);
  if (direct) return direct;
  const needle = email.trim().toLowerCase();
  const owners = new Set(
    (await listCustomers())
      .filter((customer) => customer.email.trim().toLowerCase() === needle)
      .map((customer) => customer.ownerUserId)
      .filter(Boolean),
  );
  if (owners.size !== 1) return null;
  return getUser([...owners][0]);
}
