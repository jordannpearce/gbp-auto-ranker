import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { LeadPreferenceField } from "@/components/lead-preference-field";
import { buttonVariants } from "@/components/ui/button";
import { isAgencyUser } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { leadPreferenceCopy, leadPreferenceLabel } from "@/lib/leads";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Agency settings",
};

export const dynamic = "force-dynamic";

export default async function AgencySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; preference?: string }>;
}) {
  const { user, agency } = await loadDashboardUser();
  if (!isAgencyUser(user) || !agency) redirect("/dashboard");
  const { error, preference } = await searchParams;
  const canEdit = user.role === "agency_owner";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency.name} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          Agency settings
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tell us whether {agency.name} wants exclusive listings or is open to
          shared leads. Admins use this when they assign a new business.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-white p-6">
          <p className="text-sm text-muted-foreground">
            Current preference:{" "}
            <span className="font-medium text-charcoal">
              {leadPreferenceLabel(agency.leadPreference)}
            </span>
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {leadPreferenceCopy(agency.leadPreference)}
          </p>

          {canEdit ? (
            <form
              action={`/api/agencies/${agency.id}`}
              method="post"
              className="mt-6 space-y-4"
            >
              <input type="hidden" name="intent" value="save" />
              <LeadPreferenceField defaultValue={agency.leadPreference} />
              {preference ? (
                <p className="text-sm text-emerald-700" role="status">
                  Lead preference saved.
                </p>
              ) : null}
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className={cn(
                  buttonVariants(),
                  "h-10 font-semibold brand-gradient text-white",
                )}
              >
                Save preference
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Only the agency owner can change this. Ask them if you need to
              switch between exclusive and shared leads.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
