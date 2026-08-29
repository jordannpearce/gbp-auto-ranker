import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardView } from "@/components/dashboard-view";
import { listCustomers } from "@/lib/store";

export const metadata: Metadata = {
  title: "Customer dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const customers = await listCustomers();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
            Customers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Every intake lands here with the Maps link, contact details, and
            the keywords the campaign will use. Open a row to update status or
            refine the term list.
          </p>
        </div>
        <DashboardView customers={customers} />
      </main>
    </div>
  );
}
