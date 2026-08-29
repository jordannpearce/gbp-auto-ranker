import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAdmin } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { EMAIL_TEMPLATE_META } from "@/lib/default-templates";
import { listEmailLogs } from "@/lib/email-log";
import { formatDateTime } from "@/lib/format";
import { fromAddress, isEmailConfigured } from "@/lib/mail";
import {
  getEmailSettings,
  listEmailTemplates,
  maskApiKey,
} from "@/lib/settings";
import { listCustomers } from "@/lib/store";
import {
  BROADCAST_KINDS,
  EMAIL_KINDS,
  type BroadcastKind,
  type EmailKind,
} from "@/lib/types";
import { listUsers } from "@/lib/users";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Emails",
};

export const dynamic = "force-dynamic";

function kindLabel(kind: string) {
  return EMAIL_TEMPLATE_META[kind as EmailKind]?.label || kind;
}

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    delivered?: string;
    logged?: string;
    failed?: string;
    settings?: string;
    template?: string;
    edit?: string;
    compose?: string;
  }>;
}) {
  const { user, agency } = await loadDashboardUser();
  if (!isAdmin(user)) redirect("/dashboard");
  const params = await searchParams;
  const {
    error,
    sent,
    delivered,
    logged,
    failed,
    settings,
    template,
    edit,
    compose,
  } = params;

  const [logs, users, customers, mailSettings, templates, configured, from] =
    await Promise.all([
      listEmailLogs(30),
      listUsers(),
      listCustomers(),
      getEmailSettings(),
      listEmailTemplates(),
      isEmailConfigured(),
      fromAddress(),
    ]);

  const editingKind = EMAIL_KINDS.includes(edit as EmailKind)
    ? (edit as EmailKind)
    : null;
  const editing = editingKind
    ? templates.find((item) => item.kind === editingKind)
    : null;
  const composeKind = BROADCAST_KINDS.includes(compose as BroadcastKind)
    ? (compose as BroadcastKind)
    : "info";
  const composeTemplate = templates.find((item) => item.kind === composeKind);
  const maskedKey = maskApiKey(mailSettings.apiKey);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
            Emails
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Store your Resend API key and from-address here, then edit the
            templates used for welcome, activation, resets, and campaign mail.
            Broadcasts stay on this page. Agency users cannot see this screen.
          </p>
          {error ? (
            <p
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>

        <section className="rounded-2xl border border-border bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-charcoal">
                Resend connection
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sending as {from}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                configured
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-800",
              )}
            >
              {configured ? "API key saved" : "Logging only"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Paste the API key from your Resend account and a from-address on a
            domain you verified there. Leave the key field blank to keep the
            current key. Environment variables are used only if nothing is
            saved here.
          </p>
          <form
            action="/api/emails/settings"
            method="post"
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <Label htmlFor="apiKey">Resend API key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                autoComplete="off"
                className="mt-2"
                placeholder={maskedKey || "re_xxxxxxxx"}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {maskedKey
                  ? `Current key: ${maskedKey}`
                  : "No key saved yet. Sends will be written to the log until you add one."}
              </p>
            </div>
            <div>
              <Label htmlFor="fromName">From name</Label>
              <Input
                id="fromName"
                name="fromName"
                className="mt-2"
                defaultValue={mailSettings.fromName}
                placeholder="GBP Auto Ranker"
              />
            </div>
            <div>
              <Label htmlFor="fromEmail">From email</Label>
              <Input
                id="fromEmail"
                name="fromEmail"
                type="email"
                className="mt-2"
                defaultValue={mailSettings.fromEmail}
                placeholder="hello@yourdomain.com"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="replyTo">Reply-to</Label>
              <Input
                id="replyTo"
                name="replyTo"
                type="email"
                className="mt-2"
                defaultValue={mailSettings.replyTo}
                placeholder="Optional. Replies go here if set."
              />
            </div>
            {settings ? (
              <p className="text-sm text-emerald-700 sm:col-span-2" role="status">
                Resend settings saved.
              </p>
            ) : null}
            <button
              type="submit"
              className={cn(
                buttonVariants(),
                "h-10 w-fit px-4 font-semibold brand-gradient text-white",
              )}
            >
              Save connection
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Audiences now: {users.length} users ·{" "}
            {users.filter((item) => item.role === "agency_owner").length} agency
            owners · {customers.filter((item) => item.email).length} customer
            contacts
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-charcoal">
              Email templates
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These are the messages sent automatically. Use{" "}
              <code className="rounded bg-surface px-1 py-0.5 text-xs">
                {"{{variable}}"}
              </code>{" "}
              placeholders. Marketing, info, and product-update copy here is
              the starting point for broadcasts.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {templates.map((item) => (
              <li
                key={item.kind}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-charcoal">{item.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.subject}
                  </p>
                </div>
                <Link
                  href={`/dashboard/emails?edit=${item.kind}`}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-9 w-fit px-3",
                    editingKind === item.kind && "border-primary text-primary",
                  )}
                >
                  {editingKind === item.kind ? "Editing" : "Edit"}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {editing ? (
          <section className="rounded-2xl border border-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-charcoal">
                  Edit {editing.label}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Variables:{" "}
                  {editing.variables.map((name) => `{{${name}}}`).join(" · ")}
                </p>
              </div>
              <Link
                href="/dashboard/emails"
                className="text-sm font-medium text-primary hover:underline"
              >
                Close
              </Link>
            </div>
            <form
              action="/api/emails/templates"
              method="post"
              className="mt-4 grid gap-4"
            >
              <input type="hidden" name="kind" value={editing.kind} />
              <div>
                <Label htmlFor="template-subject">Subject</Label>
                <Input
                  id="template-subject"
                  name="subject"
                  required
                  maxLength={200}
                  className="mt-2"
                  defaultValue={editing.subject}
                />
              </div>
              <div>
                <Label htmlFor="template-heading">Heading</Label>
                <Input
                  id="template-heading"
                  name="heading"
                  required
                  maxLength={120}
                  className="mt-2"
                  defaultValue={editing.heading}
                />
              </div>
              <div>
                <Label htmlFor="template-body">Body</Label>
                <Textarea
                  id="template-body"
                  name="body"
                  required
                  rows={8}
                  maxLength={20000}
                  className="mt-2 min-h-40"
                  defaultValue={editing.body}
                />
              </div>
              <div>
                <Label htmlFor="template-cta">Button label</Label>
                <Input
                  id="template-cta"
                  name="ctaLabel"
                  maxLength={60}
                  className="mt-2"
                  defaultValue={editing.ctaLabel}
                  placeholder="Leave blank for no button"
                />
              </div>
              {template ? (
                <p className="text-sm text-emerald-700" role="status">
                  Template saved. The next send of this type uses the new copy.
                </p>
              ) : null}
              <button
                type="submit"
                className={cn(
                  buttonVariants(),
                  "h-10 w-fit px-4 font-semibold brand-gradient text-white",
                )}
              >
                Save template
              </button>
            </form>
          </section>
        ) : null}

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Compose a broadcast
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Starts from the saved {kindLabel(composeKind).toLowerCase()}{" "}
            template. Change the type below, or open a template from the list
            above.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BROADCAST_KINDS.map((kind) => (
              <Link
                key={kind}
                href={`/dashboard/emails?compose=${kind}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-8 px-3 text-xs",
                  composeKind === kind && "border-primary text-primary",
                )}
              >
                {kindLabel(kind)}
              </Link>
            ))}
          </div>
          <form action="/api/emails" method="post" className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="kind">Type</Label>
                <select
                  id="kind"
                  name="kind"
                  required
                  defaultValue={composeKind}
                  className={cn(selectClassName, "mt-2")}
                >
                  <option value="marketing">Marketing</option>
                  <option value="info">Info</option>
                  <option value="update">Product update</option>
                </select>
              </div>
              <div>
                <Label htmlFor="audience">Audience</Label>
                <select
                  id="audience"
                  name="audience"
                  required
                  defaultValue="agency_owners"
                  className={cn(selectClassName, "mt-2")}
                >
                  <option value="all_users">All users</option>
                  <option value="agency_owners">Agency owners</option>
                  <option value="business_owners">Business owners</option>
                  <option value="agency_members">Agency users</option>
                  <option value="customers">Customer contacts</option>
                  <option value="custom">Specific addresses</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                required
                maxLength={200}
                className="mt-2"
                defaultValue={composeTemplate?.subject}
                placeholder="Map-pack tips for this month"
              />
            </div>
            <div>
              <Label htmlFor="heading">Heading in the email</Label>
              <Input
                id="heading"
                name="heading"
                maxLength={120}
                className="mt-2"
                defaultValue={composeTemplate?.heading}
                placeholder="Leave blank to reuse the subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                name="body"
                required
                rows={8}
                maxLength={20000}
                className="mt-2 min-h-40"
                defaultValue={composeTemplate?.body}
                placeholder="Write the email in plain language. Separate paragraphs with a blank line."
              />
            </div>
            <div>
              <Label htmlFor="customTo">Specific addresses</Label>
              <Textarea
                id="customTo"
                name="customTo"
                rows={3}
                className="mt-2"
                placeholder="Only used when audience is specific addresses. Separate with commas or new lines."
              />
            </div>
            {sent ? (
              <p className="text-sm text-emerald-700" role="status">
                Queued {sent} email{sent === "1" ? "" : "s"}
                {delivered ? ` · ${delivered} delivered` : ""}
                {logged && logged !== "0" ? ` · ${logged} logged locally` : ""}
                {failed && failed !== "0" ? ` · ${failed} failed` : ""}.
              </p>
            ) : null}
            <button
              type="submit"
              className={cn(
                buttonVariants(),
                "h-10 w-fit px-4 font-semibold brand-gradient text-white",
              )}
            >
              Send email
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-charcoal">
              Recent email log
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirmation, resets, intake receipts, assignment notices, and
              broadcasts.
            </p>
          </div>
          {logs.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No emails yet. Create an agency account or send a broadcast to
              see the first entry.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-1 px-5 py-4 md:grid-cols-[1.1fr_1.4fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-medium text-charcoal">
                      {kindLabel(item.kind)}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.to}</p>
                  </div>
                  <p className="text-sm text-charcoal">{item.subject}</p>
                  <div className="text-sm">
                    <p
                      className={cn(
                        "font-medium",
                        item.status === "sent" && "text-emerald-700",
                        item.status === "logged" && "text-amber-800",
                        item.status === "failed" && "text-red-600",
                      )}
                    >
                      {item.status}
                    </p>
                    <p className="text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </p>
                    {item.error ? (
                      <p className="text-xs text-red-600">{item.error}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
