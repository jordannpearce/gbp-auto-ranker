import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canManageTeam, isAdmin, roleLabel } from "@/lib/access";
import { loadDashboardUser } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";
import { listAgencies, listAgencyUsers, listUsers } from "@/lib/users";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Team",
};

export const dynamic = "force-dynamic";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { user, agency } = await loadDashboardUser();
  const { error, saved } = await searchParams;
  const agencies = await listAgencies();
  const members = user.agencyId
    ? await listAgencyUsers(user.agencyId)
    : isAdmin(user)
      ? await listUsers()
      : [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
            Team
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Add users so more people at the agency can manage the same client
            book. Owners and admins can create seats.
          </p>
        </div>

        {canManageTeam(user) ? (
          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-base font-semibold text-charcoal">
              Add an agency user
            </h2>
            <form
              action="/api/team"
              method="post"
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              {isAdmin(user) ? (
                <div className="sm:col-span-2">
                  <Label htmlFor="agencyId">Agency</Label>
                  <select
                    id="agencyId"
                    name="agencyId"
                    required
                    defaultValue={user.agencyId}
                    className={cn(selectClassName, "mt-2")}
                  >
                    <option value="">Select an agency</option>
                    {agencies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-2"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="password">Temporary password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="mt-2"
                />
              </div>
              {error ? (
                <p className="sm:col-span-2 text-sm text-red-600">{error}</p>
              ) : null}
              {saved ? (
                <p className="sm:col-span-2 text-sm text-emerald-700">
                  Team member added.
                </p>
              ) : null}
              <button
                type="submit"
                className={cn(
                  buttonVariants(),
                  "h-10 px-4 font-semibold brand-gradient text-white sm:col-span-2 sm:w-fit",
                )}
              >
                Add user
              </button>
            </form>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="hidden grid-cols-[1.2fr_1.2fr_1fr_0.8fr_auto] gap-4 border-b border-border bg-surface px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Email status</span>
            <span>Added</span>
          </div>
          <ul className="divide-y divide-border">
            {members
              .filter((member) => (isAdmin(user) ? member.role !== "admin" : true))
              .map((member) => (
                <li
                  key={member.id}
                  className="grid gap-1 px-5 py-4 md:grid-cols-[1.2fr_1.2fr_1fr_0.8fr_auto] md:items-center"
                >
                  <p className="font-medium text-charcoal">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-sm">{roleLabel(member.role)}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.emailVerifiedAt ? "Confirmed" : "Waiting"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </p>
                </li>
              ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
