export const PUBLIC_CONTACT_EMAIL = "hello@info.gbpautoranker.com";

export function parseEmailList(value: string | string[] | undefined) {
  const parts = Array.isArray(value) ? value : value ? [value] : [];
  return [
    ...new Set(
      parts
        .flatMap((item) => item.split(/[\s,;]+/))
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.includes("@")),
    ),
  ];
}

export function listingContactEmail(
  customer: { email?: string; ownerUserId?: string | null },
  users: { id: string; email: string }[],
) {
  const direct = customer.email?.trim() ?? "";
  if (direct.includes("@")) return direct;
  if (!customer.ownerUserId) return "";
  return users.find((user) => user.id === customer.ownerUserId)?.email ?? "";
}

export function agencyContactEmail(
  agency: { id: string; ownerUserId?: string | null },
  users: { id: string; email: string; agencyId?: string | null }[],
) {
  const owner = users.find((user) => user.id === agency.ownerUserId);
  if (owner?.email.includes("@")) return owner.email;
  return (
    users.find((user) => user.agencyId === agency.id && user.email.includes("@"))
      ?.email ?? ""
  );
}
