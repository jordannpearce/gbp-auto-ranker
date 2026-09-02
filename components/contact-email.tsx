import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact";

export function ContactEmail({ className }: { className?: string }) {
  return (
    <a
      className={className}
      href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
    >
      {PUBLIC_CONTACT_EMAIL}
    </a>
  );
}
