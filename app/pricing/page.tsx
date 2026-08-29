import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "GBP Auto Ranker campaigns start at $150. Agency owners can request volume pricing from 10 campaigns.",
};

const included = [
  "Campaign built on the Google Maps listing you submit",
  "Keywords you choose — not a generic local pack",
  "Real searches, listing clicks, and engagement activity",
  "A dashboard record your agency team can manage",
  "Status updates and notes on the same customer file",
];

export default function PricingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Pricing
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-charcoal">
              $150 per campaign. Volume rates for agencies that run a book of
              listings.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              One price for a single business. Agency owners who bring ten or
              more campaigns can lock in a discounted rate. We set that rate
              with you when you reach that volume — it is not published as a
              public grid.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold text-primary">Single campaign</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-charcoal">
              $150
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Per Google Business Profile campaign.
            </p>
            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/get-started"
              className={cn(
                buttonVariants(),
                "mt-8 h-11 px-5 font-semibold brand-gradient text-white",
              )}
            >
              Start a campaign
            </Link>
          </article>

          <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold text-primary">Agency volume</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-charcoal">
              From 10 campaigns
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Discounted pricing for agency owners. The exact rate is confirmed
              when you book that volume.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>
                Built for SEO agencies that white-label map-pack work for a
                roster of local businesses.
              </li>
              <li>
                One agency account, multiple teammates, and every client in
                the same dashboard.
              </li>
              <li>
                Volume starts at ten active or booked campaigns. Below that,
                the $150 campaign price applies.
              </li>
              <li>
                Tell us how many listings you plan to run. We will quote the
                agency rate before you add the tenth campaign.
              </li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants(),
                  "h-11 px-5 font-semibold brand-gradient text-white",
                )}
              >
                Create an agency account
              </Link>
              <Link
                href="/for-agencies"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 px-5 font-semibold",
                )}
              >
                How agencies use it
              </Link>
            </div>
          </article>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal">
              What the $150 covers
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                [
                  "The listing you name",
                  "We lock onto the Google Maps URL you submit. No swapped profiles, no nearby competitor.",
                ],
                [
                  "The keywords you pick",
                  "Searches and engagement run on the phrases that produce customers for that business.",
                ],
                [
                  "A file your team can open",
                  "Status, notes, and assignment live in the dashboard so the agency can stay on the campaign.",
                ],
              ].map(([title, copy]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border bg-white p-5"
                >
                  <h3 className="font-semibold text-charcoal">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
              Rank is not guaranteed. Google decides what the map pack shows.
              The campaign fee is for the work we run against the listing, not
              a promised position.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
