import { Field, FormSection, selectClassName } from "@/components/field";
import { NotifyAgencyField } from "@/components/notify-agency-field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Agency, PublicUser } from "@/lib/types";
import { PRIMARY_GOALS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function IntakeForm({
  error,
  returnTo,
  assignment,
}: {
  error?: string;
  returnTo?: string;
  assignment?: {
    agencies: Agency[];
    users: PublicUser[];
    owners?: PublicUser[];
    defaultAgencyId?: string;
    defaultOwnerUserId?: string;
  };
}) {
  return (
    <form
      action="/api/customers"
      method="post"
      className="space-y-10"
      autoComplete="off"
    >
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {assignment ? (
        <FormSection
          eyebrow="Assignment"
          title="Who owns this campaign?"
          copy="Assign an agency, a business owner, or leave the listing in the admin queue."
        >
          {assignment.owners ? (
            <Field label="Business owner" htmlFor="ownerUserId">
              <select
                id="ownerUserId"
                name="ownerUserId"
                defaultValue={assignment.defaultOwnerUserId || ""}
                className={selectClassName}
              >
                <option value="">No business login</option>
                {assignment.owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} · {owner.email}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          <Field label="Agency" htmlFor="agencyId">
            <select
              id="agencyId"
              name="agencyId"
              defaultValue={assignment.defaultAgencyId || ""}
              className={selectClassName}
            >
              <option value="">Unassigned</option>
              {assignment.agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Agency user" htmlFor="managerUserId">
            <select
              id="managerUserId"
              name="managerUserId"
              defaultValue=""
              className={selectClassName}
            >
              <option value="">Whole agency</option>
              {assignment.users
                .filter(
                  (item) =>
                    item.role === "agency_owner" ||
                    item.role === "agency_member",
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {assignment.agencies.find((agency) => agency.id === item.agencyId)
                      ? ` · ${assignment.agencies.find((agency) => agency.id === item.agencyId)?.name}`
                      : ""}
                  </option>
                ))}
            </select>
          </Field>
          <NotifyAgencyField className="sm:col-span-2" />
        </FormSection>
      ) : null}
      <FormSection
        eyebrow="Contact"
        title="Who should we work with?"
        copy="Optional. We’ll use this to confirm the listing and send campaign updates if you add it."
      >
        <Field label="Full name" htmlFor="contactName">
          <Input
            id="contactName"
            name="contactName"
            autoComplete="off"
            placeholder="Jordan Hale"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="you@business.com"
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="off"
            placeholder="(555) 123-4567"
          />
        </Field>
        <Field label="Your role" htmlFor="role">
          <select
            id="role"
            name="role"
            defaultValue="Owner"
            className={selectClassName}
          >
            {["Owner", "Manager", "Marketing", "Other"].map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

      <FormSection
        eyebrow="Business"
        title="Tell us the listing"
        copy="The Google Maps link is how we lock onto the exact profile we will rank."
      >
        <Field
          label="Business name"
          htmlFor="businessName"
          required
          className="sm:col-span-2"
        >
          <Input
            id="businessName"
            name="businessName"
            required
            placeholder="Your business name"
          />
        </Field>
        <Field label="Category" htmlFor="category" required>
          <Input
            id="category"
            name="category"
            required
            placeholder="Dentist, auto repair, florist…"
          />
        </Field>
        <Field
          label="Street address"
          htmlFor="address"
          className="sm:col-span-2"
        >
          <Input
            id="address"
            name="address"
            autoComplete="off"
            placeholder="123 Main Street"
          />
        </Field>
        <Field label="City" htmlFor="city" required>
          <Input
            id="city"
            name="city"
            required
            autoComplete="off"
            placeholder="Austin"
          />
        </Field>
        <Field label="State" htmlFor="state" required>
          <Input
            id="state"
            name="state"
            required
            autoComplete="off"
            placeholder="CA"
          />
        </Field>
        <Field label="ZIP" htmlFor="zip">
          <Input
            id="zip"
            name="zip"
            autoComplete="off"
            placeholder="94965"
          />
        </Field>
        <Field
          label="Google Maps link"
          htmlFor="googleMapsUrl"
          required
          className="sm:col-span-2"
        >
          <Input
            id="googleMapsUrl"
            name="googleMapsUrl"
            type="url"
            required
            placeholder="https://maps.google.com/…"
          />
        </Field>
        <Field label="Website" htmlFor="website" className="sm:col-span-2">
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://yourbusiness.com"
          />
        </Field>
      </FormSection>

      <FormSection
        eyebrow="Keywords"
        title="What should you rank for?"
        copy="These are the searches we will run, click, and engage against your listing."
      >
        <Field
          label="Target keywords"
          htmlFor="keywords"
          required
          className="sm:col-span-2"
          hint="One keyword per line, or a comma-separated list. Example: dentist near me, emergency dentist, teeth whitening"
        >
          <Textarea
            id="keywords"
            name="keywords"
            required
            rows={5}
            placeholder={"dentist near me\nemergency dentist\nteeth whitening"}
          />
        </Field>
        <Field
          label="Service area"
          htmlFor="serviceArea"
          className="sm:col-span-2"
        >
          <Input
            id="serviceArea"
            name="serviceArea"
            placeholder="Neighborhoods or cities you serve"
          />
        </Field>
        <Field
          label="Primary goal"
          htmlFor="primaryGoal"
          className="sm:col-span-2"
        >
          <select
            id="primaryGoal"
            name="primaryGoal"
            defaultValue={PRIMARY_GOALS[0]}
            className={selectClassName}
          >
            {PRIMARY_GOALS.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

      <FormSection
        eyebrow="Comments"
        title="Anything else we should know?"
        copy="Competitors, hours, photos, or ranking problems — the more context, the better the campaign."
      >
        <Field label="Comments" htmlFor="comments" className="sm:col-span-2">
          <Textarea
            id="comments"
            name="comments"
            rows={5}
            placeholder="Current ranking issues, competitors to beat, hours that matter most…"
          />
        </Field>
        <Field
          label="How did you hear about us?"
          htmlFor="referralSource"
          className="sm:col-span-2"
        >
          <Input
            id="referralSource"
            name="referralSource"
            placeholder="Referral, search, Instagram…"
          />
        </Field>
      </FormSection>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Save this listing so the campaign can start with the keywords you
          listed.
        </p>
        <button
          type="submit"
          className={cn(
            buttonVariants(),
            "h-11 px-6 font-semibold brand-gradient text-white",
          )}
        >
          Submit campaign
        </button>
      </div>
    </form>
  );
}
