import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-surface px-4 py-16">
      <form
        action="/api/auth/login"
        method="post"
        className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-[0_16px_50px_-36px_rgba(8,43,117,0.45)]"
      >
        <div className="flex justify-center">
          <BrandLogo href="/" size="auth" />
        </div>
        <h1 className="mt-2 text-center text-2xl font-semibold text-charcoal">
          Customer dashboard
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to review listings, keywords, and campaign status.
        </p>
        <input type="hidden" name="next" value={next || "/dashboard"} />
        <div className="mt-6">
          <Label htmlFor="password">Dashboard password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2"
            placeholder="Enter the operator password"
          />
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            That password does not match.
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Local default is <code className="font-mono">gbp-admin</code>. Set{" "}
            <code className="font-mono">DASHBOARD_PASSWORD</code> on Railway
            before you go live.
          </p>
        )}
        <button
          type="submit"
          className={cn(
            buttonVariants(),
            "mt-6 h-11 w-full font-semibold brand-gradient text-white",
          )}
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
