import { promises as fs } from "fs";
import path from "path";
import { DEMO_AGENCY_IDS, DEMO_CUSTOMER_IDS } from "@/lib/demo-ids";
import type {
  Customer,
  CustomerExtras,
  CustomerInput,
  CustomerUpdate,
} from "@/lib/types";
export { customerStats } from "@/lib/stats";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "customers.json");

let writeChain: Promise<unknown> = Promise.resolve();

function normalizeCustomer(raw: Partial<Customer>): Customer | null {
  if (!raw?.id || !raw.businessName) return null;
  return {
    id: raw.id,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
    status: raw.status || "new",
    contactName: raw.contactName || "",
    email: raw.email || "",
    phone: raw.phone || "",
    role: raw.role || "",
    businessName: raw.businessName,
    category: raw.category || "",
    address: raw.address || "",
    city: raw.city || "",
    state: raw.state || "",
    zip: raw.zip || "",
    website: raw.website || "",
    googleMapsUrl: raw.googleMapsUrl || "",
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    serviceArea: raw.serviceArea || "",
    primaryGoal: raw.primaryGoal || "",
    comments: raw.comments || "",
    referralSource: raw.referralSource || "",
    internalNotes: raw.internalNotes || "",
    agencyId: raw.agencyId || "",
    managerUserId: raw.managerUserId || "",
    ownerUserId: raw.ownerUserId || "",
  };
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readCustomers(): Promise<Customer[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as Partial<Customer>[];
    if (!Array.isArray(parsed)) return [];
    const customers = parsed
      .map((item) => normalizeCustomer(item))
      .filter((item): item is Customer => Boolean(item));
    const kept = customers.filter(
      (item) =>
        !DEMO_CUSTOMER_IDS.includes(item.id) &&
        !DEMO_AGENCY_IDS.includes(item.agencyId),
    );
    if (kept.length !== customers.length) {
      await writeCustomers(kept);
    }
    return kept;
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

export async function createCustomer(
  input: CustomerInput,
  extras?: CustomerExtras,
) {
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
      agencyId: extras?.agencyId ?? "",
      managerUserId: extras?.managerUserId ?? "",
      ownerUserId: extras?.ownerUserId ?? "",
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
