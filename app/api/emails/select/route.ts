import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { parseEmailList } from "@/lib/contact";
import { redirectTo } from "@/lib/http";
import {
  SELECTED_INBOXES_COOKIE,
  selectedInboxesCookieOptions,
} from "@/lib/selected-inboxes";
import {
  addSelectedInboxes,
  clearSelectedInboxes,
} from "@/lib/selected-inbox-store";

function composePath(compose: string, addresses: string[]) {
  const params = new URLSearchParams();
  params.set("compose", compose || "info");
  for (const email of addresses) params.append("to", email);
  return `/dashboard/emails?${params}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return redirectTo("/dashboard");
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "add");
  const compose = String(form.get("compose") ?? "info");
  const incoming = parseEmailList(form.getAll("to").map(String));

  if (intent === "clear") {
    await clearSelectedInboxes(user.id);
    const response = redirectTo("/dashboard/emails?compose=info");
    response.cookies.set(
      SELECTED_INBOXES_COOKIE,
      "",
      selectedInboxesCookieOptions(0),
    );
    return response;
  }

  const merged = await addSelectedInboxes(user.id, incoming);
  if (merged.length === 0) {
    return redirectTo(
      `/dashboard/emails?error=${encodeURIComponent("Check at least one customer, user, or agency with an email.")}`,
    );
  }

  const response = redirectTo(composePath(compose, merged));
  response.cookies.set(
    SELECTED_INBOXES_COOKIE,
    merged.join(" "),
    selectedInboxesCookieOptions(),
  );
  return response;
}
