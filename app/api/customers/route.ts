import { NextResponse } from "next/server";
import { parseCustomerInput } from "@/lib/customers";
import { redirectTo } from "@/lib/http";
import { createCustomer, customerStats, listCustomers } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json({
    customers,
    stats: customerStats(customers),
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const viaForm = contentType.includes("form");
  let raw: unknown;

  if (viaForm) {
    const form = await request.formData();
    raw = Object.fromEntries(form.entries());
  } else {
    raw = await request.json().catch(() => null);
  }

  const parsed = parseCustomerInput(raw);
  if (parsed.error || !parsed.data) {
    if (viaForm) {
      return redirectTo(
        `/get-started?error=${encodeURIComponent(parsed.error ?? "Could not save this campaign.")}`,
      );
    }
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const customer = await createCustomer(parsed.data);
  if (viaForm) {
    return redirectTo(`/get-started/success?id=${customer.id}`);
  }
  return NextResponse.json({ customer }, { status: 201 });
}
