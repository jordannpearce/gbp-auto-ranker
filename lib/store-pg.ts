import { iso, query } from "@/lib/db";
import type { Customer, CustomerInput, CustomerUpdate } from "@/lib/types";

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    createdAt: iso(row.created_at as Date | string),
    updatedAt: iso(row.updated_at as Date | string),
    status: (row.status as Customer["status"]) || "new",
    contactName: String(row.contact_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    role: String(row.role ?? ""),
    businessName: String(row.business_name),
    category: String(row.category ?? ""),
    address: String(row.address ?? ""),
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    zip: String(row.zip ?? ""),
    website: String(row.website ?? ""),
    googleMapsUrl: String(row.google_maps_url ?? ""),
    keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
    serviceArea: String(row.service_area ?? ""),
    primaryGoal: String(row.primary_goal ?? ""),
    comments: String(row.comments ?? ""),
    referralSource: String(row.referral_source ?? ""),
    internalNotes: String(row.internal_notes ?? ""),
    agencyId: String(row.agency_id ?? ""),
    managerUserId: String(row.manager_user_id ?? ""),
  };
}

function seedCustomers(): Customer[] {
  const now = new Date().toISOString();
  return [
    {
      id: "cust_harbor_dental",
      createdAt: now,
      updatedAt: now,
      status: "active",
      contactName: "Elena Vasquez",
      email: "elena@harborstreetdental.com",
      phone: "(415) 555-0142",
      role: "Owner",
      businessName: "Harbor Street Dental",
      category: "Dentist",
      address: "418 Harbor Street",
      city: "Sausalito",
      state: "CA",
      zip: "94965",
      website: "https://harborstreetdental.com",
      googleMapsUrl: "https://maps.google.com/?cid=harbor-street-dental",
      keywords: [
        "dentist near me",
        "emergency dentist Sausalito",
        "teeth whitening",
        "family dentist Marin",
      ],
      serviceArea: "Sausalito, Mill Valley, Marin City",
      primaryGoal: "Rank in the map pack",
      comments:
        "We lose weekend emergency calls to a clinic two towns over. Map pack for 'emergency dentist' is the priority.",
      referralSource: "Referral from another local owner",
      internalNotes:
        "Started map-pack campaign on weekday evenings and Saturday mornings.",
      agencyId: "agency_northstar",
      managerUserId: "user_maya",
    },
    {
      id: "cust_midtown_auto",
      createdAt: now,
      updatedAt: now,
      status: "reviewing",
      contactName: "Marcus Hale",
      email: "marcus@midtownautocare.com",
      phone: "(512) 555-0198",
      role: "General Manager",
      businessName: "Midtown Auto Care",
      category: "Auto repair shop",
      address: "902 East 6th Street",
      city: "Austin",
      state: "TX",
      zip: "78702",
      website: "https://midtownautocare.com",
      googleMapsUrl: "https://maps.google.com/?cid=midtown-auto-care",
      keywords: [
        "auto repair near me",
        "brake service Austin",
        "oil change East Austin",
        "check engine light",
      ],
      serviceArea: "East Austin, Downtown Austin, Travis Heights",
      primaryGoal: "More phone calls",
      comments:
        "Listing is claimed. Photos are current. We want calls for brakes and diagnostics, not just oil changes.",
      referralSource: "Google search",
      internalNotes: "",
      agencyId: "agency_northstar",
      managerUserId: "user_leo",
    },
    {
      id: "cust_bloom_stem",
      createdAt: now,
      updatedAt: now,
      status: "new",
      contactName: "Priya Raman",
      email: "hello@bloomandstem.co",
      phone: "(206) 555-0174",
      role: "Owner",
      businessName: "Bloom & Stem",
      category: "Florist",
      address: "1551 15th Avenue",
      city: "Seattle",
      state: "WA",
      zip: "98122",
      website: "https://bloomandstem.co",
      googleMapsUrl: "https://maps.google.com/?cid=bloom-and-stem",
      keywords: [
        "florist near me",
        "same day flower delivery",
        "wedding florist Seattle",
        "birthday bouquet",
      ],
      serviceArea: "Capitol Hill, Central District, downtown Seattle",
      primaryGoal: "More direction requests",
      comments:
        "Walk-in traffic dropped after a new shop opened two blocks away. Same-day delivery terms matter most.",
      referralSource: "Instagram",
      internalNotes: "",
      agencyId: "",
      managerUserId: "",
    },
  ];
}

async function insertCustomer(customer: Customer) {
  await query(
    `INSERT INTO customers (
      id, created_at, updated_at, status, contact_name, email, phone, role,
      business_name, category, address, city, state, zip, website,
      google_maps_url, keywords, service_area, primary_goal, comments,
      referral_source, internal_notes, agency_id, manager_user_id
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
    )`,
    [
      customer.id,
      customer.createdAt,
      customer.updatedAt,
      customer.status,
      customer.contactName,
      customer.email,
      customer.phone,
      customer.role,
      customer.businessName,
      customer.category,
      customer.address,
      customer.city,
      customer.state,
      customer.zip,
      customer.website,
      customer.googleMapsUrl,
      customer.keywords,
      customer.serviceArea,
      customer.primaryGoal,
      customer.comments,
      customer.referralSource,
      customer.internalNotes,
      customer.agencyId,
      customer.managerUserId,
    ],
  );
}

async function ensureCustomers() {
  const { rows } = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM customers",
  );
  if (Number(rows[0]?.count || 0) > 0) return;
  for (const customer of seedCustomers()) {
    await query(
      `INSERT INTO customers (
        id, created_at, updated_at, status, contact_name, email, phone, role,
        business_name, category, address, city, state, zip, website,
        google_maps_url, keywords, service_area, primary_goal, comments,
        referral_source, internal_notes, agency_id, manager_user_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
      ) ON CONFLICT (id) DO NOTHING`,
      [
        customer.id,
        customer.createdAt,
        customer.updatedAt,
        customer.status,
        customer.contactName,
        customer.email,
        customer.phone,
        customer.role,
        customer.businessName,
        customer.category,
        customer.address,
        customer.city,
        customer.state,
        customer.zip,
        customer.website,
        customer.googleMapsUrl,
        customer.keywords,
        customer.serviceArea,
        customer.primaryGoal,
        customer.comments,
        customer.referralSource,
        customer.internalNotes,
        customer.agencyId,
        customer.managerUserId,
      ],
    );
  }
}

export async function listCustomers() {
  await ensureCustomers();
  const { rows } = await query(
    "SELECT * FROM customers ORDER BY created_at DESC",
  );
  return rows.map((row) => mapCustomer(row));
}

export async function getCustomer(id: string) {
  await ensureCustomers();
  const { rows } = await query("SELECT * FROM customers WHERE id = $1", [id]);
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function createCustomer(
  input: CustomerInput,
  extras?: { agencyId?: string; managerUserId?: string },
) {
  await ensureCustomers();
  const now = new Date().toISOString();
  const customer: Customer = {
    ...input,
    id: `cust_${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
    status: "new",
    internalNotes: "",
    agencyId: extras?.agencyId ?? "",
    managerUserId: extras?.managerUserId ?? "",
  };
  await insertCustomer(customer);
  return customer;
}

export async function updateCustomer(id: string, update: CustomerUpdate) {
  const current = await getCustomer(id);
  if (!current) return null;
  const next: Customer = {
    ...current,
    ...update,
    updatedAt: new Date().toISOString(),
  };
  await query(
    `UPDATE customers SET
      updated_at = $2, status = $3, keywords = $4, internal_notes = $5,
      comments = $6, agency_id = $7, manager_user_id = $8
     WHERE id = $1`,
    [
      id,
      next.updatedAt,
      next.status,
      next.keywords,
      next.internalNotes,
      next.comments,
      next.agencyId,
      next.managerUserId,
    ],
  );
  return next;
}

export async function deleteCustomer(id: string) {
  const result = await query("DELETE FROM customers WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
