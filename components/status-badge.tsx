import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/customers";
import type { CampaignStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<CampaignStatus, string> = {
  new: "bg-accent text-accent-foreground",
  reviewing: "bg-amber-50 text-amber-800",
  active: "bg-emerald-50 text-emerald-800",
  paused: "bg-slate-100 text-slate-700",
  completed: "bg-navy/10 text-navy",
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge className={cn("font-medium", styles[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
