# GBP Auto Ranker

Website and operator dashboard for **GBP Auto Ranker** — a Google Business Profile ranking service. The public site collects campaign intake. Admins and SEO agencies sign in to manage clients, keywords, and team seats.

GBP Auto Ranker runs real searches, clicks, and engagement signals against a Google Business Profile so the listing climbs the map pack for the keywords that bring in customers.

## What’s included

- Marketing site with the brand logo and blue/black/white palette
- Campaign intake: name, business details, Google Maps link, keywords, comments
- Email/password login, forgot-password reset, and signup for agencies or business owners
- Public pages point business owners to a GBP Auto Ranker agency partner — no public dollar amount
- Admin and agency users can delete duplicate client listings; admins can delete duplicate agencies (listings stay and become unassigned)
- Session analytics on public website pages only (not the signed-in dashboard)
- Email/password login, forgot-password reset, and signup for agencies or business owners
- Transactional and broadcast email through [Resend](https://resend.com): confirmations, welcome, resets, intake receipts, assignment notices, team invites, staff alerts on new agency/business signups, plus admin marketing/info/update emails
- Admin Emails page to save the Resend API key, from-address, and editable templates, including a sendable “New client for agency” email when a listing is assigned
- Admin dashboard: add agencies, users, and customers; assign listings to agencies or business owners
- Agency dashboard: add their own clients, manage team seats, choose exclusive or shared leads, and run campaigns
- Business-owner dashboard: add and manage multiple locations on one login
- Postgres on Railway for accounts, customers, and the email log, with JSON files as a local fallback

## Accounts

| Role | What they see |
| --- | --- |
| Admin | Every customer. Manually adds agencies, users, and customers, then assigns listings to an agency or a business owner. Can delete duplicate listings or agencies. |
| Agency owner | Agency clients, team roster, exclusive or shared lead preference, ability to add users and new clients, and ability to delete a duplicate client listing. |
| Agency user | The same client book, plus the ability to add clients for that agency and delete a duplicate listing. |
| Business owner | Their locations only. Can add more listings on the same account. |

The live admin account is created for the operator and is not shown on the public login page. Sample clients and the old demo agency are not seeded.

New agency and business-owner signups must confirm an email before they can sign in. Forgot password sends a one-hour reset link. Save a Resend API key on `/dashboard/emails` (or set `RESEND_API_KEY`). Without a key, confirm and reset links are shown on screen and every attempted send is written to the email log.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:4410](http://127.0.0.1:4410).

| Page | Purpose |
| --- | --- |
| `/` | Marketing site |
| `/get-started` | Public campaign intake |
| `/login` | User login |
| `/signup` | Agency or business-owner account (confirmation email) |
| `/dashboard` | Role-aware workspace |
| `/dashboard/clients/new` | Add a customer or location |
| `/dashboard/agencies/new` | Admin creates an agency and owner login |
| `/dashboard/team` | Add users (admins, owners, or agency seats) |
| `/dashboard/emails` | Admin Resend settings, templates, composer, test send, and send log |
| `/dashboard/agency` | Agency lead preference (exclusive or shared) |

Without `DATABASE_URL`, records are written to `data/*.json`. With Postgres, the same tables are used. First boot creates the operator admin only — no sample clients or agencies.

## GitHub + Railway

1. Push this repo to GitHub.
2. In [Railway](https://railway.app), create a new project and deploy from that GitHub repo.
3. Railway will install, build, and start with `npm run start`. It supplies `PORT` automatically.
4. Set these variables on the Railway service:

```
DASHBOARD_SECRET=choose-a-long-random-string
DATABASE_URL=${{Postgres.DATABASE_URL}}
APP_URL=https://your-service.up.railway.app
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM=GBP Auto Ranker <hello@your-verified-domain.com>
```

You can also paste the API key, from name, from email, and reply-to on `/dashboard/emails`. Saved values override these environment variables. `APP_URL` is used in confirmation, reset, and dashboard links. Verify the from-domain in Resend or stay on `beth.t@example.com` (test sends only go to your Resend account email).

5. Add a Railway Postgres plugin to the same project. Point `DATABASE_URL` at `${{Postgres.DATABASE_URL}}` so the app uses the private hostname.

A volume at `/data` is optional once Postgres is connected. The Dockerfile is the production image; `railway.json` points Railway at it.

## Brand

Primary blue `#1769E8`, deep blue `#0642B5`, navy `#082B75`, near-black `#08090B`, white `#FFFFFF`, off-white `#F7F9FC`, border `#E3E8EF`. Buttons and dashboard highlights use the `#0642B5 → #1769E8` gradient.
