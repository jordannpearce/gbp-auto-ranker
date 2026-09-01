import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import { unassignAgencyCustomers } from "@/lib/store";
import { deleteAgency, getAgency } from "@/lib/users";

export const dynamic = "force-dynamic";

function confirmedDuplicate(form: FormData) {
  return String(form.get("confirmDelete") ?? "") === "yes";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user || !isAdmin(user)) {
    return redirectTo("/dashboard");
  }

  const agency = await getAgency(id);
  if (!agency) return redirectTo("/dashboard/agencies");

  const form = await request.formData();
  if (String(form.get("intent") ?? "") !== "delete") {
    return redirectTo(`/dashboard/agencies/${id}`);
  }
  if (!confirmedDuplicate(form)) {
    return redirectTo(
      `/dashboard/agencies/${id}?error=${encodeURIComponent("Tick the box to confirm you are removing a duplicate agency.")}`,
    );
  }

  await unassignAgencyCustomers(id);
  await deleteAgency(id);
  return redirectTo("/dashboard/agencies");
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const agency = await getAgency(id);
  if (!agency) {
    return NextResponse.json({ error: "Agency not found." }, { status: 404 });
  }
  await unassignAgencyCustomers(id);
  await deleteAgency(id);
  return NextResponse.json({ ok: true });
}
