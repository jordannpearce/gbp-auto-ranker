import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "@/lib/passwords";
import type {
  Agency,
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

async function ensureAccounts() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
    return;
  } catch {
    const now = new Date().toISOString();
    const adminHash = await hashPassword("Admin1234!");
    const agencyHash = await hashPassword("Agency1234!");
    const verified = confirmFields(true, now);
    const users: User[] = [
      {
        id: "user_admin",
        createdAt: now,
        name: "GBP Admin",
        email: "admin@gbpautoranker.com",
        passwordHash: adminHash,
        role: "admin",
        agencyId: "",
        ...verified,
      },
      {
        id: "user_maya",
        createdAt: now,
        name: "Maya Chen",
        email: "maya@northstarlocal.com",
        passwordHash: agencyHash,
        role: "agency_owner",
        agencyId: "agency_northstar",
        ...verified,
      },
      {
        id: "user_leo",
        createdAt: now,
        name: "Leo Hart",
        email: "leo@northstarlocal.com",
        passwordHash: agencyHash,
        role: "agency_member",
        agencyId: "agency_northstar",
        ...verified,
      },
    ];
    const agencies: Agency[] = [
      {
        id: "agency_northstar",
        createdAt: now,
        name: "North Star Local",
        website: "https://northstarlocal.com",
        ownerUserId: "user_maya",
      },
    ];
    await writeJson(USERS_FILE, users);
    await writeJson(AGENCIES_FILE, agencies);
    await writeJson(RESETS_FILE, []);
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

export async function listAgencies() {
  await ensureAccounts();
  return readJson<Agency[]>(AGENCIES_FILE, []);
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
}) {
  return withLock(async () => {
    await ensureAccounts();
    const users = await readUsers();
    const agencies = await readJson<Agency[]>(AGENCIES_FILE, []);
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
      ...confirmFields(false, now),
    };
    const agency: Agency = {
      id: agencyId,
      createdAt: now,
      name: input.name.trim(),
      website: input.website.trim(),
      ownerUserId: user.id,
    };
    users.push(user);
    agencies.push(agency);
    await writeJson(USERS_FILE, users);
    await writeJson(AGENCIES_FILE, agencies);
    return { user, agency };
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
