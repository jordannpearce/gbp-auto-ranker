import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { IntakeForm } from "@/components/intake-form";
import { isAdmin, isAgencyUser, isBusinessOwner } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { listAgencies, listUsers, toPublicUser } from "@/lib/users";

export const metadata: Metadata = {
  title: "Add a location",
};

export const dynamic = "force-dynamic";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; agencyId?: string; ownerUserId?: string }>;
}) {
  const { user, agency } = await loadDashboardUser();
  const { error, agencyId, ownerUserId } = await searchParams;
  const [agencies, users] = isAdmin(user)
    ? await Promise.all([listAgencies(), listUsers()])
    : [[], []];
  const publicUsers = users.map(toPublicUser);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          {isBusinessOwner(user) ? "Add a location" : "Add a client"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isAgencyUser(user)
            ? `This listing is assigned to ${agency?.name || "your agency"} so your team can white-label the campaign.`
            : isBusinessOwner(user)
              ? "Add another Google Business Profile. It stays on your account so you can run more than one location."
              : "Add a business listing here. Assign it to an agency, a business owner, or leave it in the admin queue."}
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-white p-5 sm:p-8">
          <IntakeForm
            error={error}
            returnTo="/dashboard"
            assignment={
              isAdmin(user)
                ? {
                    agencies,
                    users: publicUsers,
                    owners: publicUsers.filter(
                      (item) => item.role === "business_owner",
                    ),
                    defaultAgencyId: agencyId,
                    defaultOwnerUserId: ownerUserId,
                  }
                : undefined
            }
          />
        </div>
      </main>
    </div>
  );
}
