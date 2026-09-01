import { NextResponse } from "next/server";
import { canEditAgency, isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import { parseLeadPreference } from "@/lib/leads";
import { unassignAgencyCustomers } from "@/lib/store";
import { deleteAgency, getAgency, updateAgency } from "@/lib/users";

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
  const intent = String(form.get("intent") ?? "");
  const ownerReturn = `/dashboard/agency`;
  const adminReturn = `/dashboard/agencies/${id}`;
  const returnTo = isAdmin(user) ? adminReturn : ownerReturn;

  if (intent === "save") {
    if (!canEditAgency(user, id)) {
      return redirectTo("/dashboard");
    }
    const leadPreference = parseLeadPreference(form.get("leadPreference"));
    if (!leadPreference) {
      return redirectTo(
        `${returnTo}?error=${encodeURIComponent("Choose exclusive or shared leads.")}`,
      );
    }
    await updateAgency(id, { leadPreference });
    return redirectTo(`${returnTo}?preference=1`);
  }

  if (intent !== "delete") {
    return redirectTo(adminReturn);
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
