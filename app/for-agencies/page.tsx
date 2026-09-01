import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "For agencies",
  description:
    "White-label GBP Auto Ranker for the local businesses you already manage. One agency book, teammate seats, and you talk to each owner about the campaign.",
};

const points = [
  {
    title: "One book of clients",
    copy: "Every listing assigned to your agency shows in the same dashboard. Owners and teammates see the same client file.",
  },
  {
    title: "You keep the relationship",
    copy: "Clients can submit through the public form. You take the assignment, add keywords, and talk to the owner in your own voice.",
  },
  {
    title: "Seats for the people who run work",
    copy: "Add agency users with a temporary password. They sign in, open the same campaigns, and leave notes.",
  },
  {
    title: "You quote the client",
    copy: "Business owners are sent to a GBP Auto Ranker agency partner — not a public price on this site. You set the terms with each listing you manage.",
  },
];

export default function ForAgenciesPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              For SEO agencies
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-charcoal">
              White-label map-pack ranking for the businesses you already
              manage.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              GBP Auto Ranker is built so an agency can run the same search,
              click, and engagement work across a roster — without giving every
              client a separate login or a different process.
            </p>
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
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 px-5 font-semibold",
                )}
              >
                How partners work
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {points.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-white p-6"
              >
                <h2 className="text-lg font-semibold text-charcoal">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-charcoal">
                How a client moves through your agency
              </h2>
              <ol className="mt-6 space-y-4">
                {[
                  "The business submits the Maps link and keywords, or you add the client yourself.",
                  "An admin assigns the listing to your agency and, if you want, to a specific teammate.",
                  "Your team reviews the keywords, leaves notes, and watches status.",
                  "We run searches and engagement on that profile. You stay the point of contact.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full brand-gradient text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-charcoal">
                What agency owners can do
              </h2>
              <ul className="mt-4 space-y-3">
                {[
                  "Add teammates who share the same client book",
                  "Open every assigned listing, keyword list, and Maps URL",
                  "Create a client from inside the dashboard",
                  "Remove a duplicate client listing from the dashboard",
                  "Talk to each business owner about the campaign — this site does not publish a public price",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">
                Agency users do not see operator tools that belong to GBP Auto
                Ranker staff. They see clients, team, and the work on each
                listing.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal">
              Ready to run a roster?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create the agency account, confirm your email, then add the first
              clients. You stay the point of contact for each business owner.
            </p>
            <Link
              href="/signup"
              className={cn(
                buttonVariants(),
                "mt-6 h-11 px-5 font-semibold brand-gradient text-white",
              )}
            >
              Agency signup
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
