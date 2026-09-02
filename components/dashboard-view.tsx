import Link from "next/link";
import {
  Building2,
  KeyRound,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import {
  EmailSelectBox,
  EmailSelectForm,
  EmailSelectedBar,
} from "@/components/email-select";
import { selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agencyName, ownerName } from "@/lib/attachments";
import { listingContactEmail } from "@/lib/contact";
import { formatLocation, STATUS_LABELS } from "@/lib/customers";
import { formatDate } from "@/lib/format";
import { customerStats } from "@/lib/stats";
import type { Agency, CampaignStatus, Customer, PublicUser } from "@/lib/types";
import { CAMPAIGN_STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardViewProps = {
  customers: Customer[];
  query: string;
  status: CampaignStatus | "all";
  scope: "all" | "mine" | "unassigned";
  isAdmin: boolean;
  isBusinessOwner?: boolean;
  agencies: Agency[];
  users: PublicUser[];
};

export function DashboardView({
  customers,
  query,
  status,
  scope,
  isAdmin,
  isBusinessOwner,
  agencies,
  users,
}: DashboardViewProps) {
  const stats = customerStats(customers);
  const needle = query.trim().toLowerCase();
  const filtered = customers.filter((customer) => {
    const matchesStatus = status === "all" || customer.status === status;
    const haystack = [
      customer.businessName,
      customer.contactName,
      customer.email,
      customer.category,
      customer.city,
      customer.state,
      agencyName(agencies, customer.agencyId),
      ownerName(users, customer.ownerUserId),
      ...customer.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return matchesStatus && (!needle || haystack.includes(needle));
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={isBusinessOwner ? "Locations" : "Customers"}
          value={stats.total}
          hint={
            isAdmin
              ? "All campaigns in the book"
              : isBusinessOwner
                ? "Listings on your account"
                : "Clients on your roster"
          }
          icon={Building2}
        />
        <StatCard
          label="Active"
          value={stats.active}
          hint="Currently receiving signals"
          icon={TrendingUp}
        />
        <StatCard
          label="Keywords"
          value={stats.keywords}
          hint="Unique terms being targeted"
          icon={KeyRound}
        />
        <StatCard
          label="New"
          value={stats.newCount}
          hint="Waiting to be reviewed"
          icon={Sparkles}
        />
      </div>

      <form
        action="/dashboard"
        method="get"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search business, contact, city, or keyword"
            className="pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className={cn(selectClassName, "sm:w-44")}
        >
          <option value="all">All statuses</option>
          {CAMPAIGN_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        {isBusinessOwner ? null : (
        <select
          name="scope"
          defaultValue={scope}
          className={cn(selectClassName, "sm:w-48")}
        >
          <option value="all">{isAdmin ? "All assignments" : "All agency clients"}</option>
          <option value="mine">Assigned to me</option>
          {isAdmin ? <option value="unassigned">Unassigned</option> : null}
        </select>
        )}
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
        >
          Filter
        </button>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-charcoal">
            {customers.length === 0
              ? isBusinessOwner
                ? "No locations yet"
                : "No customers yet"
              : "No matches for that search"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {customers.length === 0
              ? isAdmin
                ? "Add a customer yourself, or wait for public intake and agency-added clients."
                : isBusinessOwner
                  ? "Add your first Google Business Profile. You can add more locations after that."
                  : "Add a client to start ranking their Google Business Profile."
              : "Try another keyword, business name, or clear the status filter."}
          </p>
          {customers.length === 0 ? (
            <Link
              href="/dashboard/clients/new"
              className={cn(
                buttonVariants(),
                "mt-5 inline-flex h-10 px-4 font-semibold brand-gradient text-white",
              )}
            >
              {isBusinessOwner ? "Add a location" : "Add a client"}
            </Link>
          ) : null}
        </div>
      ) : (
        <CustomerList
          customers={filtered}
          isAdmin={isAdmin}
          isBusinessOwner={Boolean(isBusinessOwner)}
          agencies={agencies}
          users={users}
        />
      )}
    </div>
  );
}

function CustomerList({
  customers,
  isAdmin,
  isBusinessOwner,
  agencies,
  users,
}: {
  customers: Customer[];
  isAdmin: boolean;
  isBusinessOwner: boolean;
  agencies: Agency[];
  users: PublicUser[];
}) {
  const list = (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex border-b border-border bg-surface">
        {isAdmin ? (
          <div className="hidden w-12 shrink-0 lg:block" aria-hidden />
        ) : null}
        <div
          className={cn(
            "hidden flex-1 gap-4 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:grid",
            isBusinessOwner
              ? "grid-cols-[1.4fr_1fr_auto_auto]"
              : isAdmin
                ? "grid-cols-[1.3fr_1fr_1fr_1fr_auto_auto]"
                : "grid-cols-[1.3fr_1fr_1fr_auto_auto]",
          )}
        >
          <span>Business</span>
          <span>Contact</span>
          {isBusinessOwner ? null : <span>Agency</span>}
          {isAdmin ? <span>Owner</span> : null}
          <span>Status</span>
          <span>Added</span>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {customers.map((customer) => {
          const assignedAgency =
            agencyName(agencies, customer.agencyId) || "Unassigned";
          const assignedOwner = ownerName(users, customer.ownerUserId);
          const manager = customer.managerUserId
            ? users.find((item) => item.id === customer.managerUserId)?.name
            : "";
          const inbox = listingContactEmail(customer, users);
          return (
            <li key={customer.id} className="flex items-stretch">
              {isAdmin ? (
                <div className="flex shrink-0 items-center px-4">
                  <EmailSelectBox
                    value={inbox}
                    title={
                      inbox
                        ? `Email ${inbox}`
                        : "No email on this listing or attached owner"
                    }
                  />
                </div>
              ) : null}
              <Link
                href={`/dashboard/${customer.id}`}
                className={cn(
                  "min-w-0 flex-1 grid gap-3 px-5 py-4 transition-colors hover:bg-accent/60 lg:items-center",
                  isBusinessOwner
                    ? "lg:grid-cols-[1.4fr_1fr_auto_auto]"
                    : isAdmin
                      ? "lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto_auto]"
                      : "lg:grid-cols-[1.3fr_1fr_1fr_auto_auto]",
                )}
              >
                <div>
                  <p className="font-semibold text-charcoal">
                    {customer.businessName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.category}
                    {customer.city ? ` · ${formatLocation(customer)}` : ""}
                  </p>
                  {customer.keywords.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {customer.keywords.slice(0, 3).join(" · ")}
                      {customer.keywords.length > 3
                        ? ` +${customer.keywords.length - 3}`
                        : ""}
                    </p>
                  ) : null}
                  {isBusinessOwner ? null : (
                    <p className="mt-1 text-sm font-medium text-charcoal lg:hidden">
                      {assignedAgency}
                      {manager ? ` · ${manager}` : ""}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{customer.contactName}</p>
                  <p className="text-sm text-muted-foreground">
                    {inbox || "No email"}
                  </p>
                </div>
                {isBusinessOwner ? null : (
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {assignedAgency}
                    </p>
                    {manager ? (
                      <p className="text-sm text-muted-foreground">{manager}</p>
                    ) : null}
                  </div>
                )}
                {isAdmin ? (
                  <p className="text-sm text-charcoal">
                    {assignedOwner || "—"}
                  </p>
                ) : null}
                <StatusBadge status={customer.status} />
                <p className="text-sm text-muted-foreground">
                  {formatDate(customer.createdAt)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      {isAdmin ? (
        <EmailSelectedBar emptyHint="Check customers to email their listing or attached owner inbox." />
      ) : null}
    </div>
  );

  return isAdmin ? <EmailSelectForm>{list}</EmailSelectForm> : list;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Building2;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-[0_1px_0_rgba(8,9,11,0.03)]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-xl brand-gradient text-white">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
