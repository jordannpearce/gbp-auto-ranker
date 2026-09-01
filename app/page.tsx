import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MousePointerClick,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { MicrosoftClarity } from "@/components/microsoft-clarity";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Send the listing",
    copy: "Share your Google Maps link, service area, and the keywords that actually produce customers.",
  },
  {
    title: "We run real searches",
    copy: "GBP Auto Ranker looks your business up the way a nearby buyer would — on the terms you choose.",
  },
  {
    title: "Clicks and engagement",
    copy: "We send click-throughs and listing engagement so Google sees a profile people use, not one they skip.",
  },
  {
    title: "You climb the map pack",
    copy: "Those signals stack on the keywords that matter, so the listing moves up where local demand starts.",
  },
];

const signals = [
  {
    icon: Search,
    title: "Real searches",
    copy: "Live queries for your category and city — not fake impressions stuffed into a report.",
  },
  {
    icon: MousePointerClick,
    title: "Listing clicks",
    copy: "We open the profile from the map pack so Google registers genuine interest in your business.",
  },
  {
    icon: Sparkles,
    title: "Engagement signals",
    copy: "Directions, calls, and on-listing actions that tell Google this profile is worth showing first.",
  },
  {
    icon: TrendingUp,
    title: "Keyword focus",
    copy: "Every campaign is built around the phrases you submit. No generic “local SEO” keyword dump.",
  },
];

const fit = [
  "Brick-and-mortar shops that live or die by the map pack",
  "Service businesses that want calls from a specific city or neighborhood",
  "Owners who already claimed their Google Business Profile",
  "SEO agencies that want to white-label ranking for their client roster",
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <MicrosoftClarity />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(23,105,232,0.08),transparent_42%),radial-gradient(circle_at_left_bottom,rgba(6,66,181,0.05),transparent_36%)]" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                Google Business Profile ranking
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl sm:leading-[1.08]">
                Climb the map pack for the keywords that bring in customers.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                GBP Auto Ranker runs real searches, clicks, and engagement
                signals against your Google Business Profile — so your listing
                shows up first when nearby buyers are ready to call, visit, or
                book.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/get-started"
                  className={cn(
                    buttonVariants(),
                    "h-12 px-6 text-base font-semibold brand-gradient text-white",
                  )}
                >
                  Start a campaign
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 px-6 text-base font-semibold",
                  )}
                >
                  Log in
                </Link>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                Automate. Engage.{" "}
                <span className="font-semibold text-primary">Rank higher.</span>
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_80px_-32px_rgba(8,43,117,0.35)] sm:p-8">
                <BrandLogo href="" size="hero" />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
            {[
              ["Maps-first", "Built around the listing, not a website audit."],
              ["Keyword-true", "You pick the terms. We run those terms."],
              ["Operator ready", "Every intake lands in a customer dashboard."],
            ].map(([title, copy]) => (
              <div key={title}>
                <p className="text-sm font-semibold text-charcoal">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal">
              From Maps link to ranked keywords in four steps.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-border bg-white p-5"
                >
                  <span className="flex size-9 items-center justify-center rounded-full brand-gradient text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-semibold text-charcoal">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="what-we-run" className="scroll-mt-24 bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                What we run
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
                Signals Google already understands — pointed at your profile.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {signals.map((item) => (
                <article
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-border bg-white p-5"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl brand-gradient text-white">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-charcoal">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.copy}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="who-its-for" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Who it is for
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal">
              Local businesses that need the map pack, and agencies that run a
              roster of them.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                [
                  "Owners and managers",
                  "Dentists, shops, repair bays, clinics, and storefronts that already claimed their Google Business Profile and lose calls to whoever sits in the top three.",
                ],
                [
                  "Service-area businesses",
                  "Trades and mobile services that want searches from a city or neighborhood — not a national keyword list.",
                ],
                [
                  "SEO agencies",
                  "Teams that want one dashboard for every client listing and teammate seats, then talk to each business owner about the campaign.",
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
          </div>
        </section>

        <section className="bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                After you submit
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
                The listing lands in a dashboard the same day.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                You get a receipt at the email on the form. The campaign file
                holds the Maps link, keywords, and comments exactly as you
                wrote them. If an agency manages the work, they see the same
                record. We do not swap in a different profile or a stock
                keyword set.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Rank is not instant and it is not guaranteed. Google decides
                the map pack. The campaign is the searches and engagement we
                run so that listing has a better chance on the terms you named.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <p className="text-sm font-semibold text-primary">
                Agency partners
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
                Talk with a partner
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Campaign terms come from a GBP Auto Ranker agency partner — not
                a public price on this site. Submit the listing, then speak
                with the partner who will run the work.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants(),
                    "h-11 px-5 font-semibold brand-gradient text-white",
                  )}
                >
                  Find an agency partner
                </Link>
                <Link
                  href="/for-agencies"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 px-5 font-semibold",
                  )}
                >
                  Agency details
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                Built for local operators
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
                If the map pack is the storefront, this is the campaign.
              </h2>
              <ul className="mt-6 space-y-3">
                {fit.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="size-5" />
                <p className="text-sm font-semibold">What you send us</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The intake form captures everything the dashboard needs to run
                the campaign: contact, business details, the Google Maps URL,
                target keywords, service area, and comments.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Name",
                  "Business",
                  "Maps link",
                  "Keywords",
                  "Comments",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/get-started"
                  className={cn(
                    buttonVariants(),
                    "h-11 px-5 font-semibold brand-gradient text-white",
                  )}
                >
                  Fill out the campaign form
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 px-5 font-semibold",
                  )}
                >
                  Agency signup
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Questions
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
              Straight answers before you send a listing.
            </h2>
            <dl className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                [
                  "Do I need a website?",
                  "No. The campaign is built on the Google Business Profile and the Maps link. A website helps visitors after they tap through, but it is not required to start.",
                ],
                [
                  "What if an agency already manages my SEO?",
                  "They can create an agency account, take the assignment, and keep you as the client. You still submit the Maps link and keywords once.",
                ],
                [
                  "How do I reset a password?",
                  "Use Forgot password on the login page. We email a one-hour link to the address on the account.",
                ],
                [
                  "Who sets the campaign terms?",
                  "A GBP Auto Ranker agency partner. This website does not publish a public price. Submit the listing here, then talk with the partner assigned to the work.",
                ],
              ].map(([q, a]) => (
                <div key={q} className="rounded-2xl border border-border bg-white p-5">
                  <dt className="font-semibold text-charcoal">{q}</dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-border bg-[linear-gradient(135deg,#082B75_0%,#0642B5_46%,#1769E8_100%)]">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center">
            <div className="max-w-xl text-white">
              <h2 className="text-3xl font-semibold tracking-tight">
                Ready to move the listing?
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Submit the profile and keywords today. They appear in the
                customer dashboard the moment the form lands — ready to manage,
                update, and put to work.
              </p>
            </div>
            <Link
              href="/get-started"
              className={cn(
                buttonVariants(),
                "h-12 bg-white px-6 text-base font-semibold text-navy hover:bg-white/90",
              )}
            >
              Get ranked
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
