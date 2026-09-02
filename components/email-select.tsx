import { buttonVariants } from "@/components/ui/button";
import { SelectAllCheckbox } from "@/components/select-all-checkbox";
import { cn } from "@/lib/utils";

export function EmailSelectForm({
  children,
  compose = "info",
}: {
  children: React.ReactNode;
  compose?: string;
}) {
  return (
    <form action="/dashboard/emails" method="get" className="space-y-0">
      <input type="hidden" name="compose" value={compose} />
      {children}
    </form>
  );
}

export function EmailSelectBox({
  value,
  disabled,
  title,
}: {
  value: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <input
      type="checkbox"
      name="to"
      value={value}
      disabled={disabled || !value}
      title={title || (value ? "Include this inbox" : "No email on this row")}
      className="size-4 accent-[#1769E8] disabled:opacity-40"
    />
  );
}

export function EmailSelectedBar({
  emptyHint,
}: {
  emptyHint: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <SelectAllCheckbox className="size-4 accent-[#1769E8]" />
        <span>{emptyHint}</span>
      </div>
      <button
        type="submit"
        className={cn(
          buttonVariants(),
          "h-10 w-fit px-4 font-semibold brand-gradient text-white",
        )}
      >
        Email selected
      </button>
    </div>
  );
}
