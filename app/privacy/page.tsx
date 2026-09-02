import type { Metadata } from "next";
import { ContactEmail } from "@/components/contact-email";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How GBP Auto Ranker collects, uses, and shares information from campaign intake and account holders.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      updated="September 2, 2026"
    >
      <p>
        GBP Auto Ranker (“we”, “us”) runs map-pack campaigns for Google
        Business Profiles. This policy explains what we collect when you use
        the website, submit a campaign, or create an account.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          Campaign details you submit: name, email, phone, business name,
          address, website, Google Maps link, keywords, service area, and
          comments.
        </li>
        <li>
          Account details for admins and agency teams: name, work email,
          password (stored as a hash), agency name, and role.
        </li>
        <li>
          Operational records we create while running a campaign, such as
          status, notes, and which agency or teammate manages a listing.
        </li>
        <li>
          Basic technical data from your browser, such as pages visited and
          whether a form submitted successfully.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>We use this information to:</p>
      <ul>
        <li>Set up and run the ranking campaign you asked for.</li>
        <li>Let the assigned agency team see the listings they manage.</li>
        <li>
          Send account email (confirmation, password reset, team invites) and
          campaign notices (intake received, assignment updates).
        </li>
        <li>
          Send occasional product or campaign updates if you have an account
          or an active campaign. You can reply and ask to stop those.
        </li>
        <li>
          Understand how people use the public website (pages such as the
          homepage, intake form, and these legal pages). We do not load that
          measurement on the signed-in dashboard.
        </li>
        <li>Keep the service secure and fix problems.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share campaign details with the agency or teammate assigned to that
        listing. We use outside companies only to host the product, send
        email, keep the service online, and measure visits to the public
        website. Those companies may process your information solely to
        provide that work for us. We do not sell your contact list or
        campaign keywords.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep campaign and account records while the account or campaign is
        active and for a reasonable period after, so we can reopen work,
        handle billing questions, or meet legal duties. You can ask us to
        delete a campaign or close an account.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Request a copy of the campaign or account data we hold.</li>
        <li>Correct a name, email, Maps link, or keyword list.</li>
        <li>Ask us to delete a listing or close an agency seat.</li>
        <li>Stop marketing or update emails by replying to that message.</li>
      </ul>

      <h2>Children</h2>
      <p>
        The service is for businesses and agencies. We do not knowingly collect
        information from children.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions:{" "}
        <ContactEmail className="font-medium text-primary hover:underline" />
        .
      </p>
    </LegalPage>
  );
}
