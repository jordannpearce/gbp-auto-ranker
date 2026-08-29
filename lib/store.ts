import { isPostgres } from "@/lib/db";
import * as file from "@/lib/store-file";
import * as pg from "@/lib/store-pg";
import type { CustomerExtras, CustomerInput, CustomerUpdate } from "@/lib/types";

export { customerStats } from "@/lib/stats";

function repo() {
  return isPostgres() ? pg : file;
}

export async function listCustomers() {
  return repo().listCustomers();
}

export async function getCustomer(id: string) {
  return repo().getCustomer(id);
}

export async function createCustomer(
  input: CustomerInput,
  extras?: CustomerExtras,
) {
  return repo().createCustomer(input, extras);
}

export async function updateCustomer(id: string, update: CustomerUpdate) {
  return repo().updateCustomer(id, update);
}

export async function deleteCustomer(id: string) {
  return repo().deleteCustomer(id);
}
