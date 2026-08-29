"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  }

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
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-3"
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
