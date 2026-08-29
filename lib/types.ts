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
};

export type CustomerInput = Omit<
  Customer,
  "id" | "createdAt" | "updatedAt" | "status" | "internalNotes"
>;

export type CustomerUpdate = Partial<
  Pick<Customer, "status" | "keywords" | "internalNotes" | "comments">
>;
