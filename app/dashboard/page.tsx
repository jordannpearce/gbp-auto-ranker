import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardView } from "@/components/dashboard-view";
import { isAdmin, visibleCustomers } from "@/lib/access";
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
  searchParams: Promise<{ q?: string; status?: string; scope?: string }>;
}) {
  const { user, agency } = await loadDashboardUser();
  const { q, status, scope } = await searchParams;
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
            {isAdmin(user) ? "Customers" : "Your clients"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {isAdmin(user)
              ? "Assign business listings to SEO agency accounts so their teams can white-label the campaign."
              : "These are the businesses assigned to your agency. Open a client to see the keywords and Maps listing you are ranking."}
          </p>
        </div>
        <DashboardView
          customers={customers}
          query={q ?? ""}
          status={selectedStatus}
          scope={selectedScope}
          isAdmin={isAdmin(user)}
          agencies={agencies}
          users={publicUsers}
        />
      </main>
    </div>
  );
}
