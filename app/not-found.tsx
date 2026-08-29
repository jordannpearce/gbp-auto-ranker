import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-charcoal">
          That page is not on the map.
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The link may be outdated, or the customer record was removed from the
          dashboard.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants(),
            "mt-6 h-11 px-5 font-semibold brand-gradient text-white",
          )}
        >
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
