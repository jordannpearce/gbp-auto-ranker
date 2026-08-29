import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    next?: string;
    reset?: string;
    unverified?: string;
    email?: string;
    resent?: string;
    token?: string;
  }>;
}) {
  const { error, next, reset, unverified, email, resent, token } =
    await searchParams;

  return (
    <AuthCard
      title="Log in"
      copy="Agency teams and admins use the same door. Enter the email and password for your account."
    >
      <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next || "/dashboard"} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2"
            placeholder="you@agency.com"
            defaultValue={email || ""}
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2"
            placeholder="Your password"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            That email or password does not match.
          </p>
        ) : null}
        {unverified ? (
          <div className="space-y-2 text-sm" role="alert">
            <p className="text-red-600">
              Confirm your email before signing in. Check your inbox, or resend
              the link.
            </p>
            {token ? (
              <p>
                <Link
                  href={`/api/auth/confirm?token=${token}`}
                  className="font-medium text-primary hover:underline"
                >
                  Confirm this account
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        {resent ? (
          <p className="text-sm text-emerald-700" role="status">
            If that account still needs confirmation, a new email is on the way.
          </p>
        ) : null}
        {reset ? (
          <p className="text-sm text-emerald-700" role="status">
            Password updated. Sign in with the new one.
          </p>
        ) : null}
        <button
          type="submit"
          className={cn(
            buttonVariants(),
            "h-11 w-full font-semibold brand-gradient text-white",
          )}
        >
          Sign in
        </button>
      </form>
      {unverified ? (
        <form action="/api/auth/resend-confirm" method="post" className="mt-4">
          <input type="hidden" name="next" value="/login" />
          <input type="hidden" name="email" value={email || ""} />
          <button
            type="submit"
            className="text-sm font-medium text-primary hover:underline"
          >
            Resend confirmation email
          </button>
        </form>
      ) : null}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        SEO agency?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an agency account
        </Link>
      </p>
      <div className="mt-6 rounded-xl bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
        <p className="font-semibold text-charcoal">Demo accounts</p>
        <p>Admin: admin@gbpautoranker.com / Admin1234!</p>
        <p>Agency owner: maya@northstarlocal.com / Agency1234!</p>
        <p>Agency user: leo@northstarlocal.com / Agency1234!</p>
      </div>
    </AuthCard>
  );
}
