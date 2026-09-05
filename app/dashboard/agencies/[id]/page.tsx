import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { LeadPreferenceField } from "@/components/lead-preference-field";
import { NotifyAgencyField } from "@/components/notify-agency-field";
import { selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdmin, roleLabel } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import {
  leadPreferenceCopy,
  leadPreferenceLabel,
} from "@/lib/leads";
import { assignmentNotifyMessage } from "@/lib/notify";
import { listCustomers } from "@/lib/store";
import { getAgency, listAgencyUsers, listUsers } from "@/lib/users";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const agency = await getAgency((await params).id);
  return { title: agency?.name || "Agency" };
}

export default async function AgencyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    created?: string;
    details?: string;
    preference?: string;
    notified?: string;
    agencyTo?: string;
    mailError?: string;
  }>;
}) {
  const { user, agency: currentAgency } = await loadDashboardUser();
  if (!isAdmin(user)) redirect("/dashboard");
  const { id } = await params;
  const {
    error,
    saved,
    created,
    details,
    preference,
    notified,
    agencyTo,
    mailError,
  } = await searchParams;
  const mailNote = assignmentNotifyMessage(notified, agencyTo, mailError);
  const agency = await getAgency(id);
  if (!agency) notFound();

  const [members, customers, users] = await Promise.all([
    listAgencyUsers(id),
    listCustomers(),
    listUsers(),
  ]);
  const ownerChoices = users.filter((item) => item.role !== "admin");
  const assigned = customers.filter((customer) => customer.agencyId === id);
  const unassigned = customers.filter((customer) => !customer.agencyId);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={currentAgency?.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <div>
          <Link
            href="/dashboard/agencies"
            className="text-sm font-medium text-primary hover:underline"
          >
            All agencies
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
            {agency.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {leadPreferenceLabel(agency.leadPreference)} ·{" "}
            {leadPreferenceCopy(agency.leadPreference)}
          </p>
          {created ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Agency created. The owner can sign in with the email and
              temporary password you set.
            </p>
          ) : null}
          {details ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Agency saved.
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/clients/new?agencyId=${agency.id}`}
              className={cn(
                buttonVariants(),
                "h-10 px-4 font-semibold brand-gradient text-white",
              )}
            >
              Add client to this agency
            </Link>
            <Link
              href="/dashboard/team"
              className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
            >
              Add a user
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Agency details
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Change the public name and website. The owner login can be moved
            from Users if you need a different person.
          </p>
          <form
            action={`/api/agencies/${agency.id}`}
            method="post"
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <input type="hidden" name="intent" value="details" />
            <div>
              <Label htmlFor="agencyName">Agency name</Label>
              <Input
                id="agencyName"
                name="agencyName"
                required
                defaultValue={agency.name}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={agency.website}
                className="mt-2"
                placeholder="https://youragency.com"
              />
            </div>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 px-4 sm:w-fit",
              )}
            >
              Save details
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Agency owner
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The owner can add teammates. Choosing a login here moves them onto
            this agency as the owner. The previous owner stays as an agency
            user.
          </p>
          <form
            action={`/api/agencies/${agency.id}`}
            method="post"
            className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
          >
            <input type="hidden" name="intent" value="owner" />
            <div>
              <Label htmlFor="ownerUserId">Owner login</Label>
              <select
                id="ownerUserId"
                name="ownerUserId"
                required
                defaultValue={agency.ownerUserId}
                className={cn(selectClassName, "mt-2")}
              >
                <option value="">Choose a login</option>
                {ownerChoices.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.email} · {roleLabel(item.role)}
                    {item.agencyId && item.agencyId !== agency.id
                      ? " · other agency"
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 px-4",
              )}
            >
              Save owner
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Lead preference
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The agency owner can also change this from their Agency settings.
            Use it when you decide whether a listing should stay exclusive.
          </p>
          <form
            action={`/api/agencies/${agency.id}`}
            method="post"
            className="mt-4 space-y-4"
          >
            <input type="hidden" name="intent" value="save" />
            <LeadPreferenceField defaultValue={agency.leadPreference} />
            {preference ? (
              <p className="text-sm text-emerald-700" role="status">
                Lead preference saved.
              </p>
            ) : null}
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 px-4 sm:w-fit",
              )}
            >
              Save preference
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Assign a customer
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {agency.leadPreference === "exclusive"
              ? "This agency asked for exclusive leads. Assign listings they will run alone."
              : "This agency accepts shared leads — listings that may also be offered to other agencies."}
          </p>
          <form
            action={`/api/agencies/${agency.id}/assign`}
            method="post"
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-sm font-medium" htmlFor="customerId">
                Unassigned business
              </label>
              <select
                id="customerId"
                name="customerId"
                required
                className={cn(selectClassName, "mt-2")}
              >
                <option value="">Select a listing</option>
                {unassigned.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.businessName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="managerUserId">
                Agency user
              </label>
              <select
                id="managerUserId"
                name="managerUserId"
                className={cn(selectClassName, "mt-2")}
              >
                <option value="">Whole agency</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {roleLabel(member.role)}
                  </option>
                ))}
              </select>
            </div>
            {saved ? (
              <p className="sm:col-span-2 text-sm text-emerald-700">
                Customer assigned to this agency.
                {mailNote ? ` ${mailNote}` : ""}
              </p>
            ) : null}
            {mailError ? (
              <p className="sm:col-span-2 text-sm text-red-600">{mailError}</p>
            ) : null}
            <div className="sm:col-span-2">
              <NotifyAgencyField />
            </div>
            <button
              type="submit"
              className={cn(
                buttonVariants(),
                "h-10 px-4 font-semibold brand-gradient text-white sm:w-fit",
              )}
            >
              Assign customer
            </button>
          </form>
          {unassigned.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Every listing already has an agency. New public intakes land here
              as unassigned.
            </p>
          ) : null}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-base font-semibold text-charcoal">Users</h2>
            <ul className="mt-4 divide-y divide-border">
              {members.map((member) => (
                <li key={member.id} className="py-3">
                  <Link
                    href={`/dashboard/team/${member.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {member.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {member.email} · {roleLabel(member.role)}
                  </p>
                </li>
              ))}
              {members.length === 0 ? (
                <li className="py-3 text-sm text-muted-foreground">
                  No users on this agency yet.
                </li>
              ) : null}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-base font-semibold text-charcoal">Clients</h2>
            <ul className="mt-4 divide-y divide-border">
              {assigned.map((customer) => (
                <li key={customer.id} className="py-3">
                  <Link
                    href={`/dashboard/${customer.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {customer.businessName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {customer.keywords.slice(0, 3).join(" · ") || "No keywords"}
                    {customer.managerUserId
                      ? ` · ${members.find((member) => member.id === customer.managerUserId)?.name || "Manager"}`
                      : ""}
                  </p>
                </li>
              ))}
              {assigned.length === 0 ? (
                <li className="py-3 text-sm text-muted-foreground">
                  No clients assigned yet.
                </li>
              ) : null}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Delete this agency
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Deletes the agency and its owner and team logins. Client listings
            stay and become unassigned. Business-owner logins are kept and
            unhooked from this agency.
          </p>
          <form
            action={`/api/agencies/${agency.id}`}
            method="post"
            className="mt-4 space-y-3"
          >
            <input type="hidden" name="intent" value="delete" />
            <label className="flex items-start gap-3 text-sm leading-6 text-charcoal">
              <input
                type="checkbox"
                name="confirmDelete"
                value="yes"
                required
                className="mt-1 size-4 accent-red-700"
              />
              <span>Yes, delete this agency and its team logins.</span>
            </label>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "destructive" }),
                "h-10 px-4",
              )}
            >
              <Trash2 className="size-4" />
              Delete agency
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
