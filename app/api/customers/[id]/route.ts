import { NextResponse } from "next/server";
import { parseCustomerUpdate } from "@/lib/customers";
import { redirectTo } from "@/lib/http";
import { deleteCustomer, getCustomer, updateCustomer } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }
  return NextResponse.json({ customer });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  if (intent === "delete") {
    await deleteCustomer(id);
    return redirectTo("/dashboard");
  }

  const parsed = parseCustomerUpdate({
    status: form.get("status"),
    keywords: form.get("keywords"),
    internalNotes: form.get("internalNotes"),
  });
  if (parsed.error || !parsed.data) {
    return redirectTo(
      `/dashboard/${id}?error=${encodeURIComponent(parsed.error ?? "Could not save changes.")}`,
    );
  }

  const customer = await updateCustomer(id, parsed.data);
  if (!customer) {
    return redirectTo("/dashboard");
  }
  return redirectTo(`/dashboard/${id}?saved=1`);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = parseCustomerUpdate(body);
  if (parsed.error || !parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const customer = await updateCustomer(id, parsed.data);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }
  return NextResponse.json({ customer });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = await deleteCustomer(id);
  if (!removed) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
