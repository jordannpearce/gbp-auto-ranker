import type { EmailKind } from "@/lib/types";

export type EmailTemplate = {
  kind: EmailKind;
  label: string;
  subject: string;
  heading: string;
  body: string;
  ctaLabel: string;
  variables: string[];
};

export const EMAIL_TEMPLATE_META: Record<
  EmailKind,
  { label: string; variables: string[] }
> = {
  confirm_account: {
    label: "Account activation",
    variables: ["name", "confirm_url"],
  },
  welcome: {
    label: "Welcome",
    variables: ["name", "dashboard_url"],
  },
  password_reset: {
    label: "Password reset",
    variables: ["name", "reset_url"],
  },
  password_changed: {
    label: "Password changed",
    variables: ["name", "login_url"],
  },
  team_invite: {
    label: "Team invite",
    variables: ["name", "agency_name", "invited_by", "login_url"],
  },
  campaign_received: {
    label: "Campaign received",
    variables: ["name", "business_name"],
  },
  new_intake: {
    label: "New intake (admin)",
    variables: ["name", "business_name", "contact_name", "contact_email", "dashboard_url"],
  },
  new_agency_signup: {
    label: "New agency signup (staff)",
    variables: ["name", "email", "agency_name", "website", "dashboard_url"],
  },
  new_business_signup: {
    label: "New business signup (staff)",
    variables: ["name", "email", "dashboard_url"],
  },
  campaign_assigned: {
    label: "Campaign assigned",
    variables: ["name", "business_name", "agency_name"],
  },
  client_assigned: {
    label: "Client assigned",
    variables: ["name", "business_name", "agency_name", "dashboard_url"],
  },
  marketing: {
    label: "Marketing",
    variables: ["name"],
  },
  info: {
    label: "Info",
    variables: ["name"],
  },
  update: {
    label: "Product update",
    variables: ["name"],
  },
};

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    kind: "confirm_account",
    label: "Account activation",
    subject: "Confirm your GBP Auto Ranker account",
    heading: "Confirm your account",
    body: "Hi {{name}},\n\nThanks for creating a GBP Auto Ranker agency account. Confirm this email so you can sign in and manage client campaigns.\n\nThe link expires in 48 hours. If you did not create this account, ignore this message.",
    ctaLabel: "Confirm email",
    variables: ["name", "confirm_url"],
  },
  {
    kind: "welcome",
    label: "Welcome",
    subject: "Your GBP Auto Ranker account is ready",
    heading: "You’re in",
    body: "Hi {{name}},\n\nYour email is confirmed. You can add client listings, keywords, and extra team users from the dashboard.\n\nStart with the businesses you already manage. Public intake lands in the admin queue until you assign it.",
    ctaLabel: "Open dashboard",
    variables: ["name", "dashboard_url"],
  },
  {
    kind: "password_reset",
    label: "Password reset",
    subject: "Reset your GBP Auto Ranker password",
    heading: "Reset your password",
    body: "Hi {{name}},\n\nWe received a request to reset the password on this account. The link works once and expires in one hour.\n\nIf you did not ask for a reset, you can ignore this email.",
    ctaLabel: "Choose a new password",
    variables: ["name", "reset_url"],
  },
  {
    kind: "password_changed",
    label: "Password changed",
    subject: "Your GBP Auto Ranker password was updated",
    heading: "Password updated",
    body: "Hi {{name}},\n\nThe password on this account was changed. If that was you, no further action is needed.\n\nIf you did not change it, reset the password again and tell your agency owner.",
    ctaLabel: "Sign in",
    variables: ["name", "login_url"],
  },
  {
    kind: "team_invite",
    label: "Team invite",
    subject: "You’ve been added to {{agency_name}} on GBP Auto Ranker",
    heading: "You’re on the team",
    body: "Hi {{name}},\n\n{{invited_by}} added you to {{agency_name}} so you can manage the same client book.\n\nSign in with the temporary password they shared, then change it from forgot password if you want your own.",
    ctaLabel: "Sign in",
    variables: ["name", "agency_name", "invited_by", "login_url"],
  },
  {
    kind: "campaign_received",
    label: "Campaign received",
    subject: "We received the campaign for {{business_name}}",
    heading: "Campaign received",
    body: "Hi {{name}},\n\nWe have the listing, Maps link, and keywords for {{business_name}}.\n\nThe team reviews new intakes before searches and engagement start. You do not need an account unless your SEO agency invites you.",
    ctaLabel: "",
    variables: ["name", "business_name"],
  },
  {
    kind: "new_intake",
    label: "New intake (admin)",
    subject: "New campaign intake: {{business_name}}",
    heading: "New campaign intake",
    body: "{{contact_name}} submitted {{business_name}}. The listing is unassigned until you give it to an agency.\n\nContact: {{contact_email}}",
    ctaLabel: "Open customer",
    variables: ["name", "business_name", "contact_name", "contact_email", "dashboard_url"],
  },
  {
    kind: "new_agency_signup",
    label: "New agency signup (staff)",
    subject: "New agency signup: {{agency_name}}",
    heading: "New agency signup",
    body: "{{name}} created an agency account for {{agency_name}}.\n\nEmail: {{email}}\nWebsite: {{website}}",
    ctaLabel: "Open agency",
    variables: ["name", "email", "agency_name", "website", "dashboard_url"],
  },
  {
    kind: "new_business_signup",
    label: "New business signup (staff)",
    subject: "New business signup: {{name}}",
    heading: "New business signup",
    body: "{{name}} created a business-owner account.\n\nEmail: {{email}}",
    ctaLabel: "Open dashboard",
    variables: ["name", "email", "dashboard_url"],
  },
  {
    kind: "campaign_assigned",
    label: "Campaign assigned",
    subject: "{{business_name}} is with {{agency_name}}",
    heading: "Your campaign was assigned",
    body: "Hi {{name}},\n\nThe map-pack campaign for {{business_name}} is now with {{agency_name}}.\n\nThey have the keywords and Maps listing you submitted. Reply if those details change.",
    ctaLabel: "",
    variables: ["name", "business_name", "agency_name"],
  },
  {
    kind: "client_assigned",
    label: "Client assigned",
    subject: "New lead assigned: {{business_name}}",
    heading: "New lead assigned",
    body: "Hi {{name}},\n\nA new business was assigned to {{agency_name}}: {{business_name}}.\n\nOpen the listing, review the Maps URL and keywords, and follow up with the owner.",
    ctaLabel: "Open client",
    variables: ["name", "business_name", "agency_name", "dashboard_url"],
  },
  {
    kind: "marketing",
    label: "Marketing",
    subject: "This month on the map pack",
    heading: "A note from GBP Auto Ranker",
    body: "Hi {{name}},\n\nA short update for the businesses and agencies we work with. Reply if you want off this list.",
    ctaLabel: "",
    variables: ["name"],
  },
  {
    kind: "info",
    label: "Info",
    subject: "An update from GBP Auto Ranker",
    heading: "Account and campaign info",
    body: "Hi {{name}},\n\nHere is an informational update about your account or campaign.",
    ctaLabel: "",
    variables: ["name"],
  },
  {
    kind: "update",
    label: "Product update",
    subject: "What’s new in GBP Auto Ranker",
    heading: "Product update",
    body: "Hi {{name}},\n\nA short note about a change to the product or how campaigns run.",
    ctaLabel: "",
    variables: ["name"],
  },
];

export function defaultTemplate(kind: EmailKind) {
  return (
    DEFAULT_TEMPLATES.find((item) => item.kind === kind) || DEFAULT_TEMPLATES[0]
  );
}
