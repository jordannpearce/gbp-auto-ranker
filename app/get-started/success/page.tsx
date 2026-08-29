import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Campaign received",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-[0_16px_50px_-36px_rgba(8,43,117,0.45)]">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal">
            Campaign received.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your listing, Maps link, and keywords are in the customer dashboard.
            We’ll use exactly what you submitted to run searches and engagement
            against the profile.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants(),
                "h-11 px-5 font-semibold brand-gradient text-white",
              )}
            >
              Open the dashboard
            </Link>
            {id ? (
              <Link
                href={`/dashboard/${id}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 px-5",
                )}
              >
                View this customer
              </Link>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
