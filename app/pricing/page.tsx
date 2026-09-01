import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { MicrosoftClarity } from "@/components/microsoft-clarity";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Agency partners",
  description:
    "GBP Auto Ranker campaigns are set up with an agency partner. Business owners talk to that partner — there is no public price on this site.",
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
      <MicrosoftClarity />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Agency partners
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-charcoal">
              Talk with a GBP Auto Ranker agency partner about your campaign.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              This site does not publish a public price. If you own the
              business, an agency partner quotes the work, stays your point of
              contact, and runs the listing in the dashboard. If you run an
              agency, create an account and take those clients on.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold text-primary">Business owners</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
              Work with a partner
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit the listing, then speak with the agency assigned to the
              campaign.
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
            <p className="text-sm font-semibold text-primary">Agencies</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
              You quote the client
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              White-label the map-pack work. You keep the relationship and set
              the terms with each business owner.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>
                Built for SEO agencies that run map-pack work for a roster of
                local businesses.
              </li>
              <li>
                One agency account, multiple teammates, and every client in
                the same dashboard.
              </li>
              <li>
                Business owners are pointed to you — not to a public price on
                this website.
              </li>
              <li>
                Create the agency account, then add clients yourself or take
                public intakes once they are assigned.
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
              What a campaign covers
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
              The campaign is the work we run against the listing, not a
              promised position. Terms for that work come from your agency
              partner.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
