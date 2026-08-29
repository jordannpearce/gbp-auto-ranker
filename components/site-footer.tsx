import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo size="nav" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-charcoal">
              AUTOMATE. ENGAGE.{" "}
              <span className="text-primary">RANK HIGHER.</span>
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Real search, click, and engagement signals for Google Business
              Profiles that need the map pack.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
          <Link href="/get-started" className="hover:text-primary">
            Start a campaign
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            Customer dashboard
          </Link>
          <Link href="/#how-it-works" className="hover:text-primary">
            How it works
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} GBP Auto Ranker. Built for local
          businesses that want to show up first.
        </p>
      </div>
    </footer>
  );
}
