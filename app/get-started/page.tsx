import type { Metadata } from "next";
import { IntakeForm } from "@/components/intake-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Start a campaign",
  description:
    "Send your Google Business Profile, Maps link, and target keywords so GBP Auto Ranker can start ranking the listing.",
};

export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Campaign intake
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            Tell us the listing and the keywords.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Name, business details, your Google Maps link, and the searches you
            want to win. A campaign is $150. Agency owners running ten or more
            listings can ask for volume pricing. Everything you enter here
            shows up on the customer dashboard so the work starts on the right
            profile.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-[0_16px_50px_-36px_rgba(8,43,117,0.45)] sm:p-8">
            <IntakeForm error={error} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
