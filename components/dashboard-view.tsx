"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Building2,
  KeyRound,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatLocation, STATUS_LABELS } from "@/lib/customers";
import { formatDate } from "@/lib/format";
import type { CampaignStatus, Customer } from "@/lib/types";
import { customerStats } from "@/lib/stats";

type DashboardViewProps = {
  customers: Customer[];
};

export function DashboardView({ customers }: DashboardViewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CampaignStatus | "all">("all");
  const stats = customerStats(customers);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesStatus = status === "all" || customer.status === status;
      const haystack = [
        customer.businessName,
        customer.contactName,
        customer.email,
        customer.category,
        customer.city,
        customer.state,
        ...customer.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [customers, query, status]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Customers"
          value={stats.total}
          hint="All campaigns in the book"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search business, contact, city, or keyword"
            className="h-10 pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus((value as CampaignStatus | "all") ?? "all")
          }
        >
          <SelectTrigger className="h-10 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-charcoal">
            {customers.length === 0
              ? "No customers yet"
              : "No matches for that search"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {customers.length === 0
              ? "New campaigns from the intake form will show up here with their keywords, Maps link, and contact details."
              : "Try another keyword, business name, or clear the status filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="hidden grid-cols-[1.3fr_1fr_1.4fr_auto_auto] gap-4 border-b border-border bg-surface px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:grid">
            <span>Business</span>
            <span>Contact</span>
            <span>Keywords</span>
            <span>Status</span>
            <span>Added</span>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((customer) => (
              <li key={customer.id}>
                <Link
                  href={`/dashboard/${customer.id}`}
                  className="grid gap-3 px-5 py-4 transition-colors hover:bg-accent/60 lg:grid-cols-[1.3fr_1fr_1.4fr_auto_auto] lg:items-center"
                >
                  <div>
                    <p className="font-semibold text-charcoal">
                      {customer.businessName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer.category}
                      {customer.city ? ` · ${formatLocation(customer)}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{customer.contactName}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                      >
                        {keyword}
                      </span>
                    ))}
                    {customer.keywords.length > 3 ? (
                      <span className="text-xs text-muted-foreground">
                        +{customer.keywords.length - 3}
                      </span>
                    ) : null}
                  </div>
                  <StatusBadge status={customer.status} />
                  <p className="text-sm text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
