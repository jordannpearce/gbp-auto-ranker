import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdmin } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Add agency",
};

export const dynamic = "force-dynamic";

export default async function NewAgencyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, agency } = await loadDashboardUser();
  if (!isAdmin(user)) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/dashboard/agencies"
          className="text-sm font-medium text-primary hover:underline"
        >
          All agencies
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
          Add an agency
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Creates the agency and an owner login. The owner can sign in right
          away and add their own clients and team users.
        </p>
        <form
          action="/api/agencies"
          method="post"
          className="mt-8 space-y-4 rounded-2xl border border-border bg-white p-6"
        >
          <div>
            <Label htmlFor="agencyName">Agency name</Label>
            <Input
              id="agencyName"
              name="agencyName"
              required
              className="mt-2"
              placeholder="Your agency"
            />
          </div>
          <div>
            <Label htmlFor="website">Agency website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              className="mt-2"
              placeholder="https://youragency.com"
            />
          </div>
          <div>
            <Label htmlFor="name">Owner name</Label>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              className="mt-2"
              placeholder="Owner name"
            />
          </div>
          <div>
            <Label htmlFor="email">Owner email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2"
              placeholder="owner@agency.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Temporary password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2"
              placeholder="At least 8 characters"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className={cn(
              buttonVariants(),
              "h-10 font-semibold brand-gradient text-white",
            )}
          >
            Create agency
          </button>
        </form>
      </main>
    </div>
  );
}
