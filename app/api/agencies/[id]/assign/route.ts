import { isAdmin } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { redirectTo } from "@/lib/http";
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

  await updateCustomer(customerId, {
    agencyId: id,
    managerUserId,
  });
  return redirectTo(`/dashboard/agencies/${id}?saved=1`);
}
