import {
  COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";
import { redirectTo } from "@/lib/http";
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

  const response = redirectTo("/dashboard");
  response.cookies.set(
    COOKIE_NAME,
    await createSessionToken(created.user.id),
    sessionCookieOptions(),
  );
  return response;
}
