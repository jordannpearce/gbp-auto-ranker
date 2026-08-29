import { promises as fs } from "fs";
import path from "path";
import type { Customer, CustomerInput, CustomerUpdate } from "@/lib/types";
export { customerStats } from "@/lib/stats";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "customers.json");

let writeChain: Promise<unknown> = Promise.resolve();

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
      internalNotes: "Started map-pack campaign on weekday evenings and Saturday mornings.",
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
    },
  ];
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(seedCustomers(), null, 2),
      "utf8",
    );
  }
}

async function readCustomers(): Promise<Customer[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCustomers(customers: Customer[]) {
  await ensureStore();
  const temp = `${DATA_FILE}.tmp`;
  await fs.writeFile(temp, JSON.stringify(customers, null, 2), "utf8");
  await fs.rename(temp, DATA_FILE);
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function listCustomers() {
  const customers = await readCustomers();
  return customers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCustomer(id: string) {
  const customers = await readCustomers();
  return customers.find((customer) => customer.id === id) ?? null;
}

export async function createCustomer(input: CustomerInput) {
  return withLock(async () => {
    const customers = await readCustomers();
    const now = new Date().toISOString();
    const customer: Customer = {
      ...input,
      id: `cust_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
      status: "new",
      internalNotes: "",
    };
    customers.unshift(customer);
    await writeCustomers(customers);
    return customer;
  });
}

export async function updateCustomer(id: string, update: CustomerUpdate) {
  return withLock(async () => {
    const customers = await readCustomers();
    const index = customers.findIndex((customer) => customer.id === id);
    if (index === -1) return null;
    const next: Customer = {
      ...customers[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    customers[index] = next;
    await writeCustomers(customers);
    return next;
  });
}

export async function deleteCustomer(id: string) {
  return withLock(async () => {
    const customers = await readCustomers();
    const next = customers.filter((customer) => customer.id !== id);
    if (next.length === customers.length) return false;
    await writeCustomers(next);
    return true;
  });
}

