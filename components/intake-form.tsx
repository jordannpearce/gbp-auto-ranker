"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { KeywordField } from "@/components/keyword-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIMARY_GOALS } from "@/lib/types";

const emptyForm = {
  contactName: "",
  email: "",
  phone: "",
  role: "Owner",
  businessName: "",
  category: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  website: "",
  googleMapsUrl: "",
  serviceArea: "",
  primaryGoal: "Rank in the map pack",
  comments: "",
  referralSource: "",
};

export function IntakeForm() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function setField(name: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, keywords }),
      });
      const payload = (await response.json()) as {
        error?: string;
        customer?: { id: string };
      };
      if (!response.ok) {
        setError(payload.error || "We could not save this campaign.");
        return;
      }
      router.push(`/get-started/success?id=${payload.customer?.id ?? ""}`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <Section
        eyebrow="Contact"
        title="Who should we work with?"
        copy="We’ll use this to confirm the listing and send campaign updates."
      >
        <Field label="Full name" htmlFor="contactName" required>
          <Input
            id="contactName"
            required
            value={form.contactName}
            onChange={(event) => setField("contactName", event.target.value)}
            placeholder="Jordan Hale"
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="you@business.com"
          />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input
            id="phone"
            required
            value={form.phone}
            onChange={(event) => setField("phone", event.target.value)}
            placeholder="(555) 123-4567"
          />
        </Field>
        <Field label="Your role" htmlFor="role">
          <Select
            value={form.role}
            onValueChange={(value) => setField("role", value ?? "Owner")}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {["Owner", "Manager", "Marketing", "Other"].map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section
        eyebrow="Business"
        title="Tell us about the listing"
        copy="The Google Maps link is how we lock onto the exact profile we will rank."
      >
        <Field label="Business name" htmlFor="businessName" required className="sm:col-span-2">
          <Input
            id="businessName"
            required
            value={form.businessName}
            onChange={(event) => setField("businessName", event.target.value)}
            placeholder="Harbor Street Dental"
          />
        </Field>
        <Field label="Category" htmlFor="category" required>
          <Input
            id="category"
            required
            value={form.category}
            onChange={(event) => setField("category", event.target.value)}
            placeholder="Dentist, auto repair, florist…"
          />
        </Field>
        <Field label="Street address" htmlFor="address" className="sm:col-span-2">
          <Input
            id="address"
            value={form.address}
            onChange={(event) => setField("address", event.target.value)}
            placeholder="418 Harbor Street"
          />
        </Field>
        <Field label="City" htmlFor="city" required>
          <Input
            id="city"
            required
            value={form.city}
            onChange={(event) => setField("city", event.target.value)}
            placeholder="Sausalito"
          />
        </Field>
        <Field label="State" htmlFor="state" required>
          <Input
            id="state"
            required
            value={form.state}
            onChange={(event) => setField("state", event.target.value)}
            placeholder="CA"
          />
        </Field>
        <Field label="ZIP" htmlFor="zip">
          <Input
            id="zip"
            value={form.zip}
            onChange={(event) => setField("zip", event.target.value)}
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
            type="url"
            required
            value={form.googleMapsUrl}
            onChange={(event) => setField("googleMapsUrl", event.target.value)}
            placeholder="https://maps.google.com/…"
          />
        </Field>
        <Field label="Website" htmlFor="website" className="sm:col-span-2">
          <Input
            id="website"
            type="url"
            value={form.website}
            onChange={(event) => setField("website", event.target.value)}
            placeholder="https://yourbusiness.com"
          />
        </Field>
      </Section>

      <Section
        eyebrow="Keywords"
        title="What should you rank for?"
        copy="These are the searches we will run, click, and engage against your listing."
      >
        <div className="sm:col-span-2">
          <Label htmlFor="keywords">
            Target keywords <span className="text-primary">*</span>
          </Label>
          <div className="mt-2">
            <KeywordField value={keywords} onChange={setKeywords} />
          </div>
        </div>
        <Field label="Service area" htmlFor="serviceArea" className="sm:col-span-2">
          <Input
            id="serviceArea"
            value={form.serviceArea}
            onChange={(event) => setField("serviceArea", event.target.value)}
            placeholder="Neighborhoods or cities you serve"
          />
        </Field>
        <Field label="Primary goal" htmlFor="primaryGoal" className="sm:col-span-2">
          <Select
            value={form.primaryGoal}
            onValueChange={(value) =>
              setField("primaryGoal", value ?? PRIMARY_GOALS[0])
            }
          >
            <SelectTrigger id="primaryGoal" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIMARY_GOALS.map((goal) => (
                <SelectItem key={goal} value={goal}>
                  {goal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section
        eyebrow="Comments"
        title="Anything else we should know?"
        copy="Competitors, hours, photos, or ranking problems — the more context, the better the campaign."
      >
        <Field label="Comments" htmlFor="comments" className="sm:col-span-2">
          <Textarea
            id="comments"
            rows={5}
            value={form.comments}
            onChange={(event) => setField("comments", event.target.value)}
            placeholder="Current ranking issues, competitors to beat, hours that matter most…"
          />
        </Field>
        <Field label="How did you hear about us?" htmlFor="referralSource" className="sm:col-span-2">
          <Input
            id="referralSource"
            value={form.referralSource}
            onChange={(event) => setField("referralSource", event.target.value)}
            placeholder="Referral, search, Instagram…"
          />
        </Field>
      </Section>

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
        <Button
          type="submit"
          disabled={pending}
          className="h-11 px-6 font-semibold brand-gradient text-white"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Submit campaign
        </Button>
      </div>
    </form>
  );
}

function Section({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-charcoal">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label}{" "}
        {required ? <span className="text-primary">*</span> : null}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
