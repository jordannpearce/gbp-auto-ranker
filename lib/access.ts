import type { Customer, PublicUser, User } from "@/lib/types";

export function isAdmin(user: Pick<User, "role">) {
  return user.role === "admin";
}

export function isAgencyUser(user: Pick<User, "role" | "agencyId">) {
  return (
    (user.role === "agency_owner" || user.role === "agency_member") &&
    Boolean(user.agencyId)
  );
}

export function isBusinessOwner(user: Pick<User, "role">) {
  return user.role === "business_owner";
}

export function canManageTeam(user: Pick<User, "role">) {
  return user.role === "admin" || user.role === "agency_owner";
}

export function canEditAgency(
  user: Pick<User, "role" | "agencyId">,
  agencyId: string,
) {
  if (isAdmin(user)) return true;
  return user.role === "agency_owner" && user.agencyId === agencyId;
}

export function canSeeCustomer(
  user: Pick<User, "role" | "agencyId" | "id">,
  customer: Pick<Customer, "agencyId" | "ownerUserId">,
) {
  if (isAdmin(user)) return true;
  if (isBusinessOwner(user)) return customer.ownerUserId === user.id;
  return Boolean(user.agencyId) && customer.agencyId === user.agencyId;
}

export function canDeleteCustomer(
  user: Pick<User, "role" | "agencyId" | "id">,
  customer: Pick<Customer, "agencyId" | "ownerUserId">,
) {
  if (!canSeeCustomer(user, customer)) return false;
  return isAdmin(user) || isAgencyUser(user);
}

export function visibleCustomers(
  user: Pick<User, "role" | "agencyId" | "id">,
  customers: Customer[],
  scope: "all" | "mine" | "unassigned" = "all",
) {
  let list = customers;
  if (isBusinessOwner(user)) {
    list = customers.filter((customer) => customer.ownerUserId === user.id);
  } else if (!isAdmin(user)) {
    list = customers.filter((customer) => customer.agencyId === user.agencyId);
  }
  if (scope === "mine") {
    return list.filter((customer) => customer.managerUserId === user.id);
  }
  if (scope === "unassigned") {
    return list.filter((customer) => !customer.agencyId);
  }
  return list;
}

export function roleLabel(role: PublicUser["role"]) {
  if (role === "admin") return "Admin";
  if (role === "agency_owner") return "Agency owner";
  if (role === "business_owner") return "Business owner";
  return "Agency user";
}
