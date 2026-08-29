import { Pool, type PoolClient, type QueryResultRow } from "pg";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  agency_id TEXT NOT NULL DEFAULT '',
  email_verified_at TEXT NOT NULL DEFAULT '',
  confirm_token TEXT NOT NULL DEFAULT '',
  confirm_expires_at TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS agencies (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  name TEXT NOT NULL,
  website TEXT NOT NULL DEFAULT '',
  owner_user_id TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  zip TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT NOT NULL DEFAULT '',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  service_area TEXT NOT NULL DEFAULT '',
  primary_goal TEXT NOT NULL DEFAULT '',
  comments TEXT NOT NULL DEFAULT '',
  referral_source TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  agency_id TEXT NOT NULL DEFAULT '',
  manager_user_id TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  kind TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  resend_id TEXT
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_agency_idx ON users (agency_id);
CREATE INDEX IF NOT EXISTS customers_agency_idx ON customers (agency_id);
CREATE INDEX IF NOT EXISTS email_logs_created_idx ON email_logs (created_at DESC);
`;

export function isPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function sslOption() {
  const url = process.env.DATABASE_URL || "";
  if (process.env.PGSSLMODE === "disable") return undefined;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  if (url.includes(".railway.internal")) return undefined;
  return { rejectUnauthorized: false };
}

let pool: Pool | null = null;
let migrated = false;
let migrateChain: Promise<void> | null = null;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslOption(),
      max: 8,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
) {
  await ensureSchema();
  return getPool().query<T>(text, values);
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
) {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function iso(value: Date | string | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

export async function ensureSchema() {
  if (migrated) return;
  if (!migrateChain) {
    migrateChain = (async () => {
      await getPool().query(SCHEMA_SQL);
      migrated = true;
    })().catch((error) => {
      migrateChain = null;
      throw error;
    });
  }
  await migrateChain;
}
