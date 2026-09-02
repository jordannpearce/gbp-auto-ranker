import { promises as fs } from "fs";
import path from "path";
import { parseEmailList } from "@/lib/contact";
import { mergeInboxSources } from "@/lib/selected-inboxes";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "selected-inboxes.json");

let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readAll(): Promise<Record<string, string[]>> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as Record<
      string,
      string[]
    >;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(value: Record<string, string[]>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temp = `${FILE}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(temp, FILE);
}

export async function getSelectedInboxes(userId: string) {
  const all = await readAll();
  return parseEmailList(all[userId] ?? []);
}

export async function addSelectedInboxes(userId: string, incoming: string[]) {
  return withLock(async () => {
    const all = await readAll();
    const merged = mergeInboxSources(all[userId], incoming);
    if (merged.length === 0) delete all[userId];
    else all[userId] = merged;
    await writeAll(all);
    return merged;
  });
}

export async function clearSelectedInboxes(userId: string) {
  return withLock(async () => {
    const all = await readAll();
    delete all[userId];
    await writeAll(all);
  });
}
