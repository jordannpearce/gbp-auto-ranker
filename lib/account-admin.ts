import { PRIMARY_ADMIN_ID } from "@/lib/primary-admin";
import { listCustomers, updateCustomer } from "@/lib/store";
import { USER_ROLES, type User, type UserRole } from "@/lib/types";
import {
  getAgency,
  listAgencyUsers,
  listUsers,
  updateAgency,
  updateUser,
} from "@/lib/users";

export function resolveUserPlacement(
  role: UserRole,
  agencyId: string,
): { error: string } | { role: UserRole; agencyId: string } {
  if (!USER_ROLES.includes(role)) {
    return { error: "Choose a valid role." };
  }
  if (role === "admin") {
    return { role, agencyId: "" };
  }
  if (role === "agency_owner" || role === "agency_member") {
    if (!agencyId) {
      return { error: "Choose an agency for this user." };
    }
    return { role, agencyId };
  }
  return { role, agencyId };
}

export function canDeleteUserAccount(actorId: string, target: User) {
  if (target.id === PRIMARY_ADMIN_ID) {
    return "The primary admin login cannot be deleted.";
  }
  if (target.id === actorId) {
    return "You cannot delete the login you are using.";
  }
  return "";
}

export async function canDemoteAdmin(target: User, nextRole: UserRole) {
  if (target.role !== "admin" || nextRole === "admin") return "";
  if (target.id === PRIMARY_ADMIN_ID) {
    return "The primary admin must stay an admin.";
  }
  const admins = (await listUsers()).filter((user) => user.role === "admin");
  if (admins.length <= 1) {
    return "Keep at least one admin login.";
  }
  return "";
}

export async function canRemoveLastAdmin(target: User) {
  if (target.role !== "admin") return "";
  if (target.id === PRIMARY_ADMIN_ID) {
    return "The primary admin login cannot be deleted.";
  }
  const admins = (await listUsers()).filter((user) => user.role === "admin");
  if (admins.length <= 1) {
    return "Keep at least one admin login.";
  }
  return "";
}

export async function clearManagerAssignments(userId: string) {
  const customers = await listCustomers();
  for (const customer of customers) {
    if (customer.managerUserId !== userId) continue;
    await updateCustomer(customer.id, { managerUserId: "" });
  }
}

export async function clearOwnedListings(userId: string) {
  const customers = await listCustomers();
  for (const customer of customers) {
    if (customer.ownerUserId !== userId) continue;
    await updateCustomer(customer.id, { ownerUserId: "" });
  }
}

export async function reassignAgencyOwnerIfNeeded(
  agencyId: string,
  removedUserId: string,
) {
  if (!agencyId) return;
  const agency = await getAgency(agencyId);
  if (!agency || agency.ownerUserId !== removedUserId) return;
  const remaining = (await listAgencyUsers(agencyId)).filter(
    (user) =>
      user.id !== removedUserId &&
      (user.role === "agency_owner" || user.role === "agency_member"),
  );
  const next =
    remaining.find((user) => user.role === "agency_owner") ?? remaining[0];
  await updateAgency(agencyId, { ownerUserId: next?.id ?? "" });
}

export async function setAgencyOwner(agencyId: string, ownerUserId: string) {
  const agency = await getAgency(agencyId);
  if (!agency) return { error: "That agency was not found." };
  const owner = (await listUsers()).find((user) => user.id === ownerUserId);
  if (!owner) return { error: "Choose a login to own this agency." };
  if (owner.role === "admin") {
    return { error: "An admin login cannot be the agency owner." };
  }

  const placed = await updateUser(owner.id, {
    role: "agency_owner",
    agencyId,
  });
  if ("error" in placed) return placed;
  await applyUserMoveEffects(owner, placed.user);

  if (agency.ownerUserId && agency.ownerUserId !== owner.id) {
    const previous = (await listUsers()).find(
      (user) => user.id === agency.ownerUserId,
    );
    if (
      previous &&
      previous.role === "agency_owner" &&
      previous.agencyId === agencyId
    ) {
      await updateUser(previous.id, { role: "agency_member" });
    }
  }

  await updateAgency(agencyId, { ownerUserId: owner.id });
  return { user: "user" in placed ? placed.user : owner };
}

export async function applyUserMoveEffects(before: User, after: User) {
  const leftAgency =
    Boolean(before.agencyId) && before.agencyId !== after.agencyId;
  if (leftAgency || (before.role !== after.role && isAgencyStaff(before))) {
    await clearManagerAssignments(before.id);
  }
  if (leftAgency) {
    await reassignAgencyOwnerIfNeeded(before.agencyId, before.id);
  }
  if (
    before.role === "agency_owner" &&
    after.role !== "agency_owner" &&
    before.agencyId &&
    before.agencyId === after.agencyId
  ) {
    await reassignAgencyOwnerIfNeeded(before.agencyId, before.id);
  }
}

function isAgencyStaff(user: Pick<User, "role">) {
  return user.role === "agency_owner" || user.role === "agency_member";
}
