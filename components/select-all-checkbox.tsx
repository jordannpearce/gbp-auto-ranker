"use client";

export function SelectAllCheckbox({
  className,
}: {
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      aria-label="Select all on this page"
      className={className}
      onChange={(event) => {
        const form = event.currentTarget.form;
        if (!form) return;
        const checked = event.currentTarget.checked;
        for (const input of form.querySelectorAll<HTMLInputElement>(
          'input[name="to"]',
        )) {
          if (!input.disabled) input.checked = checked;
        }
      }}
    />
  );
}
