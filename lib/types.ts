export const CAMPAIGN_STATUSES = [
  "new",
  "reviewing",
  "active",
  "paused",
  "completed",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const PRIMARY_GOALS = [
  "Rank in the map pack",
  "More phone calls",
  "More direction requests",
  "More website clicks",
  "More in-store visits",
] as const;

export const USER_ROLES = ["admin", "agency_owner", "agency_member"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type User = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  agencyId: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Agency = {
  id: string;
  createdAt: string;
  name: string;
  website: string;
  ownerUserId: string;
};

export type PasswordReset = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type Customer = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: CampaignStatus;
  contactName: string;
  email: string;
  phone: string;
  role: string;
  businessName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  googleMapsUrl: string;
  keywords: string[];
  serviceArea: string;
  primaryGoal: string;
  comments: string;
  referralSource: string;
  internalNotes: string;
  agencyId: string;
  managerUserId: string;
};

export type CustomerInput = Omit<
  Customer,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "internalNotes"
  | "agencyId"
  | "managerUserId"
>;

export type CustomerUpdate = Partial<
  Pick<
    Customer,
    | "status"
    | "keywords"
    | "internalNotes"
    | "comments"
    | "agencyId"
    | "managerUserId"
  >
>;
