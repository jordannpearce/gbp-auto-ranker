import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Check your email",
};

export default async function SignupCheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string; resent?: string }>;
}) {
  const { email, token, resent } = await searchParams;

  return (
    <AuthCard
      title="Check your email"
      copy={
        email
          ? `We sent a confirmation link to ${email}. Open it to activate the agency account.`
          : "We sent a confirmation link to the address you used. Open it to activate the agency account."
      }
    >
      {resent ? (
        <p className="mt-6 text-sm text-emerald-700" role="status">
          A new confirmation email is on the way.
        </p>
      ) : null}
      {token ? (
        <div className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm leading-6 text-charcoal">
          <p>
            Email delivery is not set up on this host, so the confirmation
            link is shown once:
          </p>
          <Link
            href={`/api/auth/confirm?token=${token}`}
            className="mt-2 inline-block font-medium text-primary hover:underline"
          >
            Confirm this account
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          The link expires in 48 hours. Check spam if you do not see it within
          a minute.
        </p>
      )}
      <form
        action="/api/auth/resend-confirm"
        method="post"
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="next" value="/signup/check-email" />
        <div>
          <Label htmlFor="email">Send again to</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={email || ""}
            className="mt-2"
          />
        </div>
        <button
          type="submit"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full font-semibold",
          )}
        >
          Send confirmation again
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
