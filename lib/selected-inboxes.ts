import { parseEmailList } from "@/lib/contact";

export const SELECTED_INBOXES_COOKIE = "gbp_selected_email_to";

export function selectedInboxesCookieOptions(maxAge = 60 * 60) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function mergeInboxSources(
  ...values: Array<string | string[] | undefined>
) {
  return parseEmailList(
    values.flatMap((value) =>
      Array.isArray(value) ? value : value ? [value] : [],
    ),
  );
}
