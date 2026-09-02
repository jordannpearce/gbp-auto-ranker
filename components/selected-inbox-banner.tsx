export function SelectedInboxBanner({
  addresses,
  sent,
}: {
  addresses: string[];
  sent?: string;
}) {
  if (sent || addresses.length === 0) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
      role="status"
    >
      <p>
        Ready to email {addresses.length} selected inbox
        {addresses.length === 1 ? "" : "es"}. Audience is set to Specific
        addresses. Check more rows on Customers, Users, or Agencies if you
        want both kinds of inboxes, then return here. Review the message,
        send a test, then Send email.
      </p>
      <form action="/api/emails/select" method="post" className="mt-2">
        <input type="hidden" name="intent" value="clear" />
        <button
          type="submit"
          className="text-sm font-medium text-primary hover:underline"
        >
          Clear selected
        </button>
      </form>
    </div>
  );
}
