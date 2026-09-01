import { hashPassword } from "@/lib/passwords";
import { iso, query, withTransaction } from "@/lib/db";
import { DEMO_AGENCY_IDS, DEMO_CUSTOMER_IDS, DEMO_USER_IDS } from "@/lib/demo-ids";
import {
  DEMO_ADMIN_EMAIL,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_ID,
  PRIMARY_ADMIN_NAME,
  PRIMARY_ADMIN_PASSWORD,
} from "@/lib/primary-admin";
import type { Agency, PasswordReset, User } from "@/lib/types";
import { normalizeUser } from "@/lib/users-file";

const CONFIRM_HOURS = 48;

function confirmFields(verified: boolean, now = new Date().toISOString()) {
  if (verified) {
    return {
      emailVerifiedAt: now,
      confirmToken: "",
      confirmExpiresAt: "",
    };
  }
  return {
    emailVerifiedAt: "",
    confirmToken: crypto.randomUUID().replaceAll("-", ""),
    confirmExpiresAt: new Date(
      Date.now() + CONFIRM_HOURS * 60 * 60 * 1000,
    ).toISOString(),
  };
}

function mapUser(row: Record<string, unknown>): User {
  const user = normalizeUser({
    id: String(row.id),
    createdAt: iso(row.created_at as Date | string),
    name: String(row.name ?? ""),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    role: row.role as User["role"],
    agencyId: String(row.agency_id ?? ""),
    emailVerifiedAt: String(row.email_verified_at ?? ""),
    confirmToken: String(row.confirm_token ?? ""),
    confirmExpiresAt: String(row.confirm_expires_at ?? ""),
  });
  if (!user) {
    throw new Error("Could not read user row.");
  }
  return user;
}

function mapAgency(row: Record<string, unknown>): Agency {
  return {
    id: String(row.id),
    createdAt: iso(row.created_at as Date | string),
    name: String(row.name ?? ""),
    website: String(row.website ?? ""),
    ownerUserId: String(row.owner_user_id ?? ""),
  };
}

async function insertUser(user: User) {
  await query(
    `INSERT INTO users (
      id, created_at, name, email, password_hash, role, agency_id,
      email_verified_at, confirm_token, confirm_expires_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      user.id,
      user.createdAt,
      user.name,
      user.email,
      user.passwordHash,
      user.role,
      user.agencyId,
      user.emailVerifiedAt,
      user.confirmToken,
      user.confirmExpiresAt,
    ],
  );
}

async function migratePrimaryAdmin() {
  const primary = await query("SELECT id FROM users WHERE lower(email) = lower($1)", [
    PRIMARY_ADMIN_EMAIL,
  ]);
  const demo = await query("SELECT * FROM users WHERE lower(email) = lower($1)", [
    DEMO_ADMIN_EMAIL,
  ]);
  const now = new Date().toISOString();

  if (primary.rows.length === 0 && demo.rows[0]) {
    await query(
      `UPDATE users SET
        name = $2, email = $3, password_hash = $4, role = 'admin', agency_id = '',
        email_verified_at = COALESCE(NULLIF(email_verified_at, ''), $5),
        confirm_token = '', confirm_expires_at = ''
       WHERE id = $1`,
      [
        demo.rows[0].id,
        PRIMARY_ADMIN_NAME,
        PRIMARY_ADMIN_EMAIL,
        await hashPassword(PRIMARY_ADMIN_PASSWORD),
        now,
      ],
    );
  } else if (primary.rows.length === 0) {
    const verified = confirmFields(true, now);
    await query(
      `INSERT INTO users (
        id, created_at, name, email, password_hash, role, agency_id,
        email_verified_at, confirm_token, confirm_expires_at
      ) VALUES ($1,$2,$3,$4,$5,'admin','',$6,$7,$8)`,
      [
        PRIMARY_ADMIN_ID,
        now,
        PRIMARY_ADMIN_NAME,
        PRIMARY_ADMIN_EMAIL,
        await hashPassword(PRIMARY_ADMIN_PASSWORD),
        verified.emailVerifiedAt,
        verified.confirmToken,
        verified.confirmExpiresAt,
      ],
    );
  }

  await query("DELETE FROM users WHERE lower(email) = lower($1)", [
    DEMO_ADMIN_EMAIL,
  ]);
}

async function ensureAccounts() {
  const { rows } = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM users",
  );
  if (Number(rows[0]?.count || 0) > 0) {
    await migratePrimaryAdmin();
    await purgeDemoAccounts();
    return;
  }

  const now = new Date().toISOString();
  const adminHash = await hashPassword(PRIMARY_ADMIN_PASSWORD);
  const verified = confirmFields(true, now);
  await query(
    `INSERT INTO users (
      id, created_at, name, email, password_hash, role, agency_id,
      email_verified_at, confirm_token, confirm_expires_at
    ) VALUES ($1,$2,$3,$4,$5,'admin','',$6,$7,$8)
    ON CONFLICT (id) DO NOTHING`,
    [
      PRIMARY_ADMIN_ID,
      now,
      PRIMARY_ADMIN_NAME,
      PRIMARY_ADMIN_EMAIL,
      adminHash,
      verified.emailVerifiedAt,
      verified.confirmToken,
      verified.confirmExpiresAt,
    ],
  );
  await purgeDemoAccounts();
}

async function purgeDemoAccounts() {
  await query(
    "DELETE FROM customers WHERE id = ANY($1::text[]) OR agency_id = ANY($2::text[])",
    [DEMO_CUSTOMER_IDS, DEMO_AGENCY_IDS],
  );
  await query(
    "DELETE FROM users WHERE id = ANY($1::text[]) OR agency_id = ANY($2::text[])",
    [DEMO_USER_IDS, DEMO_AGENCY_IDS],
  );
  await query("DELETE FROM agencies WHERE id = ANY($1::text[])", [
    DEMO_AGENCY_IDS,
  ]);
}

export async function listUsers() {
  await ensureAccounts();
  const { rows } = await query("SELECT * FROM users ORDER BY created_at ASC");
  return rows.map((row) => mapUser(row));
}

export async function getUser(id: string) {
  await ensureAccounts();
  const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function getUserByEmail(email: string) {
  await ensureAccounts();
  const { rows } = await query(
    "SELECT * FROM users WHERE lower(email) = lower($1)",
    [email.trim()],
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function listAgencyUsers(agencyId: string) {
  await ensureAccounts();
  const { rows } = await query(
    "SELECT * FROM users WHERE agency_id = $1 ORDER BY created_at ASC",
    [agencyId],
  );
  return rows.map((row) => mapUser(row));
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  agencyId: string;
  verified?: boolean;
}) {
  await ensureAccounts();
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "An account with that email already exists." as const };
  }
  const now = new Date().toISOString();
  const user: User = {
    id: `user_${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    agencyId: input.agencyId,
    ...confirmFields(input.verified !== false, now),
  };
  try {
    await insertUser(user);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { error: "An account with that email already exists." as const };
    }
    throw error;
  }
  return { user };
}

export async function updateUserPassword(id: string, password: string) {
  const result = await query(
    "UPDATE users SET password_hash = $2 WHERE id = $1",
    [id, await hashPassword(password)],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function issueConfirmToken(userId: string) {
  const user = await getUser(userId);
  if (!user) return null;
  if (user.emailVerifiedAt) return user;
  const next = { ...user, ...confirmFields(false) };
  await query(
    `UPDATE users SET confirm_token = $2, confirm_expires_at = $3 WHERE id = $1`,
    [userId, next.confirmToken, next.confirmExpiresAt],
  );
  return next;
}

export async function confirmUserByToken(token: string) {
  const { rows } = await query(
    "SELECT * FROM users WHERE confirm_token = $1 AND confirm_token <> ''",
    [token],
  );
  if (!rows[0]) return { error: "invalid" as const };
  const user = mapUser(rows[0]);
  if (user.confirmExpiresAt && Date.parse(user.confirmExpiresAt) <= Date.now()) {
    return { error: "expired" as const, user };
  }
  const next: User = {
    ...user,
    emailVerifiedAt: new Date().toISOString(),
    confirmToken: "",
    confirmExpiresAt: "",
  };
  await query(
    `UPDATE users SET email_verified_at = $2, confirm_token = '', confirm_expires_at = '' WHERE id = $1`,
    [user.id, next.emailVerifiedAt],
  );
  return { user: next };
}

export async function listAgencies() {
  await ensureAccounts();
  const { rows } = await query("SELECT * FROM agencies ORDER BY created_at ASC");
  return rows.map((row) => mapAgency(row));
}

export async function getAgency(id: string) {
  await ensureAccounts();
  const { rows } = await query("SELECT * FROM agencies WHERE id = $1", [id]);
  return rows[0] ? mapAgency(rows[0]) : null;
}

export async function createAgency(input: {
  name: string;
  website: string;
  ownerName: string;
  email: string;
  password: string;
  verified?: boolean;
}) {
  await ensureAccounts();
  const email = input.email.trim().toLowerCase();
  if (await getUserByEmail(email)) {
    return { error: "An account with that email already exists." as const };
  }
  const now = new Date().toISOString();
  const agencyId = `agency_${crypto.randomUUID().slice(0, 8)}`;
  const user: User = {
    id: `user_${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    name: input.ownerName.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: "agency_owner",
    agencyId,
    ...confirmFields(input.verified === true, now),
  };
  const agency: Agency = {
    id: agencyId,
    createdAt: now,
    name: input.name.trim(),
    website: input.website.trim(),
    ownerUserId: user.id,
  };
  try {
    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO users (
          id, created_at, name, email, password_hash, role, agency_id,
          email_verified_at, confirm_token, confirm_expires_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          user.id,
          user.createdAt,
          user.name,
          user.email,
          user.passwordHash,
          user.role,
          user.agencyId,
          user.emailVerifiedAt,
          user.confirmToken,
          user.confirmExpiresAt,
        ],
      );
      await client.query(
        `INSERT INTO agencies (id, created_at, name, website, owner_user_id)
         VALUES ($1,$2,$3,$4,$5)`,
        [agency.id, agency.createdAt, agency.name, agency.website, agency.ownerUserId],
      );
    });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { error: "An account with that email already exists." as const };
    }
    throw error;
  }
  return { user, agency };
}

export async function deleteAgency(id: string) {
  await ensureAccounts();
  const agency = await getAgency(id);
  if (!agency) return false;
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE users SET agency_id = '' WHERE agency_id = $1 AND role = 'business_owner'`,
      [id],
    );
    await client.query(
      `DELETE FROM users WHERE agency_id = $1 AND role IN ('agency_owner', 'agency_member')`,
      [id],
    );
    await client.query("DELETE FROM agencies WHERE id = $1", [id]);
  });
  return true;
}

export async function createResetToken(userId: string) {
  await query(
    "DELETE FROM password_resets WHERE user_id = $1 OR expires_at <= NOW()",
    [userId],
  );
  const reset: PasswordReset = {
    token: crypto.randomUUID().replaceAll("-", ""),
    userId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
  await query(
    "INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1,$2,$3)",
    [reset.token, reset.userId, reset.expiresAt],
  );
  return reset;
}

export async function consumeResetToken(token: string) {
  const { rows } = await query(
    "SELECT token, user_id, expires_at FROM password_resets WHERE token = $1",
    [token],
  );
  await query("DELETE FROM password_resets WHERE token = $1", [token]);
  if (!rows[0]) return null;
  const expiresAt = iso(rows[0].expires_at as Date | string);
  if (Date.parse(expiresAt) <= Date.now()) return null;
  return {
    token: String(rows[0].token),
    userId: String(rows[0].user_id),
    expiresAt,
  };
}
