import { Field, FormSection, selectClassName } from "@/components/field";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PRIMARY_GOALS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function IntakeForm({
  error,
  returnTo,
}: {
  error?: string;
  returnTo?: string;
}) {
  return (
    <form action="/api/customers" method="post" className="space-y-10">
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <FormSection
        eyebrow="Contact"
        title="Who should we work with?"
        copy="We’ll use this to confirm the listing and send campaign updates."
      >
        <Field label="Full name" htmlFor="contactName" required>
          <Input
            id="contactName"
            name="contactName"
            required
            autoComplete="name"
            placeholder="Jordan Hale"
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@business.com"
          />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
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
            autoComplete="street-address"
            placeholder="123 Main Street"
          />
        </Field>
        <Field label="City" htmlFor="city" required>
          <Input
            id="city"
            name="city"
            required
            autoComplete="address-level2"
            placeholder="Austin"
          />
        </Field>
        <Field label="State" htmlFor="state" required>
          <Input
            id="state"
            name="state"
            required
            autoComplete="address-level1"
            placeholder="CA"
          />
        </Field>
        <Field label="ZIP" htmlFor="zip">
          <Input
            id="zip"
            name="zip"
            autoComplete="postal-code"
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
            placeholder={"dentist near me\nemergency dentist Sausalito\nteeth whitening"}
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
          Submissions land in the customer dashboard so the campaign can start
          with the exact keywords you listed.
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
