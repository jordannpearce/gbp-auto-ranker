import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-[5.25rem] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-charcoal">
              Customer dashboard
            </p>
            <p className="text-xs text-muted-foreground">
              Manage listings, keywords, and campaign status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/get-started"
            className={cn(buttonVariants({ variant: "outline" }), "h-9 px-3")}
          >
            New intake
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "ghost" }), "h-9 px-3")}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
