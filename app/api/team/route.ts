import { getCurrentUser } from "@/lib/auth";
import { canManageTeam } from "@/lib/access";
import { redirectTo } from "@/lib/http";
import { notifyTeamInvite } from "@/lib/notify";
import { isStrongPassword } from "@/lib/passwords";
import { createUser, getAgency } from "@/lib/users";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageTeam(user)) {
    return redirectTo("/dashboard/team?error=You%20cannot%20add%20team%20members.");
  }

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const agencyId =
    user.role === "admin"
      ? String(form.get("agencyId") ?? user.agencyId)
      : user.agencyId;

  if (!agencyId) {
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
    role: "agency_member",
    agencyId,
    verified: true,
  });
  if ("error" in created) {
    return redirectTo(
      `/dashboard/team?error=${encodeURIComponent(created.error ?? "Could not add that user.")}`,
    );
  }

  const agency = await getAgency(agencyId);
  await notifyTeamInvite({
    user: created.user,
    agencyName: agency?.name || "your agency",
    invitedBy: user.name,
  });
  return redirectTo("/dashboard/team?saved=1");
}
