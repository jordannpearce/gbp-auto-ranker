import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerDetail } from "@/components/customer-detail";
import { DashboardHeader } from "@/components/dashboard-header";
import { canSeeCustomer } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { getCustomer } from "@/lib/store";
import { getAgency, listAgencies, listUsers, toPublicUser } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const customer = await getCustomer(id);
  return {
    title: customer ? customer.businessName : "Customer",
  };
}

export default async function CustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { user, agency } = await loadDashboardUser();
  const { id } = await params;
  const { error, saved } = await searchParams;
  const customer = await getCustomer(id);
  if (!customer || !canSeeCustomer(user, customer)) notFound();

  const [agencies, users] = await Promise.all([listAgencies(), listUsers()]);
  const publicUsers = users.map(toPublicUser);
  const managers = publicUsers.filter(
    (item) => item.role === "agency_owner" || item.role === "agency_member",
  );
  const owners = publicUsers.filter((item) => item.role === "business_owner");
  const assignedAgency = customer.agencyId
    ? await getAgency(customer.agencyId)
    : null;
  const manager = users.find((item) => item.id === customer.managerUserId);
  const owner = users.find((item) => item.id === customer.ownerUserId);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <CustomerDetail
          customer={customer}
          user={user}
          agencies={agencies}
          managers={managers}
          owners={owners}
          agencyName={assignedAgency?.name}
          managerName={manager?.name}
          ownerName={owner?.name}
          error={error}
          saved={saved === "1"}
        />
      </main>
    </div>
  );
}
