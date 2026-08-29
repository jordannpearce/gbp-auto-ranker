"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Could not sign in.");
        return;
      }
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
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
      <div className="mt-6">
        <Label htmlFor="password">Dashboard password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-10"
          placeholder="Enter the operator password"
        />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Local default is <code className="font-mono">gbp-admin</code>. Set{" "}
          <code className="font-mono">DASHBOARD_PASSWORD</code> on Railway
          before you go live.
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="mt-6 h-11 w-full font-semibold brand-gradient text-white"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-surface px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
