import type { EmailLog } from "@/lib/types";
import { iso, query } from "@/lib/db";

function mapLog(row: Record<string, unknown>): EmailLog {
  return {
    id: String(row.id),
    createdAt: iso(row.created_at as Date | string),
    kind: row.kind as EmailLog["kind"],
    to: String(row.recipient ?? ""),
    subject: String(row.subject ?? ""),
    status: row.status as EmailLog["status"],
    error: row.error ? String(row.error) : undefined,
    resendId: row.resend_id ? String(row.resend_id) : undefined,
  };
}

export async function listEmailLogs(limit = 40) {
  const { rows } = await query(
    "SELECT * FROM email_logs ORDER BY created_at DESC LIMIT $1",
    [limit],
  );
  return rows.map((row) => mapLog(row));
}

export async function appendEmailLog(entry: EmailLog) {
  await query(
    `INSERT INTO email_logs (id, created_at, kind, recipient, subject, status, error, resend_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      entry.id,
      entry.createdAt,
      entry.kind,
      entry.to,
      entry.subject,
      entry.status,
      entry.error ?? null,
      entry.resendId ?? null,
    ],
  );
  await query(
    `DELETE FROM email_logs WHERE id IN (
       SELECT id FROM email_logs ORDER BY created_at DESC OFFSET 250
     )`,
  );
  return entry;
}
