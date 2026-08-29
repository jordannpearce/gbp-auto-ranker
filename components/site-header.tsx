import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/for-agencies", label: "For agencies" },
  { href: "/get-started", label: "Start a campaign" },
  { href: "/login", label: "Log in" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[5.25rem] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-charcoal md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link
            href="/get-started"
            className={cn(
              buttonVariants(),
              "h-10 px-4 font-semibold brand-gradient text-white hover:opacity-95",
            )}
          >
            Get ranked
          </Link>
        </div>
        <details className="relative md:hidden">
          <summary className="flex size-10 list-none items-center justify-center rounded-lg border border-border [&::-webkit-details-marker]:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </summary>
          <nav className="absolute right-0 mt-3 flex w-64 flex-col gap-2 rounded-2xl border border-border bg-white p-3 shadow-lg">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/get-started"
              className={cn(
                buttonVariants(),
                "mt-1 h-10 font-semibold brand-gradient text-white",
              )}
            >
              Get ranked
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
