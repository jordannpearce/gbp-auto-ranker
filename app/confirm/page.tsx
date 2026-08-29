import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Confirm your email",
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    email?: string;
    resent?: string;
    token?: string;
  }>;
}) {
  const { error, email, resent, token } = await searchParams;

  return (
    <AuthCard
      title="Confirm your email"
      copy="New agency accounts have to confirm a work email before they can sign in."
    >
      {error ? (
        <p className="mt-6 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {resent ? (
        <p className="mt-6 text-sm text-emerald-700" role="status">
          If that email still needs confirmation, we sent a fresh link.
        </p>
      ) : null}
      {token ? (
        <p className="mt-4 text-sm text-charcoal">
          Email delivery is not configured on this host, so use this link once:{" "}
          <Link
            href={`/api/auth/confirm?token=${token}`}
            className="font-medium text-primary hover:underline"
          >
            Confirm this account
          </Link>
        </p>
      ) : null}
      <form action="/api/auth/resend-confirm" method="post" className="mt-6 space-y-4">
        <input type="hidden" name="next" value="/confirm" />
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={email || ""}
            autoComplete="email"
            className="mt-2"
            placeholder="you@agency.com"
          />
        </div>
        <button
          type="submit"
          className={cn(
            buttonVariants(),
            "h-11 w-full font-semibold brand-gradient text-white",
          )}
        >
          Resend confirmation
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  );
}
