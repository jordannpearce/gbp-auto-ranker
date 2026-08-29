import type { Customer } from "@/lib/types";

export function customerStats(customers: Customer[]) {
  const keywords = new Set(customers.flatMap((customer) => customer.keywords));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    total: customers.length,
    active: customers.filter((customer) => customer.status === "active").length,
    newCount: customers.filter((customer) => customer.status === "new").length,
    keywords: keywords.size,
    thisWeek: customers.filter(
      (customer) => new Date(customer.createdAt).getTime() >= weekAgo,
    ).length,
  };
}
