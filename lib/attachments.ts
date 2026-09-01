import type { Agency, Customer, PublicUser, User } from "@/lib/types";

export function agencyName(
  agencies: Agency[],
  agencyId: string,
) {
  return agencies.find((agency) => agency.id === agencyId)?.name || "";
}

export function ownerName(
  users: Pick<PublicUser, "id" | "name">[],
  ownerUserId: string,
) {
  return users.find((user) => user.id === ownerUserId)?.name || "";
}

export function listingsForUser(
  user: Pick<User, "id" | "role" | "agencyId">,
  customers: Customer[],
) {
  if (user.role === "business_owner") {
    return customers.filter((customer) => customer.ownerUserId === user.id);
  }
  if (user.role === "agency_owner" || user.role === "agency_member") {
    if (!user.agencyId) return [];
    return customers.filter((customer) => customer.agencyId === user.agencyId);
  }
  return [];
}

export function attachmentLabel(
  user: Pick<User, "role" | "agencyId">,
  agencies: Agency[],
) {
  if (user.role === "admin") return "Staff";
  const name = agencyName(agencies, user.agencyId);
  if (user.role === "business_owner") {
    return name || "Independent";
  }
  return name || "No agency";
}
