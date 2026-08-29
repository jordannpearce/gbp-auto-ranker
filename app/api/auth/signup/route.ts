import { redirectTo } from "@/lib/http";
import { notifyConfirmAccount } from "@/lib/notify";
import { isStrongPassword } from "@/lib/passwords";
import { createAgency } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("agencyName") ?? "").trim();
  const website = String(form.get("website") ?? "").trim();
  const ownerName = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!name || !ownerName || !email || !password) {
    return redirectTo(
      `/signup?error=${encodeURIComponent("Agency name, your name, email, and password are required.")}`,
    );
  }
  if (!isStrongPassword(password)) {
    return redirectTo(
      `/signup?error=${encodeURIComponent("Password must be at least 8 characters.")}`,
    );
  }
  if (website && !/^https?:\/\//i.test(website)) {
    return redirectTo(
      `/signup?error=${encodeURIComponent("Website must start with http:// or https://.")}`,
    );
  }

  const created = await createAgency({
    name,
    website,
    ownerName,
    email,
    password,
  });
  if ("error" in created) {
    return redirectTo(
      `/signup?error=${encodeURIComponent(created.error ?? "Could not create the agency.")}`,
    );
  }

  const sent = await notifyConfirmAccount(created.user);
  const params = new URLSearchParams({ email: created.user.email });
  if (!sent.delivered && created.user.confirmToken) {
    params.set("token", created.user.confirmToken);
  }
  return redirectTo(`/signup/check-email?${params.toString()}`);
}
