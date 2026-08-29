import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Terms for using GBP Auto Ranker campaign intake, agency accounts, and map-pack ranking work.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of use" updated="August 29, 2026">
      <p>
        These terms cover the GBP Auto Ranker website, campaign intake, agency
        accounts, and the ranking work we perform on a Google Business
        Profile. By submitting a campaign or creating an account, you agree
        to them.
      </p>

      <h2>The service</h2>
      <p>
        We run real searches, clicks, and engagement activity against the
        Google Business Profile you identify. The goal is to help that
        listing move up in the map pack for the keywords you give us. We do
        not promise a specific rank, a set number of calls, or a date by
        which a listing will appear in a particular position. Google controls
        search results and can change them at any time.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>
          You must have the right to manage the Google Business Profile you
          submit.
        </li>
        <li>
          The Maps link, address, and keywords must describe that business
          honestly.
        </li>
        <li>
          Agency owners are responsible for the teammates they add and the
          client listings they assign.
        </li>
        <li>
          You will not use the service to impersonate another business, spam
          search, or break the law.
        </li>
      </ul>

      <h2>Accounts</h2>
      <p>
        Agency accounts must confirm a work email before they can sign in.
        You are responsible for keeping the password private. If you forget
        it, use the forgot-password link on the login page. We may suspend an
        account that puts other customers or the service at risk.
      </p>

      <h2>Fees</h2>
      <p>
        A standard campaign is $150. Agency owners who run ten or more
        campaigns can request volume pricing. The discounted rate is set when
        you book that volume — it is not listed as a public schedule. Unpaid
        campaigns may be paused.
      </p>

      <h2>Content you send us</h2>
      <p>
        You keep ownership of your business name, listing, and keywords. You
        give us permission to use those details to run and manage the
        campaign, including showing them to the agency team you work with.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep the website and dashboard available, but maintenance,
        outages, or changes at Google can interrupt work. We are not liable
        for lost leads, lost rank, or business interruption beyond the fees
        you paid for the affected campaign period, except where the law does
        not allow that limit.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the product changes. The date at the top
        of this page is the current version. Continued use after an update
        means you accept the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a className="font-medium text-primary hover:underline" href="mailto:hello@info.gbpranker.com">
          hello@info.gbpranker.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
