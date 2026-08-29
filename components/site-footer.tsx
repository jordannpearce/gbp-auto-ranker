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
          <Link href="/pricing" className="hover:text-primary">
            Pricing
          </Link>
          <Link href="/for-agencies" className="hover:text-primary">
            For agencies
          </Link>
          <Link href="/get-started" className="hover:text-primary">
            Start a campaign
          </Link>
          <Link href="/login" className="hover:text-primary">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-primary">
            Agency signup
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} GBP Auto Ranker. Built for local businesses that want to show up first.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/email-policy" className="hover:text-primary">
              Email policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
