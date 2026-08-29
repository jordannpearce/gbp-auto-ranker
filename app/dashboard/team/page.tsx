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
  title: "Users",
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
            {isAdmin(user) ? "Users" : "Team"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {isAdmin(user)
              ? "Add admins, agency owners, agency users, and business owners. Owners can also add their own team seats."
              : "Add users so more people at the agency can manage the same client book."}
          </p>
        </div>

        {canManageTeam(user) ? (
          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-base font-semibold text-charcoal">
              {isAdmin(user) ? "Add a user" : "Add an agency user"}
            </h2>
            <form
              action="/api/team"
              method="post"
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              {isAdmin(user) ? (
                <>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      name="role"
                      required
                      defaultValue="agency_member"
                      className={cn(selectClassName, "mt-2")}
                    >
                      <option value="admin">Admin</option>
                      <option value="agency_owner">Agency owner</option>
                      <option value="agency_member">Agency user</option>
                      <option value="business_owner">Business owner</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="agencyId">Agency</Label>
                    <select
                      id="agencyId"
                      name="agencyId"
                      defaultValue=""
                      className={cn(selectClassName, "mt-2")}
                    >
                      <option value="">None — admin or business owner</option>
                      {agencies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
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
                <p className="sm:col-span-2 text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              {saved ? (
                <p className="sm:col-span-2 text-sm text-emerald-700" role="status">
                  User added. They can sign in with that email and password.
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
          {members.length === 0 ? (
            <p className="px-5 py-10 text-sm text-muted-foreground">
              No users yet. Add someone above.
            </p>
          ) : (
            <>
              <div
                className={cn(
                  "hidden gap-4 border-b border-border bg-surface px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid",
                  isAdmin(user)
                    ? "grid-cols-[1.1fr_1.2fr_1fr_1fr_0.8fr_auto]"
                    : "grid-cols-[1.2fr_1.2fr_1fr_0.8fr_auto]",
                )}
              >
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                {isAdmin(user) ? <span>Agency</span> : null}
                <span>Email status</span>
                <span>Added</span>
              </div>
              <ul className="divide-y divide-border">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className={cn(
                      "grid gap-1 px-5 py-4 md:items-center",
                      isAdmin(user)
                        ? "md:grid-cols-[1.1fr_1.2fr_1fr_1fr_0.8fr_auto]"
                        : "md:grid-cols-[1.2fr_1.2fr_1fr_0.8fr_auto]",
                    )}
                  >
                    <p className="font-medium text-charcoal">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-sm">{roleLabel(member.role)}</p>
                    {isAdmin(user) ? (
                      <p className="text-sm text-muted-foreground">
                        {agencies.find((item) => item.id === member.agencyId)
                          ?.name || "—"}
                      </p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {member.emailVerifiedAt ? "Confirmed" : "Waiting"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(member.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
