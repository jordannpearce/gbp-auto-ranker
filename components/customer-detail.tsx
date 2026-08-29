"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import { KeywordField } from "@/components/keyword-field";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatLocation, STATUS_LABELS } from "@/lib/customers";
import { formatDateTime } from "@/lib/format";
import type { CampaignStatus, Customer } from "@/lib/types";
import { CAMPAIGN_STATUSES } from "@/lib/types";

export function CustomerDetail({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [status, setStatus] = useState<CampaignStatus>(customer.status);
  const [keywords, setKeywords] = useState(customer.keywords);
  const [internalNotes, setInternalNotes] = useState(customer.internalNotes);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, keywords, internalNotes }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Could not save changes.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `Remove ${customer.businessName} from the dashboard? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error || "Could not delete this customer.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setDeleting(false);
    }
  }

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
        <StatusBadge status={status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Panel title="Campaign keywords">
            <p className="mb-3 text-sm text-muted-foreground">
              These are the searches GBP Auto Ranker will run, click, and
              engage for this listing.
            </p>
            <KeywordField value={keywords} onChange={setKeywords} />
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
              {customer.comments || "No comments were added with this intake."}
            </p>
            {customer.referralSource ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Source: {customer.referralSource}
              </p>
            ) : null}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Manage campaign">
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <div className="mt-2">
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus((value as CampaignStatus) ?? status)
                    }
                  >
                    <SelectTrigger id="status" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_STATUSES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {STATUS_LABELS[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="internalNotes">Internal notes</Label>
                <Textarea
                  id="internalNotes"
                  className="mt-2"
                  rows={6}
                  value={internalNotes}
                  onChange={(event) => setInternalNotes(event.target.value)}
                  placeholder="Scheduling notes, signal windows, competitor watchlist…"
                />
              </div>
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="button"
                onClick={save}
                disabled={saving}
                className="h-10 w-full font-semibold brand-gradient text-white"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </Panel>

          <Panel title="Contact">
            <dl className="space-y-3">
              <Fact label="Name" value={`${customer.contactName} · ${customer.role}`} />
              <Fact
                label="Email"
                value={
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
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
              <Fact label="Submitted" value={formatDateTime(customer.createdAt)} />
              <Fact label="Updated" value={formatDateTime(customer.updatedAt)} />
            </dl>
          </Panel>

          <Button
            type="button"
            variant="destructive"
            onClick={remove}
            disabled={deleting}
            className="h-10 w-full"
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 />}
            Remove customer
          </Button>
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
