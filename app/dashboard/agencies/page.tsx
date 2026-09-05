import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  EmailSelectBox,
  EmailSelectForm,
  EmailSelectedBar,
} from "@/components/email-select";
import { isAdmin } from "@/lib/access";
import { agencyContactEmail } from "@/lib/contact";
import { loadDashboardUser } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";
import { listCustomers } from "@/lib/store";
import { leadPreferenceShort } from "@/lib/leads";
import { listAgencies, listUsers } from "@/lib/users";

export const metadata: Metadata = {
  title: "Agencies",
};

export const dynamic = "force-dynamic";

export default async function AgenciesPage() {
  const { user, agency } = await loadDashboardUser();
  if (!isAdmin(user)) redirect("/dashboard");

  const [agencies, users, customers] = await Promise.all([
    listAgencies(),
    listUsers(),
    listCustomers(),
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
              Agencies
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Open an agency to edit its name, website, or owner, assign
              customers, or delete it. Check boxes to email the owner or first
              team inbox.
            </p>
          </div>
          <Link
            href="/dashboard/agencies/new"
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white brand-gradient"
          >
            Add agency
          </Link>
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white">
          {agencies.length === 0 ? (
            <p className="px-5 py-10 text-sm text-muted-foreground">
              No agencies yet. Add one here, or they can still sign up
              themselves from the public signup page.
            </p>
          ) : (
            <EmailSelectForm>
              <div className="flex border-b border-border bg-surface">
                <div className="hidden w-12 shrink-0 md:block" aria-hidden />
                <div className="hidden flex-1 grid-cols-[1.4fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid">
                  <span>Agency</span>
                  <span>Owner</span>
                  <span>Leads</span>
                  <span>Users</span>
                  <span>Clients</span>
                  <span>Added</span>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {agencies.map((item) => {
                  const owner = users.find(
                    (entry) => entry.id === item.ownerUserId,
                  );
                  const inbox = agencyContactEmail(item, users);
                  const userCount = users.filter(
                    (entry) => entry.agencyId === item.id,
                  ).length;
                  const clientCount = customers.filter(
                    (entry) => entry.agencyId === item.id,
                  ).length;
                  return (
                    <li key={item.id} className="flex items-stretch">
                      <div className="flex shrink-0 items-center px-4">
                        <EmailSelectBox
                          value={inbox}
                          title={
                            inbox
                              ? `Email ${inbox}`
                              : "No owner or team inbox on this agency"
                          }
                        />
                      </div>
                      <Link
                        href={`/dashboard/agencies/${item.id}`}
                        className="min-w-0 flex-1 grid gap-1 px-5 py-4 transition-colors hover:bg-accent/60 md:grid-cols-[1.4fr_1fr_auto_auto_auto_auto] md:items-center"
                      >
                        <div>
                          <p className="font-semibold text-charcoal">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.website || "No website"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">{owner?.name || "—"}</p>
                          {inbox ? (
                            <p className="text-xs text-muted-foreground md:hidden">
                              {inbox}
                            </p>
                          ) : null}
                        </div>
                        <p className="text-sm">
                          {leadPreferenceShort(item.leadPreference)}
                        </p>
                        <p className="text-sm">{userCount}</p>
                        <p className="text-sm">{clientCount}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <EmailSelectedBar emptyHint="Check agencies to email the owner, or the first team inbox if there is no owner." />
            </EmailSelectForm>
          )}
        </div>
      </main>
    </div>
  );
}
