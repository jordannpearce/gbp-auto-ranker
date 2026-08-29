import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated {updated}
          </p>
          <div className="legal-copy mt-8 space-y-6 text-sm leading-7 text-charcoal [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-charcoal [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-muted-foreground">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
