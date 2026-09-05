import { isPostgres } from "@/lib/db";
import * as file from "@/lib/users-file";
import * as pg from "@/lib/users-pg";

export {
  isEmailVerified,
  normalizeUser,
  toPublicUser,
} from "@/lib/users-file";

function repo() {
  return isPostgres() ? pg : file;
}

export async function listUsers() {
  return repo().listUsers();
}

export async function getUser(id: string) {
  return repo().getUser(id);
}

export async function getUserByEmail(email: string) {
  return repo().getUserByEmail(email);
}

export async function findUserForPasswordReset(email: string) {
  const needle = email.trim().toLowerCase();
  if (!needle.includes("@")) return null;
  const direct = await getUserByEmail(needle);
  if (direct) return direct;
  const users = await listUsers();
  return (
    users.find((user) => user.email.trim().toLowerCase() === needle) ?? null
  );
}

export async function listAgencyUsers(agencyId: string) {
  return repo().listAgencyUsers(agencyId);
}

export async function createUser(
  input: Parameters<typeof file.createUser>[0],
) {
  return repo().createUser(input);
}

export async function updateUserPassword(id: string, password: string) {
  return repo().updateUserPassword(id, password);
}

export async function updateUser(
  id: string,
  update: Parameters<typeof file.updateUser>[1],
) {
  return repo().updateUser(id, update);
}

export async function deleteUser(id: string) {
  return repo().deleteUser(id);
}

export async function issueConfirmToken(userId: string) {
  return repo().issueConfirmToken(userId);
}

export async function confirmUserByToken(token: string) {
  return repo().confirmUserByToken(token);
}

export async function listAgencies() {
  return repo().listAgencies();
}

export async function getAgency(id: string) {
  return repo().getAgency(id);
}

export async function createAgency(
  input: Parameters<typeof file.createAgency>[0],
) {
  return repo().createAgency(input);
}

export async function deleteAgency(id: string) {
  return repo().deleteAgency(id);
}

export async function updateAgency(
  id: string,
  update: Parameters<typeof file.updateAgency>[1],
) {
  return repo().updateAgency(id, update);
}

export async function createResetToken(userId: string) {
  return repo().createResetToken(userId);
}

export async function consumeResetToken(token: string) {
  return repo().consumeResetToken(token);
}
