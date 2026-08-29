import { NextResponse } from "next/server";
import { isAdmin, isAgencyUser, visibleCustomers } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { parseCustomerInput } from "@/lib/customers";
import { redirectTo } from "@/lib/http";
import { notifyAssignment, notifyCampaignReceived } from "@/lib/notify";
import { createCustomer, customerStats, listCustomers } from "@/lib/store";
import { getUser } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const customers = visibleCustomers(user, await listCustomers());
  return NextResponse.json({
    customers,
    stats: customerStats(customers),
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const viaForm = contentType.includes("form");
  let raw: unknown;
  let returnTo = "/get-started";

  if (viaForm) {
    const form = await request.formData();
    raw = Object.fromEntries(form.entries());
    returnTo = String(form.get("returnTo") ?? "/get-started");
  } else {
    raw = await request.json().catch(() => null);
  }

  const parsed = parseCustomerInput(raw);
  if (parsed.error || !parsed.data) {
    if (viaForm) {
      const params = new URLSearchParams({
        error: parsed.error ?? "Could not save this campaign.",
      });
      if (raw && typeof raw === "object" && "agencyId" in raw) {
        const agencyId = String((raw as { agencyId?: string }).agencyId ?? "");
        if (agencyId) params.set("agencyId", agencyId);
      }
      const path = returnTo.startsWith("/dashboard")
        ? `/dashboard/clients/new?${params}`
        : `/get-started?${params}`;
      return redirectTo(path);
    }
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const user = await getCurrentUser();
  let extras: { agencyId?: string; managerUserId?: string } | undefined;
  if (user && isAgencyUser(user)) {
    extras = { agencyId: user.agencyId, managerUserId: user.id };
  } else if (user && isAdmin(user) && raw && typeof raw === "object") {
    const agencyId = String(
      (raw as { agencyId?: string }).agencyId ?? "",
    ).trim();
    const managerUserId = String(
      (raw as { managerUserId?: string }).managerUserId ?? "",
    ).trim();
    if (agencyId) {
      if (managerUserId) {
        const manager = await getUser(managerUserId);
        if (!manager || manager.agencyId !== agencyId) {
          if (viaForm) {
            return redirectTo(
              `/dashboard/clients/new?error=${encodeURIComponent("That user is not on the selected agency.")}`,
            );
          }
          return NextResponse.json(
            { error: "That user is not on the selected agency." },
            { status: 400 },
          );
        }
      }
      extras = { agencyId, managerUserId };
    }
  }

  const customer = await createCustomer(parsed.data, extras);
  await notifyCampaignReceived(customer);
  if (user && isAdmin(user) && customer.agencyId) {
    await notifyAssignment(customer);
  }
  if (viaForm) {
    if (returnTo.startsWith("/dashboard")) {
      return redirectTo(`/dashboard/${customer.id}?saved=1`);
    }
    return redirectTo(`/get-started/success?id=${customer.id}`);
  }
  return NextResponse.json({ customer }, { status: 201 });
}
