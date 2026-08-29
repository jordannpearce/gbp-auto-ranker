import type { Customer, CustomerInput } from "@/lib/types";
import { CAMPAIGN_STATUSES } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

function trim(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .filter((item, index, list) => list.indexOf(item) === index);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, list) => list.indexOf(item) === index);
  }
  return [];
}

export function parseCustomerInput(body: unknown): {
  data?: CustomerInput;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { error: "Send a JSON object with your campaign details." };
  }

  const raw = body as Record<string, unknown>;
  const keywords = parseKeywords(raw.keywords);

  const data: CustomerInput = {
    contactName: trim(raw.contactName),
    email: trim(raw.email),
    phone: trim(raw.phone),
    role: trim(raw.role),
    businessName: trim(raw.businessName),
    category: trim(raw.category),
    address: trim(raw.address),
    city: trim(raw.city),
    state: trim(raw.state),
    zip: trim(raw.zip),
    website: trim(raw.website),
    googleMapsUrl: trim(raw.googleMapsUrl),
    keywords,
    serviceArea: trim(raw.serviceArea),
    primaryGoal: trim(raw.primaryGoal),
    comments: trim(raw.comments),
    referralSource: trim(raw.referralSource),
  };

  if (!data.contactName) return { error: "Name is required." };
  if (!data.email || !EMAIL_RE.test(data.email)) {
    return { error: "A valid email is required." };
  }
  if (!data.phone) return { error: "Phone number is required." };
  if (!data.businessName) return { error: "Business name is required." };
  if (!data.category) return { error: "Business category is required." };
  if (!data.city) return { error: "City is required." };
  if (!data.state) return { error: "State is required." };
  if (!data.googleMapsUrl) {
    return { error: "A Google Maps link to the listing is required." };
  }
  if (!URL_RE.test(data.googleMapsUrl)) {
    return {
      error: "Google Maps link must start with http:// or https://.",
    };
  }
  if (data.website && !URL_RE.test(data.website)) {
    return { error: "Website must start with http:// or https://." };
  }
  if (data.keywords.length === 0) {
    return { error: "Add at least one target keyword." };
  }
  if (data.keywords.length > 25) {
    return { error: "Keep the keyword list to 25 or fewer." };
  }

  return { data };
}

export function parseCustomerUpdate(body: unknown) {
  if (!body || typeof body !== "object") {
    return { error: "Send a JSON object." };
  }
  const raw = body as Record<string, unknown>;
  const update: {
    status?: Customer["status"];
    keywords?: string[];
    internalNotes?: string;
    comments?: string;
    agencyId?: string;
    managerUserId?: string;
    ownerUserId?: string;
  } = {};

  if ("status" in raw) {
    const status = trim(raw.status);
    if (!CAMPAIGN_STATUSES.includes(status as Customer["status"])) {
      return { error: "Invalid campaign status." };
    }
    update.status = status as Customer["status"];
  }
  if ("keywords" in raw) {
    const keywords = parseKeywords(raw.keywords);
    if (keywords.length === 0) {
      return { error: "Add at least one target keyword." };
    }
    update.keywords = keywords;
  }
  if ("internalNotes" in raw) {
    update.internalNotes = trim(raw.internalNotes);
  }
  if ("comments" in raw) {
    update.comments = trim(raw.comments);
  }
  if ("agencyId" in raw) {
    update.agencyId = trim(raw.agencyId);
  }
  if ("managerUserId" in raw) {
    update.managerUserId = trim(raw.managerUserId);
  }
  if ("ownerUserId" in raw) {
    update.ownerUserId = trim(raw.ownerUserId);
  }

  return { data: update };
}

export function formatLocation(customer: Pick<Customer, "city" | "state">) {
  return [customer.city, customer.state].filter(Boolean).join(", ");
}

export const STATUS_LABELS: Record<Customer["status"], string> = {
  new: "New",
  reviewing: "Reviewing",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};
