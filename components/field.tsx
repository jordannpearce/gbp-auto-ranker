import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  required,
  className,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label} {required ? <span className="text-primary">*</span> : null}
      </Label>
      <div className="mt-2">{children}</div>
      {hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-charcoal">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
