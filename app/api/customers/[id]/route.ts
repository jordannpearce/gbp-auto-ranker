import { NextResponse } from "next/server";
import { canDeleteCustomer, canSeeCustomer, isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { parseCustomerUpdate } from "@/lib/customers";
import { redirectTo } from "@/lib/http";
import { assignmentChanged, notifyAssignment } from "@/lib/notify";
import { deleteCustomer, getCustomer, updateCustomer } from "@/lib/store";

export const dynamic = "force-dynamic";

function confirmedDuplicate(form: FormData) {
  return String(form.get("confirmDelete") ?? "") === "yes";
}

async function loadOwned(id: string) {
  const user = await getCurrentUser();
  const customer = await getCustomer(id);
  if (!user || !customer || !canSeeCustomer(user, customer)) {
    return { user, customer: null };
  }
  return { user, customer };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { customer } = await loadOwned(id);
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
  const { user, customer } = await loadOwned(id);
  if (!user || !customer) {
    return redirectTo("/dashboard");
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  if (intent === "delete") {
    if (!canDeleteCustomer(user, customer)) {
      return redirectTo(
        `/dashboard/${id}?error=${encodeURIComponent("You cannot remove this listing.")}`,
      );
    }
    if (!confirmedDuplicate(form)) {
      return redirectTo(
        `/dashboard/${id}?error=${encodeURIComponent("Tick the box to confirm you are removing a duplicate.")}`,
      );
    }
    await deleteCustomer(id);
    return redirectTo("/dashboard");
  }

  const updateBody: Record<string, unknown> = {
    status: form.get("status"),
    keywords: form.get("keywords"),
    internalNotes: form.get("internalNotes"),
  };
  if (isAdmin(user)) {
    updateBody.agencyId = form.get("agencyId");
    updateBody.managerUserId = form.get("managerUserId");
    updateBody.ownerUserId = form.get("ownerUserId");
  }

  const parsed = parseCustomerUpdate(updateBody);
  if (parsed.error || !parsed.data) {
    return redirectTo(
      `/dashboard/${id}?error=${encodeURIComponent(parsed.error ?? "Could not save changes.")}`,
    );
  }

  const next = await updateCustomer(id, parsed.data);
  if (!next) return redirectTo("/dashboard");
  if (assignmentChanged(customer, next) && next.agencyId) {
    await notifyAssignment(next);
  }
  return redirectTo(`/dashboard/${id}?saved=1`);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { customer } = await loadOwned(id);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }
  const body = await request.json().catch(() => null);
  const parsed = parseCustomerUpdate(body);
  if (parsed.error || !parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const next = await updateCustomer(id, parsed.data);
  if (next && assignmentChanged(customer, next) && next.agencyId) {
    await notifyAssignment(next);
  }
  return NextResponse.json({ customer: next });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user, customer } = await loadOwned(id);
  if (!user || !customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }
  if (!canDeleteCustomer(user, customer)) {
    return NextResponse.json(
      { error: "You cannot remove this listing." },
      { status: 403 },
    );
  }
  await deleteCustomer(id);
  return NextResponse.json({ ok: true });
}
