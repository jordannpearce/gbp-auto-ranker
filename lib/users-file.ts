import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "@/lib/passwords";
import { DEMO_AGENCY_IDS, DEMO_USER_IDS } from "@/lib/demo-ids";
import {
  DEMO_ADMIN_EMAIL,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_ID,
  PRIMARY_ADMIN_NAME,
  PRIMARY_ADMIN_PASSWORD,
} from "@/lib/primary-admin";
import { normalizeAgency, normalizeLeadPreference } from "@/lib/leads";
import type {
  Agency,
  LeadPreference,
  PasswordReset,
  PublicUser,
  User,
} from "@/lib/types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const AGENCIES_FILE = path.join(DATA_DIR, "agencies.json");
const RESETS_FILE = path.join(DATA_DIR, "resets.json");
const CONFIRM_HOURS = 48;

let writeChain: Promise<unknown> = Promise.resolve();
let accountsReady = false;
let bootAccounts: Promise<void> | null = null;

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(temp, file);
}

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

export function normalizeUser(raw: Partial<User>): User | null {
  if (!raw?.id || !raw.email || !raw.passwordHash || !raw.role) return null;
  return {
    id: raw.id,
    createdAt: raw.createdAt || new Date().toISOString(),
    name: raw.name || "",
    email: raw.email,
    passwordHash: raw.passwordHash,
    role: raw.role,
    agencyId: raw.agencyId || "",
    emailVerifiedAt:
      raw.emailVerifiedAt !== undefined
        ? raw.emailVerifiedAt
        : raw.createdAt || new Date().toISOString(),
    confirmToken: raw.confirmToken || "",
    confirmExpiresAt: raw.confirmExpiresAt || "",
  };
}

async function migratePrimaryAdmin() {
  const users = (await readJson<Partial<User>[]>(USERS_FILE, []))
    .map((item) => normalizeUser(item))
    .filter((item): item is User => Boolean(item));
  if (users.length === 0) return;

  const primary = users.find(
    (user) => user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL,
  );
  const demo = users.find(
    (user) => user.email.toLowerCase() === DEMO_ADMIN_EMAIL,
  );
  const now = new Date().toISOString();
  let changed = false;

  if (!primary && demo) {
    demo.name = PRIMARY_ADMIN_NAME;
    demo.email = PRIMARY_ADMIN_EMAIL;
    demo.role = "admin";
    demo.agencyId = "";
    demo.passwordHash = await hashPassword(PRIMARY_ADMIN_PASSWORD);
    demo.emailVerifiedAt = demo.emailVerifiedAt || now;
    demo.confirmToken = "";
    demo.confirmExpiresAt = "";
    changed = true;
  } else if (!primary) {
    users.unshift({
      id: PRIMARY_ADMIN_ID,
      createdAt: now,
      name: PRIMARY_ADMIN_NAME,
      email: PRIMARY_ADMIN_EMAIL,
      passwordHash: await hashPassword(PRIMARY_ADMIN_PASSWORD),
      role: "admin",
      agencyId: "",
      ...confirmFields(true, now),
    });
    changed = true;
  }

  const next = users.filter(
    (user) => user.email.toLowerCase() !== DEMO_ADMIN_EMAIL,
  );
  if (next.length !== users.length) changed = true;
  if (changed) await writeJson(USERS_FILE, next);
}

async function ensureAccounts() {
  if (accountsReady) return;
  if (!bootAccounts) {
    bootAccounts = (async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        await fs.access(USERS_FILE);
      } catch {
        const now = new Date().toISOString();
        const adminHash = await hashPassword(PRIMARY_ADMIN_PASSWORD);
        const verified = confirmFields(true, now);
        const users: User[] = [
          {
            id: PRIMARY_ADMIN_ID,
            createdAt: now,
            name: PRIMARY_ADMIN_NAME,
            email: PRIMARY_ADMIN_EMAIL,
            passwordHash: adminHash,
            role: "admin",
            agencyId: "",
            ...verified,
          },
        ];
        await writeJson(USERS_FILE, users);
        await writeJson(AGENCIES_FILE, []);
        await writeJson(RESETS_FILE, []);
      }
      await migratePrimaryAdmin();
      await purgeDemoAccounts();
      accountsReady = true;
    })().catch((error) => {
      bootAccounts = null;
      throw error;
    });
  }
  await bootAccounts;
}

async function purgeDemoAccounts() {
  const rawUsers = await readJson<Partial<User>[]>(USERS_FILE, []);
  const users = rawUsers
    .map((item) => normalizeUser(item))
    .filter((item): item is User => Boolean(item));
  const keptUsers = users.filter(
    (user) =>
      !DEMO_USER_IDS.includes(user.id) &&
      !DEMO_AGENCY_IDS.includes(user.agencyId),
  );
  const agencies = (await readJson<Partial<Agency>[]>(AGENCIES_FILE, []))
    .map((item) => normalizeAgency(item))
    .filter((item): item is Agency => Boolean(item));
  const keptAgencies = agencies.filter(
    (agency) => !DEMO_AGENCY_IDS.includes(agency.id),
  );
  if (keptUsers.length !== users.length) {
    await writeJson(USERS_FILE, keptUsers);
  }
  if (keptAgencies.length !== agencies.length) {
    await writeJson(AGENCIES_FILE, keptAgencies);
  }
}

async function readUsers() {
  await ensureAccounts();
  const raw = await readJson<Partial<User>[]>(USERS_FILE, []);
  return raw
    .map((item) => normalizeUser(item))
    .filter((item): item is User => Boolean(item));
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    createdAt: user.createdAt,
    name: user.name,
    email: user.email,
    role: user.role,
    agencyId: user.agencyId,
    emailVerifiedAt: user.emailVerifiedAt,
  };
}

export function isEmailVerified(user: Pick<User, "emailVerifiedAt">) {
  return Boolean(user.emailVerifiedAt);
}

export async function listUsers() {
  return readUsers();
}

export async function getUser(id: string) {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function getUserByEmail(email: string) {
  const users = await readUsers();
  const needle = email.trim().toLowerCase();
  return users.find((user) => user.email.toLowerCase() === needle) ?? null;
}

export async function listAgencyUsers(agencyId: string) {
  const users = await readUsers();
  return users.filter((user) => user.agencyId === agencyId);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  agencyId: string;
  verified?: boolean;
}) {
  return withLock(async () => {
    await ensureAccounts();
    const users = await readUsers();
    const email = input.email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === email)) {
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
    users.push(user);
    await writeJson(USERS_FILE, users);
    return { user };
  });
}

export async function updateUser(
  id: string,
  update: {
    name?: string;
    email?: string;
    role?: User["role"];
    agencyId?: string;
    password?: string;
  },
) {
  return withLock(async () => {
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return { error: "That user was not found." as const };
    const email = update.email?.trim().toLowerCase();
    if (
      email &&
      users.some((user) => user.id !== id && user.email.toLowerCase() === email)
    ) {
      return { error: "An account with that email already exists." as const };
    }
    const current = users[index];
    const next: User = {
      ...current,
      name: update.name?.trim() || current.name,
      email: email || current.email,
      role: update.role ?? current.role,
      agencyId:
        update.agencyId !== undefined ? update.agencyId : current.agencyId,
      passwordHash: update.password
        ? await hashPassword(update.password)
        : current.passwordHash,
    };
    users[index] = next;
    await writeJson(USERS_FILE, users);
    return { user: next };
  });
}

export async function deleteUser(id: string) {
  return withLock(async () => {
    const users = await readUsers();
    const nextUsers = users.filter((user) => user.id !== id);
    if (nextUsers.length === users.length) return false;
    const resets = (await readJson<PasswordReset[]>(RESETS_FILE, [])).filter(
      (item) => item.userId !== id,
    );
    await writeJson(USERS_FILE, nextUsers);
    await writeJson(RESETS_FILE, resets);
    return true;
  });
}

export async function updateUserPassword(id: string, password: string) {
  return withLock(async () => {
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return false;
    users[index] = {
      ...users[index],
      passwordHash: await hashPassword(password),
    };
    await writeJson(USERS_FILE, users);
    return true;
  });
}

export async function issueConfirmToken(userId: string) {
  return withLock(async () => {
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index === -1) return null;
    if (users[index].emailVerifiedAt) return users[index];
    users[index] = {
      ...users[index],
      ...confirmFields(false),
    };
    await writeJson(USERS_FILE, users);
    return users[index];
  });
}

export async function confirmUserByToken(token: string) {
  return withLock(async () => {
    const users = await readUsers();
    const index = users.findIndex(
      (user) => user.confirmToken && user.confirmToken === token,
    );
    if (index === -1) return { error: "invalid" as const };
    const user = users[index];
    if (user.confirmExpiresAt && Date.parse(user.confirmExpiresAt) <= Date.now()) {
      return { error: "expired" as const, user };
    }
    const next: User = {
      ...user,
      emailVerifiedAt: new Date().toISOString(),
      confirmToken: "",
      confirmExpiresAt: "",
    };
    users[index] = next;
    await writeJson(USERS_FILE, users);
    return { user: next };
  });
}

async function readAgencies() {
  await ensureAccounts();
  const raw = await readJson<Partial<Agency>[]>(AGENCIES_FILE, []);
  return raw
    .map((item) => normalizeAgency(item))
    .filter((item): item is Agency => Boolean(item));
}

export async function listAgencies() {
  return readAgencies();
}

export async function getAgency(id: string) {
  const agencies = await listAgencies();
  return agencies.find((agency) => agency.id === id) ?? null;
}

export async function createAgency(input: {
  name: string;
  website: string;
  ownerName: string;
  email: string;
  password: string;
  verified?: boolean;
  leadPreference?: LeadPreference;
}) {
  return withLock(async () => {
    await ensureAccounts();
    const users = await readUsers();
    const agencies = await readAgencies();
    const email = input.email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === email)) {
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
      leadPreference: normalizeLeadPreference(input.leadPreference),
    };
    users.push(user);
    agencies.push(agency);
    await writeJson(USERS_FILE, users);
    await writeJson(AGENCIES_FILE, agencies);
    return { user, agency };
  });
}

export async function deleteAgency(id: string) {
  return withLock(async () => {
    await ensureAccounts();
    const agencies = await readAgencies();
    const nextAgencies = agencies.filter((agency) => agency.id !== id);
    if (nextAgencies.length === agencies.length) return false;
    const users = await readUsers();
    const removedIds = new Set<string>();
    const nextUsers = users.flatMap((user) => {
      if (user.agencyId !== id || user.role === "admin") return [user];
      if (user.role === "business_owner") {
        return [{ ...user, agencyId: "" }];
      }
      removedIds.add(user.id);
      return [];
    });
    const resets = (await readJson<PasswordReset[]>(RESETS_FILE, [])).filter(
      (item) => !removedIds.has(item.userId),
    );
    await writeJson(USERS_FILE, nextUsers);
    await writeJson(AGENCIES_FILE, nextAgencies);
    await writeJson(RESETS_FILE, resets);
    return true;
  });
}

export async function updateAgency(
  id: string,
  update: Partial<Pick<Agency, "name" | "website" | "leadPreference" | "ownerUserId">>,
) {
  return withLock(async () => {
    await ensureAccounts();
    const agencies = await readAgencies();
    const index = agencies.findIndex((agency) => agency.id === id);
    if (index === -1) return null;
    const next: Agency = {
      ...agencies[index],
      name: update.name?.trim() || agencies[index].name,
      website:
        update.website !== undefined
          ? update.website.trim()
          : agencies[index].website,
      leadPreference:
        update.leadPreference !== undefined
          ? normalizeLeadPreference(update.leadPreference)
          : agencies[index].leadPreference,
      ownerUserId:
        update.ownerUserId !== undefined
          ? update.ownerUserId
          : agencies[index].ownerUserId,
    };
    agencies[index] = next;
    await writeJson(AGENCIES_FILE, agencies);
    return next;
  });
}

export async function createResetToken(userId: string) {
  return withLock(async () => {
    await ensureAccounts();
    const resets = (await readJson<PasswordReset[]>(RESETS_FILE, [])).filter(
      (item) => item.userId !== userId && Date.parse(item.expiresAt) > Date.now(),
    );
    const reset: PasswordReset = {
      token: crypto.randomUUID().replaceAll("-", ""),
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    resets.push(reset);
    await writeJson(RESETS_FILE, resets);
    return reset;
  });
}

export async function consumeResetToken(token: string) {
  return withLock(async () => {
    const resets = await readJson<PasswordReset[]>(RESETS_FILE, []);
    const match = resets.find((item) => item.token === token);
    const next = resets.filter((item) => item.token !== token);
    await writeJson(RESETS_FILE, next);
    if (!match || Date.parse(match.expiresAt) <= Date.now()) return null;
    return match;
  });
}
