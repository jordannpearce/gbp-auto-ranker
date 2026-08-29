import { isPostgres } from "@/lib/db";
import * as file from "@/lib/email-log-file";
import * as pg from "@/lib/email-log-pg";
import type { EmailLog } from "@/lib/types";

function repo() {
  return isPostgres() ? pg : file;
}

export async function listEmailLogs(limit = 40) {
  return repo().listEmailLogs(limit);
}

export async function appendEmailLog(entry: EmailLog) {
  return repo().appendEmailLog(entry);
}
