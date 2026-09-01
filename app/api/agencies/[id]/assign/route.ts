import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
import {
  assignmentNotifyQuery,
  notifyAssignment,
  wantsNotifyAgency,
} from "@/lib/notify";
import { getCustomer, updateCustomer } from "@/lib/store";
import { getAgency } from "@/lib/users";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return redirectTo("/dashboard");
  }
  const { id } = await params;
  const agency = await getAgency(id);
  if (!agency) return redirectTo("/dashboard/agencies");

  const form = await request.formData();
  const customerId = String(form.get("customerId") ?? "");
  const managerUserId = String(form.get("managerUserId") ?? "");
  const customer = await getCustomer(customerId);
  if (!customer) {
    return redirectTo(
      `/dashboard/agencies/${id}?error=${encodeURIComponent("Customer not found.")}`,
    );
  }

  const next = await updateCustomer(customerId, {
    agencyId: id,
    managerUserId,
  });
  const query = new URLSearchParams({ saved: "1" });
  if (next) {
    const notified = await notifyAssignment(next, {
      notifyAgency: wantsNotifyAgency(form),
    });
    assignmentNotifyQuery(notified).forEach((value, key) => {
      query.set(key, value);
    });
  }
  return redirectTo(`/dashboard/agencies/${id}?${query}`);
}
