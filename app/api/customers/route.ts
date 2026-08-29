import { NextResponse } from "next/server";
import { parseCustomerInput } from "@/lib/customers";
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
  const body = await request.json().catch(() => null);
  const parsed = parseCustomerInput(body);
  if (parsed.error || !parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const customer = await createCustomer(parsed.data);
  return NextResponse.json({ customer }, { status: 201 });
}
