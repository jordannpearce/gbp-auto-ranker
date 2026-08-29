import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; token?: string }>;
}) {
  const { sent, token } = await searchParams;

  return (
    <AuthCard
      title="Reset your password"
      copy="Enter the email on the account. If it matches, we’ll send a one-hour reset link."
    >
      {sent ? (
        <div className="mt-6 space-y-3 text-sm">
          <p className="text-charcoal">
            If that email is on file, a reset link is on the way. Check spam if
            you do not see it within a minute.
          </p>
          {token ? (
            <div className="rounded-xl bg-surface px-4 py-3 leading-6">
              <p>
                Email delivery is not configured on this host, so the link is
                shown here once.
              </p>
              <Link
                href={`/reset-password?token=${token}`}
                className="mt-2 inline-block font-medium text-primary hover:underline"
              >
                Continue to reset password
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <form action="/api/auth/forgot" method="post" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
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
            Send reset link
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  );
}
