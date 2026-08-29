import { BrandLogo } from "@/components/brand-logo";

export function AuthCard({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-surface px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-[0_16px_50px_-36px_rgba(8,43,117,0.45)]">
        <div className="flex justify-center">
          <BrandLogo href="/" size="auth" />
        </div>
        <h1 className="mt-2 text-center text-2xl font-semibold text-charcoal">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{copy}</p>
        {children}
      </div>
    </div>
  );
}
