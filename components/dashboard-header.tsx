import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import {
  canManageTeam,
  isAdmin,
  isBusinessOwner,
  roleLabel,
} from "@/lib/access";
import type { PublicUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  user,
  agencyName,
}: {
  user: PublicUser;
  agencyName?: string;
}) {
  const links = [
    {
      href: "/dashboard",
      label: isAdmin(user)
        ? "Customers"
        : isBusinessOwner(user)
          ? "Locations"
          : "Clients",
    },
  ];
  if (isAdmin(user)) {
    links.push({ href: "/dashboard/agencies", label: "Agencies" });
    links.push({ href: "/dashboard/emails", label: "Emails" });
  }
  if (canManageTeam(user) || user.agencyId) {
    links.push({
      href: "/dashboard/team",
      label: isAdmin(user) ? "Users" : "Team",
    });
  }

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex min-h-[5.25rem] w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-charcoal">
              {agencyName || "GBP Auto Ranker"}
            </p>
            <p className="text-xs text-muted-foreground">
              {roleLabel(user.role)} · {user.name}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard/clients/new"
            className={cn(buttonVariants({ variant: "outline" }), "h-9 px-3")}
          >
            {isBusinessOwner(user) ? "New location" : "New client"}
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "ghost" }), "h-9 px-3")}
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
