import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdmin, roleLabel } from "@/lib/access";
import { listingsForUser } from "@/lib/attachments";
import { loadDashboardUser } from "@/lib/dashboard";
import { PRIMARY_ADMIN_ID } from "@/lib/primary-admin";
import { listCustomers } from "@/lib/store";
import { getUser, listAgencies } from "@/lib/users";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const member = await getUser((await params).id);
  return { title: member?.name || "User" };
}

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { user, agency } = await loadDashboardUser();
  if (!isAdmin(user)) redirect("/dashboard/team");
  const { id } = await params;
  const { error, saved } = await searchParams;
  const member = await getUser(id);
  if (!member) notFound();

  const [agencies, customers] = await Promise.all([
    listAgencies(),
    listCustomers(),
  ]);
  const listings = listingsForUser(member, customers);
  const locked = member.id === PRIMARY_ADMIN_ID || member.id === user.id;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <DashboardHeader user={user} agencyName={agency?.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <div>
          <Link
            href="/dashboard/team"
            className="text-sm font-medium text-primary hover:underline"
          >
            All users
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
            {member.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {roleLabel(member.role)} · {member.email}. Change the role or
            agency to move this login, including a business owner onto an
            agency.
          </p>
          {saved ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              User saved.
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">Edit user</h2>
          <form
            action={`/api/team/${member.id}`}
            method="post"
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <input type="hidden" name="intent" value="save" />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={member.name}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={member.email}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                required
                defaultValue={member.role}
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
                defaultValue={member.agencyId}
                className={cn(selectClassName, "mt-2")}
              >
                <option value="">None — admin or independent owner</option>
                {agencies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                className="mt-2"
                placeholder="Leave blank to keep the current password"
              />
            </div>
            <p className="sm:col-span-2 text-xs leading-5 text-muted-foreground">
              Agency owner and agency user need an agency. A business owner
              can stay independent or be attached to an agency. Moving an
              agency user off a book clears them as the manager on those
              listings.
            </p>
            <button
              type="submit"
              className={cn(
                buttonVariants(),
                "h-10 px-4 font-semibold brand-gradient text-white sm:w-fit",
              )}
            >
              Save user
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">Listings</h2>
          {listings.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {member.role === "business_owner"
                ? "No listings attached yet."
                : "No agency clients on this login."}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {listings.map((listing) => (
                <li key={listing.id} className="py-3">
                  <Link
                    href={`/dashboard/${listing.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {listing.businessName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {member.role === "business_owner" ? (
            <Link
              href={`/dashboard/clients/new?ownerUserId=${member.id}`}
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Add a listing for this owner
            </Link>
          ) : null}
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Delete this login
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Removes the account. Listings stay in the dashboard. If this
            person managed or owned listings, those links are cleared. Agency
            staff on an agency they owned are not deleted.
          </p>
          {locked ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {member.id === user.id
                ? "You cannot delete the login you are using."
                : "The primary admin login cannot be deleted."}
            </p>
          ) : (
            <form
              action={`/api/team/${member.id}`}
              method="post"
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="intent" value="delete" />
              <label className="flex items-start gap-3 text-sm leading-6 text-charcoal">
                <input
                  type="checkbox"
                  name="confirmDelete"
                  value="yes"
                  required
                  className="mt-1 size-4 accent-red-700"
                />
                <span>Yes, delete this login.</span>
              </label>
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "destructive" }),
                  "h-10 px-4",
                )}
              >
                <Trash2 className="size-4" />
                Delete user
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
