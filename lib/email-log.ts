import { promises as fs } from "fs";
import path from "path";
import type { EmailLog } from "@/lib/types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "email-log.json");
const MAX_LOGS = 250;

let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readLogs(): Promise<EmailLog[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(LOG_FILE, "utf8");
    const parsed = JSON.parse(raw) as EmailLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listEmailLogs(limit = 40) {
  const logs = await readLogs();
  return logs.slice(0, limit);
}

export async function appendEmailLog(entry: EmailLog) {
  return withLock(async () => {
    const logs = await readLogs();
    logs.unshift(entry);
    const next = logs.slice(0, MAX_LOGS);
    const temp = `${LOG_FILE}.tmp`;
    await fs.writeFile(temp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(temp, LOG_FILE);
    return entry;
  });
}
