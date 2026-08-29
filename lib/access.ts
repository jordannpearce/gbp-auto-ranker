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

export function canManageTeam(user: Pick<User, "role">) {
  return user.role === "admin" || user.role === "agency_owner";
}

export function canSeeCustomer(
  user: Pick<User, "role" | "agencyId">,
  customer: Pick<Customer, "agencyId">,
) {
  if (isAdmin(user)) return true;
  return Boolean(user.agencyId) && customer.agencyId === user.agencyId;
}

export function visibleCustomers(
  user: Pick<User, "role" | "agencyId" | "id">,
  customers: Customer[],
  scope: "all" | "mine" | "unassigned" = "all",
) {
  let list = customers;
  if (!isAdmin(user)) {
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
  return "Agency user";
}
