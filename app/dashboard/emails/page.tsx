import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAdmin } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { listEmailLogs } from "@/lib/email-log";
import { formatDateTime } from "@/lib/format";
import { fromAddress, isEmailConfigured } from "@/lib/mail";
import { listCustomers } from "@/lib/store";
import { listUsers } from "@/lib/users";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Emails",
};

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  confirm_account: "Account confirmation",
  welcome: "Welcome",
  password_reset: "Password reset",
  password_changed: "Password changed",
  team_invite: "Team invite",
  campaign_received: "Campaign received",
  new_intake: "New intake",
  campaign_assigned: "Campaign assigned",
  client_assigned: "Client assigned",
  marketing: "Marketing",
  info: "Info",
  update: "Update",
};

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    delivered?: string;
    logged?: string;
    failed?: string;
  }>;
}) {
  const { user, agency } = await loadDashboardUser();
  if (!isAdmin(user)) redirect("/dashboard");
  const { error, sent, delivered, logged, failed } = await searchParams;
  const [logs, users, customers] = await Promise.all([
    listEmailLogs(30),
    listUsers(),
    listCustomers(),
  ]);
  const configured = isEmailConfigured();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
            Emails
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Send marketing, info, and product-update emails through Resend.
            Account confirmation, password resets, intake receipts, and
            assignment notices go out automatically.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-charcoal">
                Resend connection
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                From address: {fromAddress()}
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
              {configured ? "API key set" : "Logging only"}
            </span>
          </div>
          {configured ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Transactional and broadcast emails are sent with your Resend API
              key. Use a verified domain in <code>RESEND_FROM</code>.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              No <code>RESEND_API_KEY</code> is set, so emails are written to
              the log and confirmation or reset links appear on screen. Add the
              key in Railway or <code>.env.local</code> when you are ready to
              deliver.
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Audiences now: {users.length} users ·{" "}
            {users.filter((item) => item.role === "agency_owner").length} agency
            owners · {customers.filter((item) => item.email).length} customer
            contacts
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Compose a broadcast
          </h2>
          <form action="/api/emails" method="post" className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="kind">Type</Label>
                <select
                  id="kind"
                  name="kind"
                  required
                  defaultValue="info"
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
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
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
                      {KIND_LABEL[item.kind] || item.kind}
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
