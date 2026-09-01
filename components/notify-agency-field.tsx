export function NotifyAgencyField({
  form,
  defaultChecked = true,
  className,
}: {
  form?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 text-sm leading-6 text-charcoal ${className ?? ""}`.trim()}
    >
      <input type="hidden" name="notifyAgency" value="no" form={form} />
      <input
        type="checkbox"
        name="notifyAgency"
        value="yes"
        form={form}
        defaultChecked={defaultChecked}
        className="mt-1 size-4 accent-[#1769E8]"
      />
      <span>
        Email the agency that this listing was assigned. Uncheck only if you
        do not want that message sent.
      </span>
    </label>
  );
}
