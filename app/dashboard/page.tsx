import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardView } from "@/components/dashboard-view";
import { isAdmin, isBusinessOwner, visibleCustomers } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { listCustomers } from "@/lib/store";
import { CAMPAIGN_STATUSES, type CampaignStatus } from "@/lib/types";
import { listAgencies, listUsers, toPublicUser } from "@/lib/users";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    scope?: string;
    confirmed?: string;
  }>;
}) {
  const { user, agency } = await loadDashboardUser();
  const { q, status, scope, confirmed } = await searchParams;
  const selectedStatus =
    status && CAMPAIGN_STATUSES.includes(status as CampaignStatus)
      ? (status as CampaignStatus)
      : "all";
  const selectedScope =
    scope === "mine" || scope === "unassigned" ? scope : "all";
  const [allCustomers, agencies, users] = await Promise.all([
    listCustomers(),
    listAgencies(),
    listUsers(),
  ]);
  const customers = visibleCustomers(user, allCustomers, selectedScope);
  const publicUsers = users.map(toPublicUser);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
            {isAdmin(user)
              ? "Customers"
              : isBusinessOwner(user)
                ? "Your locations"
                : "Your clients"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {isAdmin(user)
              ? "Each row is a listing. The Agency column shows who is running it. A business-owner login only shows here after a listing is attached to them. Check boxes to email specific listing inboxes."
              : isBusinessOwner(user)
                ? "Each location is a Google Business Profile you want in the map pack. Add another when you open a second shop."
                : `These are the businesses assigned to your agency. You asked for ${agency?.leadPreference === "shared" ? "shared" : "exclusive"} leads — change that under Agency. Add a client or open one to see the keywords and Maps listing.`}
          </p>
          {confirmed ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Email confirmed. You can add locations or clients from here.
            </p>
          ) : null}
        </div>
        <DashboardView
          customers={customers}
          query={q ?? ""}
          status={selectedStatus}
          scope={selectedScope}
          isAdmin={isAdmin(user)}
          isBusinessOwner={isBusinessOwner(user)}
          agencies={agencies}
          users={publicUsers}
        />
      </main>
    </div>
  );
}
