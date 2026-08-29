import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_TEMPLATES,
  defaultTemplate,
  type EmailTemplate,
} from "@/lib/default-templates";
import { isPostgres, query } from "@/lib/db";
import type { EmailKind } from "@/lib/types";

export type EmailSettings = {
  apiKey: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
};

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "email-settings.json");
const TEMPLATES_FILE = path.join(DATA_DIR, "email-templates.json");

function normalizeSettings(raw: Partial<EmailSettings> | null): EmailSettings {
  return {
    apiKey: raw?.apiKey?.trim() || "",
    fromName: raw?.fromName?.trim() || "GBP Auto Ranker",
    fromEmail: raw?.fromEmail?.trim() || "",
    replyTo: raw?.replyTo?.trim() || "",
  };
}

function normalizeTemplate(
  kind: EmailKind,
  raw?: Partial<EmailTemplate>,
): EmailTemplate {
  const fallback = defaultTemplate(kind);
  return {
    kind,
    label: fallback.label,
    subject: raw?.subject?.trim() || fallback.subject,
    heading: raw?.heading?.trim() || fallback.heading,
    body: raw?.body?.trim() || fallback.body,
    ctaLabel: raw?.ctaLabel ?? fallback.ctaLabel,
    variables: fallback.variables,
  };
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(file: string, value: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(temp, file);
}

export async function getEmailSettings(): Promise<EmailSettings> {
  if (isPostgres()) {
    const { rows } = await query<{ key: string; value: string }>(
      "SELECT key, value FROM app_settings",
    );
    const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return normalizeSettings({
      apiKey: map.resend_api_key,
      fromName: map.resend_from_name,
      fromEmail: map.resend_from_email,
      replyTo: map.resend_reply_to,
    });
  }
  return normalizeSettings(
    await readJsonFile<Partial<EmailSettings>>(SETTINGS_FILE, {}),
  );
}

export async function saveEmailSettings(input: Partial<EmailSettings>) {
  const current = await getEmailSettings();
  const next = normalizeSettings({
    ...current,
    ...input,
    apiKey:
      input.apiKey !== undefined && input.apiKey.trim()
        ? input.apiKey.trim()
        : current.apiKey,
  });

  if (isPostgres()) {
    const pairs: Array<[string, string]> = [
      ["resend_api_key", next.apiKey],
      ["resend_from_name", next.fromName],
      ["resend_from_email", next.fromEmail],
      ["resend_reply_to", next.replyTo],
    ];
    for (const [key, value] of pairs) {
      await query(
        `INSERT INTO app_settings (key, value) VALUES ($1,$2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, value],
      );
    }
    return next;
  }

  await writeJsonFile(SETTINGS_FILE, next);
  return next;
}

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
  const stored = await readStoredTemplates();
  return DEFAULT_TEMPLATES.map((item) =>
    normalizeTemplate(item.kind, stored[item.kind]),
  );
}

export async function getEmailTemplate(kind: EmailKind) {
  const stored = await readStoredTemplates();
  return normalizeTemplate(kind, stored[kind]);
}

export async function saveEmailTemplate(
  input: Pick<EmailTemplate, "kind" | "subject" | "heading" | "body" | "ctaLabel">,
) {
  const next = normalizeTemplate(input.kind, input);
  if (isPostgres()) {
    await query(
      `INSERT INTO email_templates (kind, subject, heading, body, cta_label)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (kind) DO UPDATE SET
         subject = EXCLUDED.subject,
         heading = EXCLUDED.heading,
         body = EXCLUDED.body,
         cta_label = EXCLUDED.cta_label`,
      [next.kind, next.subject, next.heading, next.body, next.ctaLabel],
    );
    return next;
  }
  const stored = await readStoredTemplates();
  stored[next.kind] = next;
  await writeJsonFile(TEMPLATES_FILE, stored);
  return next;
}

async function readStoredTemplates() {
  const map: Partial<Record<EmailKind, Partial<EmailTemplate>>> = {};
  if (isPostgres()) {
    const { rows } = await query<{
      kind: EmailKind;
      subject: string;
      heading: string;
      body: string;
      cta_label: string;
    }>("SELECT kind, subject, heading, body, cta_label FROM email_templates");
    for (const row of rows) {
      map[row.kind] = {
        kind: row.kind,
        subject: row.subject,
        heading: row.heading,
        body: row.body,
        ctaLabel: row.cta_label,
      };
    }
    return map;
  }
  const raw = await readJsonFile<Partial<Record<EmailKind, Partial<EmailTemplate>>>>(
    TEMPLATES_FILE,
    {},
  );
  return raw;
}

export function maskApiKey(apiKey: string) {
  if (!apiKey) return "";
  if (apiKey.length <= 8) return "••••";
  return `${apiKey.slice(0, 3)}••••${apiKey.slice(-4)}`;
}
