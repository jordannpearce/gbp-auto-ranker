import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import { normalizeLeadPreference } from "@/lib/leads";
import { notifyWelcome } from "@/lib/notify";
import { isStrongPassword } from "@/lib/passwords";
import { createAgency } from "@/lib/users";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return redirectTo("/dashboard");
  }

  const form = await request.formData();
  const name = String(form.get("agencyName") ?? "").trim();
  const website = String(form.get("website") ?? "").trim();
  const ownerName = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!name || !ownerName || !email || !password) {
    return redirectTo(
      `/dashboard/agencies/new?error=${encodeURIComponent("Agency name, owner name, email, and password are required.")}`,
    );
  }
  if (!isStrongPassword(password)) {
    return redirectTo(
      `/dashboard/agencies/new?error=${encodeURIComponent("Password must be at least 8 characters.")}`,
    );
  }
  if (website && !/^https?:\/\//i.test(website)) {
    return redirectTo(
      `/dashboard/agencies/new?error=${encodeURIComponent("Website must start with http:// or https://.")}`,
    );
  }

  const created = await createAgency({
    name,
    website,
    ownerName,
    email,
    password,
    verified: true,
    leadPreference: normalizeLeadPreference(form.get("leadPreference")),
  });
  if ("error" in created) {
    return redirectTo(
      `/dashboard/agencies/new?error=${encodeURIComponent(created.error ?? "Could not create the agency.")}`,
    );
  }

  await notifyWelcome(created.user);
  return redirectTo(`/dashboard/agencies/${created.agency.id}?created=1`);
}
