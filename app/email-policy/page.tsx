import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Email policy",
  description:
    "The kinds of email GBP Auto Ranker sends and how to stop messages you do not want.",
};

export default function EmailPolicyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Email policy" updated="September 1, 2026">
      <p>
        We send email so you can confirm an account, recover a password, and
        stay current on a campaign. This page lists what we send and how to
        opt out of anything that is not required to run the service.
      </p>

      <h2>Account email</h2>
      <p>
        When you create an agency account we send a confirmation link. Until
        you open that link, you cannot sign in. If you use forgot password,
        we send a one-hour reset link. When a teammate is added, we notify
        that address so they can sign in. These messages are part of
        operating the account. You cannot turn them off while the account is
        open.
      </p>

      <h2>Campaign email</h2>
      <p>
        After you submit a listing we send a receipt to the contact email on
        the form. If that campaign or business is assigned to an agency, we
        email the business contact and the agency team so they can follow up
        on the lead. These messages are about a campaign you asked us to run.
      </p>

      <h2>Updates and marketing</h2>
      <p>
        From time to time we may send information about the product, campaign
        tips, or changes to the service. Those messages go to people who have an
        account or an active campaign. They are not sold to other companies.
        Reply to the message and ask to be removed if you do not want them.
        We will stop the optional mail and keep sending only the account or
        campaign notices that are required.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not buy or rent unrelated mailing lists to promote the service.</li>
        <li>We do not share your inbox with other businesses for their own marketing.</li>
        <li>
          We do not hide the sender. Messages come from GBP Auto Ranker and
          use the address we publish for the product.
        </li>
      </ul>

      <h2>Accuracy</h2>
      <p>
        Use a work email you check. If a confirmation or reset email does not
        arrive, look in spam and use the link on the login or confirmation
        page to send it again.
      </p>

      <h2>Contact</h2>
      <p>
        Email questions:{" "}
        <a className="font-medium text-primary hover:underline" href="mailto:hello@info.gbpranker.com">
          hello@info.gbpranker.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
