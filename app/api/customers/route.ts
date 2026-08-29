import { NextResponse } from "next/server";
import { isAgencyUser } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { parseCustomerInput } from "@/lib/customers";
import { redirectTo } from "@/lib/http";
import { createCustomer, customerStats, listCustomers } from "@/lib/store";
import { visibleCustomers } from "@/lib/access";

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
      const errorPath = returnTo.startsWith("/dashboard")
        ? "/dashboard/clients/new"
        : "/get-started";
      return redirectTo(
        `${errorPath}?error=${encodeURIComponent(parsed.error ?? "Could not save this campaign.")}`,
      );
    }
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const user = await getCurrentUser();
  const extras =
    user && isAgencyUser(user)
      ? { agencyId: user.agencyId, managerUserId: user.id }
      : undefined;

  const customer = await createCustomer(parsed.data, extras);
  if (viaForm) {
    if (returnTo.startsWith("/dashboard")) {
      return redirectTo(`/dashboard/${customer.id}?saved=1`);
    }
    return redirectTo(`/get-started/success?id=${customer.id}`);
  }
  return NextResponse.json({ customer }, { status: 201 });
}
