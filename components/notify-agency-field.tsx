export function NotifyAgencyField({
  form,
  defaultChecked = false,
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
      <input
        type="checkbox"
        name="notifyAgency"
        value="yes"
        form={form}
        defaultChecked={defaultChecked}
        className="mt-1 size-4 accent-[#1769E8]"
      />
      <span>Email the agency that a new lead was assigned.</span>
    </label>
  );
}
