import { selectClassName } from "@/components/field";
import { Label } from "@/components/ui/label";
import { leadPreferenceLabel } from "@/lib/leads";
import { LEAD_PREFERENCES, type LeadPreference } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LeadPreferenceField({
  defaultValue = "exclusive",
  name = "leadPreference",
  id = "leadPreference",
}: {
  defaultValue?: LeadPreference;
  name?: string;
  id?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>Lead preference</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className={cn(selectClassName, "mt-2")}
      >
        {LEAD_PREFERENCES.map((value) => (
          <option key={value} value={value}>
            {leadPreferenceLabel(value)}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
        Exclusive: only listings assigned to this agency. Shared: listings that
        may also be offered to other agencies.
      </p>
    </div>
  );
}
