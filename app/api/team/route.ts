import { getCurrentUser } from "@/lib/auth";
import { canManageTeam, isAdmin } from "@/lib/access";
import { resolveUserPlacement } from "@/lib/account-admin";
import { redirectTo } from "@/lib/http";
import { notifyTeamInvite, notifyWelcome } from "@/lib/notify";
import { isStrongPassword } from "@/lib/passwords";
import { USER_ROLES, type UserRole } from "@/lib/types";
import { createUser, getAgency } from "@/lib/users";

function failToTeam(
  message: string,
  fields: { name?: string; email?: string; role?: string; agencyId?: string },
) {
  const params = new URLSearchParams({ error: message });
  if (fields.name) params.set("name", fields.name);
  if (fields.email) params.set("email", fields.email);
  if (fields.role) params.set("role", fields.role);
  if (fields.agencyId) params.set("agencyId", fields.agencyId);
  return redirectTo(`/dashboard/team?${params}`);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageTeam(user)) {
    return redirectTo("/dashboard/team?error=You%20cannot%20add%20users.");
  }

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const requestedRole = String(form.get("role") ?? "agency_member") as UserRole;
  const requested: UserRole =
    isAdmin(user) && USER_ROLES.includes(requestedRole)
      ? requestedRole
      : "agency_member";
  const placement = resolveUserPlacement(
    requested,
    isAdmin(user)
      ? String(form.get("agencyId") ?? "").trim()
      : user.agencyId,
  );
  if ("error" in placement) {
    return failToTeam(placement.error, {
      name,
      email,
      role: requested,
      agencyId: String(form.get("agencyId") ?? ""),
    });
  }
  const { role, agencyId } = placement;
  if (!name || !email || !password) {
    return failToTeam("Name, email, and password are required.", {
      name,
      email,
      role: requested,
      agencyId,
    });
  }
  if (!isStrongPassword(password)) {
    return failToTeam("Password must be at least 8 characters.", {
      name,
      email,
      role: requested,
      agencyId,
    });
  }

  const created = await createUser({
    name,
    email,
    password,
    role,
    agencyId,
    verified: true,
  });
  if ("error" in created) {
    return failToTeam(created.error ?? "Could not add that user.", {
      name,
      email,
      role,
      agencyId,
    });
  }

  if (role === "admin" || role === "business_owner") {
    await notifyWelcome(created.user);
  } else {
    const agency = await getAgency(agencyId);
    await notifyTeamInvite({
      user: created.user,
      agencyName: agency?.name || "your agency",
      invitedBy: user.name,
    });
  }
  return redirectTo("/dashboard/team?saved=1");
}
