import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAgency } from "@/lib/users";

export async function loadDashboardUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const agency = user.agencyId ? await getAgency(user.agencyId) : null;
  return { user, agency };
}
