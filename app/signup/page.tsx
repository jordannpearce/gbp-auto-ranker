import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { LeadPreferenceField } from "@/components/lead-preference-field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create an account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; as?: string }>;
}) {
  const { error, as } = await searchParams;
  const isBusiness = as === "business";

  return (
    <AuthCard
      title={isBusiness ? "Create a business account" : "Create an agency account"}
      copy={
        isBusiness
          ? "Own a Google Business Profile? Create an account so you can add locations and see each campaign. We’ll email a confirmation link before you can sign in."
          : "White-label GBP Auto Ranker for the businesses you manage. We’ll email a confirmation link before you can sign in."
      }
    >
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-surface p-1">
        <Link
          href="/signup"
          className={cn(
            "rounded-lg px-3 py-2 text-center text-sm font-medium",
            !isBusiness
              ? "bg-white text-charcoal shadow-sm"
              : "text-muted-foreground hover:text-charcoal",
          )}
        >
          SEO agency
        </Link>
        <Link
          href="/signup?as=business"
          className={cn(
            "rounded-lg px-3 py-2 text-center text-sm font-medium",
            isBusiness
              ? "bg-white text-charcoal shadow-sm"
              : "text-muted-foreground hover:text-charcoal",
          )}
        >
          Business owner
        </Link>
      </div>
      <form action="/api/auth/signup" method="post" className="mt-6 space-y-4">
        <input
          type="hidden"
          name="accountType"
          value={isBusiness ? "business" : "agency"}
        />
        {isBusiness ? null : (
          <>
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
            <LeadPreferenceField />
          </>
        )}
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="mt-2"
            placeholder="Your name"
          />
        </div>
        <div>
          <Label htmlFor="email">{isBusiness ? "Email" : "Work email"}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2"
            placeholder={isBusiness ? "you@business.com" : "you@agency.com"}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
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
            "h-11 w-full font-semibold brand-gradient text-white",
          )}
        >
          {isBusiness ? "Create business account" : "Create agency account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
