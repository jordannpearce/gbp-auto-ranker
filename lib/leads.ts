import {
  LEAD_PREFERENCES,
  type Agency,
  type LeadPreference,
} from "@/lib/types";

export function normalizeLeadPreference(value: unknown): LeadPreference {
  return value === "shared" ? "shared" : "exclusive";
}

export function parseLeadPreference(value: unknown): LeadPreference | null {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  return LEAD_PREFERENCES.includes(raw as LeadPreference)
    ? (raw as LeadPreference)
    : null;
}

export function leadPreferenceLabel(value: LeadPreference) {
  return value === "shared" ? "Shared leads" : "Exclusive leads";
}

export function leadPreferenceShort(value: LeadPreference) {
  return value === "shared" ? "Shared" : "Exclusive";
}

export function leadPreferenceCopy(value: LeadPreference) {
  return value === "shared"
    ? "This agency will take leads that may also be offered to other agencies."
    : "This agency only wants leads assigned to them — not shared with another agency.";
}

export function agencyAssignLabel(agency: Pick<Agency, "name" | "leadPreference">) {
  return `${agency.name} · ${leadPreferenceShort(agency.leadPreference)}`;
}

export function normalizeAgency(raw: Partial<Agency> | null | undefined): Agency | null {
  if (!raw?.id || !raw.name) return null;
  return {
    id: raw.id,
    createdAt: raw.createdAt || new Date().toISOString(),
    name: raw.name,
    website: raw.website || "",
    ownerUserId: raw.ownerUserId || "",
    leadPreference: normalizeLeadPreference(raw.leadPreference),
  };
}
