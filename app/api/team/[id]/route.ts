import { isAdmin } from "@/lib/access";
import {
  applyUserMoveEffects,
  canDeleteUserAccount,
  canDemoteAdmin,
  canRemoveLastAdmin,
  clearOwnedListings,
  resolveUserPlacement,
} from "@/lib/account-admin";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import { isStrongPassword } from "@/lib/passwords";
import { USER_ROLES, type UserRole } from "@/lib/types";
import { deleteUser, getAgency, getUser, updateUser } from "@/lib/users";

function returnTo(id: string, extra = "") {
  return `/dashboard/team/${id}${extra}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentUser();
  const { id } = await params;
  if (!actor || !isAdmin(actor)) {
    return redirectTo("/dashboard/team");
  }

  const target = await getUser(id);
  if (!target) {
    return redirectTo("/dashboard/team?error=That%20user%20was%20not%20found.");
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  if (intent === "delete") {
    if (String(form.get("confirmDelete") ?? "") !== "yes") {
      return redirectTo(
        returnTo(
          id,
          `?error=${encodeURIComponent("Tick the box to confirm you want to delete this login.")}`,
        ),
      );
    }
    const blocked =
      canDeleteUserAccount(actor.id, target) ||
      (await canRemoveLastAdmin(target));
    if (blocked) {
      return redirectTo(returnTo(id, `?error=${encodeURIComponent(blocked)}`));
    }
    await clearOwnedListings(target.id);
    await applyUserMoveEffects(target, {
      ...target,
      role: "business_owner",
      agencyId: "",
    });
    await deleteUser(target.id);
    return redirectTo("/dashboard/team?removed=1");
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const requestedRole = String(form.get("role") ?? target.role) as UserRole;
  const role = USER_ROLES.includes(requestedRole) ? requestedRole : target.role;
  const agencyId = String(form.get("agencyId") ?? "").trim();
  const placement = resolveUserPlacement(role, agencyId);
  if ("error" in placement) {
    return redirectTo(
      returnTo(id, `?error=${encodeURIComponent(placement.error)}`),
    );
  }
  if (!name || !email) {
    return redirectTo(
      returnTo(id, `?error=${encodeURIComponent("Name and email are required.")}`),
    );
  }
  if (password && !isStrongPassword(password)) {
    return redirectTo(
      returnTo(
        id,
        `?error=${encodeURIComponent("New password must be at least 8 characters.")}`,
      ),
    );
  }
  if (placement.agencyId) {
    const agency = await getAgency(placement.agencyId);
    if (!agency) {
      return redirectTo(
        returnTo(id, `?error=${encodeURIComponent("Choose a real agency.")}`),
      );
    }
  }
  const demoteError = await canDemoteAdmin(target, placement.role);
  if (demoteError) {
    return redirectTo(
      returnTo(id, `?error=${encodeURIComponent(demoteError)}`),
    );
  }

  const updated = await updateUser(target.id, {
    name,
    email,
    role: placement.role,
    agencyId: placement.agencyId,
    ...(password ? { password } : {}),
  });
  if ("error" in updated) {
    return redirectTo(
      returnTo(
        id,
        `?error=${encodeURIComponent(updated.error ?? "Could not save that user.")}`,
      ),
    );
  }

  await applyUserMoveEffects(target, updated.user);
  return redirectTo(returnTo(id, "?saved=1"));
}
