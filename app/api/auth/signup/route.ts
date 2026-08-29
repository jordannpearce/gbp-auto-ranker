import { redirectTo } from "@/lib/http";
import { notifyConfirmAccount } from "@/lib/notify";
import { isStrongPassword } from "@/lib/passwords";
import { createAgency, createUser } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const accountType = String(form.get("accountType") ?? "agency");
  const ownerName = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const errorUrl = (message: string) => {
    const params = new URLSearchParams({ error: message });
    if (accountType === "business") params.set("as", "business");
    return `/signup?${params}`;
  };

  if (!ownerName || !email || !password) {
    return redirectTo(errorUrl("Name, email, and password are required."));
  }

  if (!isStrongPassword(password)) {
    return redirectTo(errorUrl("Password must be at least 8 characters."));
  }

  if (accountType === "business") {
    const created = await createUser({
      name: ownerName,
      email,
      password,
      role: "business_owner",
      agencyId: "",
      verified: false,
    });
    if ("error" in created) {
      return redirectTo(
        errorUrl(created.error ?? "Could not create the account."),
      );
    }
    const sent = await notifyConfirmAccount(created.user);
    const params = new URLSearchParams({ email: created.user.email });
    if (!sent.delivered && created.user.confirmToken) {
      params.set("token", created.user.confirmToken);
    }
    return redirectTo(`/signup/check-email?${params}`);
  }

  const name = String(form.get("agencyName") ?? "").trim();
  const website = String(form.get("website") ?? "").trim();
  if (!name) {
    return redirectTo(errorUrl("Agency name, your name, email, and password are required."));
  }
  if (website && !/^https?:\/\//i.test(website)) {
    return redirectTo(errorUrl("Website must start with http:// or https://."));
  }

  const created = await createAgency({
    name,
    website,
    ownerName,
    email,
    password,
  });
  if ("error" in created) {
    return redirectTo(errorUrl(created.error ?? "Could not create the agency."));
  }

  const sent = await notifyConfirmAccount(created.user);
  const params = new URLSearchParams({ email: created.user.email });
  if (!sent.delivered && created.user.confirmToken) {
    params.set("token", created.user.confirmToken);
  }
  return redirectTo(`/signup/check-email?${params}`);
}
