import { getCurrentUser } from "@/lib/auth";
import { canManageTeam, isAdmin } from "@/lib/access";
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
  const role: UserRole =
    isAdmin(user) && USER_ROLES.includes(requestedRole)
      ? requestedRole
      : "agency_member";
  const agencyId =
    role === "admin"
      ? ""
      : isAdmin(user)
        ? String(form.get("agencyId") ?? "").trim()
        : user.agencyId;

  if (role !== "admin" && !agencyId) {
    return redirectTo(
      `/dashboard/team?error=${encodeURIComponent("Choose an agency for this user.")}`,
    );
  }
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

  if (role === "admin") {
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
