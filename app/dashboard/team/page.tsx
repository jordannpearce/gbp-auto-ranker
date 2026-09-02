import type { Metadata } from "next";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  EmailSelectBox,
  EmailSelectForm,
  EmailSelectedBar,
} from "@/components/email-select";
import { selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canManageTeam, isAdmin, roleLabel } from "@/lib/access";
import { attachmentLabel, listingsForUser } from "@/lib/attachments";
import { loadDashboardUser } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";
import { listCustomers } from "@/lib/store";
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
  const [agencies, customers] = await Promise.all([
    listAgencies(),
    listCustomers(),
  ]);
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
              ? "A user is a login. A customer is a listing. Business owners only appear on Customers after you add a listing and attach it to them. Check boxes to email specific logins."
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
              {isAdmin(user) ? (
                <p className="sm:col-span-2 text-xs leading-5 text-muted-foreground">
                  Creating a business owner only creates their login. Add a
                  listing and assign that owner so they show on Customers.
                </p>
              ) : null}
            </form>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-border bg-white">
          {members.length === 0 ? (
            <p className="px-5 py-10 text-sm text-muted-foreground">
              No users yet. Add someone above.
            </p>
          ) : (
            <EmailSelectForm>
              <div className="flex border-b border-border bg-surface">
                {isAdmin(user) ? (
                  <div className="hidden w-12 shrink-0 md:block" aria-hidden />
                ) : null}
                <div
                  className={cn(
                    "hidden flex-1 gap-4 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid",
                    isAdmin(user)
                      ? "grid-cols-[1.1fr_1.2fr_0.9fr_1.1fr_1.4fr_0.8fr_auto]"
                      : "grid-cols-[1.2fr_1.2fr_1fr_1.4fr_0.8fr_auto]",
                  )}
                >
                  <span>Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  {isAdmin(user) ? <span>Agency / staff</span> : null}
                  <span>Listings</span>
                  <span>Email status</span>
                  <span>Added</span>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {members.map((member) => {
                  const listings = listingsForUser(member, customers);
                  const attached = attachmentLabel(member, agencies);
                  return (
                    <li key={member.id} className="flex items-stretch">
                      {isAdmin(user) ? (
                        <div className="flex shrink-0 items-start px-4 pt-5">
                          <EmailSelectBox
                            value={member.email}
                            title={`Email ${member.email}`}
                          />
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          "min-w-0 flex-1 grid gap-1 px-5 py-4 md:items-start",
                          isAdmin(user)
                            ? "md:grid-cols-[1.1fr_1.2fr_0.9fr_1.1fr_1.4fr_0.8fr_auto]"
                            : "md:grid-cols-[1.2fr_1.2fr_1fr_1.4fr_0.8fr_auto]",
                        )}
                      >
                        <p className="font-medium text-charcoal">
                          {member.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                        <p className="text-sm">{roleLabel(member.role)}</p>
                        {isAdmin(user) ? (
                          <p className="text-sm text-charcoal">{attached}</p>
                        ) : null}
                        <div className="text-sm">
                          {member.role === "admin" ? (
                            <p className="text-muted-foreground">
                              All customers
                            </p>
                          ) : listings.length === 0 ? (
                            <p className="text-muted-foreground">
                              {member.role === "business_owner"
                                ? "No listings yet"
                                : "No clients yet"}
                            </p>
                          ) : (
                            <ul className="space-y-1">
                              {listings.slice(0, 3).map((listing) => (
                                <li key={listing.id}>
                                  <Link
                                    href={`/dashboard/${listing.id}`}
                                    className="font-medium text-primary hover:underline"
                                  >
                                    {listing.businessName}
                                  </Link>
                                </li>
                              ))}
                              {listings.length > 3 ? (
                                <li className="text-xs text-muted-foreground">
                                  +{listings.length - 3} more
                                </li>
                              ) : null}
                            </ul>
                          )}
                          {isAdmin(user) &&
                          member.role === "business_owner" ? (
                            <Link
                              href={`/dashboard/clients/new?ownerUserId=${member.id}`}
                              className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                            >
                              Add a listing
                            </Link>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.emailVerifiedAt ? "Confirmed" : "Waiting"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(member.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {isAdmin(user) ? (
                <EmailSelectedBar emptyHint="Check users to email their login inbox." />
              ) : null}
            </EmailSelectForm>
          )}
        </section>
      </main>
    </div>
  );
}
