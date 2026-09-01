import { appUrl } from "@/lib/mail";
import type { Agency, Customer, User } from "@/lib/types";

function normalizeKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const ALIASES: Record<string, string> = {
  user: "name",
  username: "name",
  user_name: "name",
  first_name: "name",
  recipient: "name",
  recipient_name: "name",
  contact: "name",
  owner: "name",
  owner_name: "name",
  agency: "agency_name",
  agencyname: "agency_name",
  agency_owner_name: "agency_owner",
  business: "business_name",
  businessname: "business_name",
  listing: "business_name",
  listing_name: "business_name",
  company: "business_name",
  client: "business_name",
  client_name: "business_name",
  email_address: "email",
  dashboard: "dashboard_url",
  login: "login_url",
  confirm: "confirm_url",
  reset: "reset_url",
};

export function expandEmailVars(input: Record<string, string>) {
  const name =
    input.name || input.user || input.user_name || input.contact_name || "";
  const email = input.email || "";
  const agency = input.agency_name || input.agency || "";
  const agencyOwner = input.agency_owner || "";
  const business = input.business_name || input.business || "";
  const next: Record<string, string> = {
    ...input,
    name,
    user: name,
    user_name: name,
    contact_name: input.contact_name || name,
    email,
    agency_name: agency,
    agency,
    agency_owner: agencyOwner,
    business_name: business,
    business,
    dashboard_url: input.dashboard_url || appUrl("/dashboard"),
    login_url: input.login_url || appUrl("/login"),
  };
  return next;
}

function lookupValue(lookup: Record<string, string>, raw: string) {
  const key = normalizeKey(raw);
  if (lookup[key]) return lookup[key];
  const alias = ALIASES[key];
  if (alias && lookup[alias]) return lookup[alias];
  return "";
}

export function applyTemplateVars(
  text: string,
  vars: Record<string, string>,
) {
  const lookup: Record<string, string> = {};
  for (const [key, value] of Object.entries(expandEmailVars(vars))) {
    if (value) lookup[normalizeKey(key)] = value;
  }
  for (const [alias, canon] of Object.entries(ALIASES)) {
    if (lookup[canon] && !lookup[alias]) lookup[alias] = lookup[canon];
  }
  return text.replace(/\{\{\{?\s*([^}]+?)\s*\}?\}\}/g, (match, raw: string) => {
    return lookupValue(lookup, raw) || match;
  });
}

function filledVars(input: Record<string, string>) {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value) next[key] = value;
  }
  return next;
}

export function sampleEmailVars(overrides: Record<string, string> = {}) {
  return expandEmailVars({
    name: "Jordan Hale",
    email: "jordan@example.com",
    agency_name: "North Shore SEO",
    agency: "North Shore SEO",
    agency_owner: "Alex Rivera",
    business_name: "Harbor Grill",
    business: "Harbor Grill",
    contact_name: "Jamie Cole",
    contact_email: "jamie@harborgrill.example",
    website: "https://harborgrill.example",
    dashboard_url: appUrl("/dashboard"),
    login_url: appUrl("/login"),
    confirm_url: appUrl("/api/auth/confirm?token=preview"),
    reset_url: appUrl("/reset-password?token=preview"),
    invited_by: "TM",
    ...filledVars(overrides),
  });
}

export type EmailVarContext = {
  users: User[];
  customers: Customer[];
  agencies: Agency[];
};

export function varsForEmail(email: string, context: EmailVarContext) {
  const needle = email.trim().toLowerCase();
  const user = context.users.find(
    (item) => item.email.toLowerCase() === needle,
  );
  const customer = context.customers.find(
    (item) => item.email.toLowerCase() === needle,
  );
  const agencyId = user?.agencyId || customer?.agencyId || "";
  const agency = context.agencies.find((item) => item.id === agencyId) ?? null;
  const owner = agency?.ownerUserId
    ? context.users.find((item) => item.id === agency.ownerUserId)
    : null;
  const ownedListing = user
    ? context.customers.find((item) => item.ownerUserId === user.id)
    : null;
  const agencyListing = agencyId
    ? context.customers.find((item) => item.agencyId === agencyId)
    : null;

  return expandEmailVars({
    name: user?.name || customer?.contactName || needle.split("@")[0] || "",
    email: needle,
    agency_name: agency?.name || "",
    agency_owner: owner?.name || "",
    business_name:
      customer?.businessName ||
      ownedListing?.businessName ||
      agencyListing?.businessName ||
      "",
    contact_name: customer?.contactName || user?.name || "",
    contact_email: customer?.email || needle,
    website: customer?.website || agency?.website || "",
    dashboard_url: appUrl("/dashboard"),
    login_url: appUrl("/login"),
  });
}

export function testEmailVars(email: string, context: EmailVarContext) {
  const known = varsForEmail(email, context);
  return sampleEmailVars({
    ...known,
    email,
    name: known.name || "Jordan Hale",
  });
}

export const SHORTCODE_HELP = [
  ["{{name}}", "{{user}}", "Recipient name"],
  ["{{email}}", "", "Recipient email"],
  ["{{agency_name}}", "{{agency}}", "Agency name"],
  ["{{agency_owner}}", "", "Agency owner name"],
  ["{{business_name}}", "{{business}}", "Business / listing name"],
  ["{{dashboard_url}}", "", "Dashboard link"],
];
