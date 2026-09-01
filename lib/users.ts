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

export async function createResetToken(userId: string) {
  return repo().createResetToken(userId);
}

export async function consumeResetToken(token: string) {
  return repo().consumeResetToken(token);
}
