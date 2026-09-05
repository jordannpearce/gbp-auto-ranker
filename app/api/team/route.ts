import { getCurrentUser } from "@/lib/auth";
import { canManageTeam, isAdmin } from "@/lib/access";
import { resolveUserPlacement } from "@/lib/account-admin";
import { redirectTo } from "@/lib/http";
import { notifyTeamInvite, notifyWelcome } from "@/lib/notify";
import { isStrongPassword } from "@/lib/passwords";
import { USER_ROLES, type UserRole } from "@/lib/types";
import { createUser, getAgency } from "@/lib/users";

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
    return redirectTo(
      `/dashboard/team?error=${encodeURIComponent(placement.error)}`,
    );
  }
  const { role, agencyId } = placement;
  if (!name || !email || !password) {
    return redirectTo(
      `/dashboard/team?error=${encodeURIComponent("Name, email, and password are required.")}`,
    );
  }
  if (!isStrongPassword(password)) {
    return redirectTo(
      `/dashboard/team?error=${encodeURIComponent("Password must be at least 8 characters.")}`,
    );
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
    return redirectTo(
      `/dashboard/team?error=${encodeURIComponent(created.error ?? "Could not add that user.")}`,
    );
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
