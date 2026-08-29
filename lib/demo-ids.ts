export const DEMO_CUSTOMER_IDS = [
  "cust_harbor_dental",
  "cust_midtown_auto",
  "cust_bloom_stem",
];

export const DEMO_USER_IDS = ["user_maya", "user_leo"];

export const DEMO_AGENCY_IDS = ["agency_northstar"];

export function isDemoCustomerId(id: string) {
  return DEMO_CUSTOMER_IDS.includes(id);
}

export function isDemoUserId(id: string) {
  return DEMO_USER_IDS.includes(id);
}
