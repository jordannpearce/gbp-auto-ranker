import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import { selectClassName } from "@/components/field";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatLocation, STATUS_LABELS } from "@/lib/customers";
import { formatDateTime } from "@/lib/format";
import { CAMPAIGN_STATUSES, type Customer } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CustomerDetail({
  customer,
  error,
  saved,
}: {
  customer: Customer;
  error?: string;
  saved?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            All customers
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
            {customer.businessName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer.category} · {formatLocation(customer)}
          </p>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <form
            action={`/api/customers/${customer.id}`}
            method="post"
            className="space-y-6"
            id="campaign-form"
          >
            <input type="hidden" name="intent" value="save" />
            <Panel title="Campaign keywords">
              <p className="mb-3 text-sm text-muted-foreground">
                These are the searches GBP Auto Ranker will run, click, and
                engage for this listing. One keyword per line.
              </p>
              <Textarea
                name="keywords"
                rows={6}
                required
                defaultValue={customer.keywords.join("\n")}
              />
            </Panel>

            <Panel title="Business information">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Fact label="Address" value={customer.address || "—"} />
                <Fact label="Service area" value={customer.serviceArea || "—"} />
                <Fact label="Primary goal" value={customer.primaryGoal || "—"} />
                <Fact
                  label="Website"
                  value={
                    customer.website ? (
                      <a
                        href={customer.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="size-3.5" />
                        {customer.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Google Maps listing
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={customer.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline"
                    >
                      <MapPin className="size-4" />
                      {customer.googleMapsUrl}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </dd>
                </div>
              </dl>
            </Panel>

            <Panel title="Comments from the customer">
              <p className="whitespace-pre-wrap text-sm leading-6 text-charcoal">
                {customer.comments ||
                  "No comments were added with this intake."}
              </p>
              {customer.referralSource ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Source: {customer.referralSource}
                </p>
              ) : null}
            </Panel>
          </form>
        </div>

        <div className="space-y-6">
          <Panel title="Manage campaign">
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <div className="mt-2">
                  <select
                    id="status"
                    name="status"
                    form="campaign-form"
                    defaultValue={customer.status}
                    className={selectClassName}
                  >
                    {CAMPAIGN_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {STATUS_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="internalNotes">Internal notes</Label>
                <Textarea
                  id="internalNotes"
                  name="internalNotes"
                  form="campaign-form"
                  className="mt-2"
                  rows={6}
                  defaultValue={customer.internalNotes}
                  placeholder="Scheduling notes, signal windows, competitor watchlist…"
                />
              </div>
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              {saved ? (
                <p className="text-sm text-emerald-700" role="status">
                  Campaign saved.
                </p>
              ) : null}
              <button
                type="submit"
                form="campaign-form"
                className={cn(
                  buttonVariants(),
                  "h-10 w-full font-semibold brand-gradient text-white",
                )}
              >
                Save changes
              </button>
            </div>
          </Panel>

          <Panel title="Contact">
            <dl className="space-y-3">
              <Fact
                label="Name"
                value={`${customer.contactName} · ${customer.role}`}
              />
              <Fact
                label="Email"
                value={
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-primary hover:underline"
                  >
                    {customer.email}
                  </a>
                }
              />
              <Fact
                label="Phone"
                value={
                  <a
                    href={`tel:${customer.phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary"
                  >
                    <Phone className="size-3.5" />
                    {customer.phone}
                  </a>
                }
              />
              <Fact
                label="Submitted"
                value={formatDateTime(customer.createdAt)}
              />
              <Fact label="Updated" value={formatDateTime(customer.updatedAt)} />
            </dl>
          </Panel>

          <form action={`/api/customers/${customer.id}`} method="post">
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "destructive" }), "h-10 w-full")}
            >
              <Trash2 className="size-4" />
              Remove customer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-charcoal">{title}</h2>
      {children}
    </section>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-charcoal">{value}</dd>
    </div>
  );
}
