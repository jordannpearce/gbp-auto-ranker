# GBP Auto Ranker

Website and operator dashboard for **GBP Auto Ranker** — a Google Business Profile ranking service. The public site collects campaign intake. Admins and SEO agencies sign in to manage clients, keywords, and team seats.

GBP Auto Ranker runs real searches, clicks, and engagement signals against a Google Business Profile so the listing climbs the map pack for the keywords that bring in customers.

## What’s included

- Marketing site with the brand logo and blue/black/white palette
- Campaign intake: name, business details, Google Maps link, keywords, comments
- Email/password login, forgot-password reset, and agency signup with email confirmation
- Transactional and broadcast email through [Resend](https://resend.com): confirmations, welcome, resets, intake receipts, assignment notices, team invites, plus admin marketing/info/update emails
- Admin dashboard: all customers, assign listings to agency users, compose emails
- Agency dashboard: clients the agency manages, plus extra team users
- Postgres on Railway for accounts, customers, and the email log, with JSON files as a local fallback

## Accounts

| Role | What they see |
| --- | --- |
| Admin | Every customer. Assigns businesses to an SEO agency and to a specific agency user. |
| Agency owner | Agency clients, team roster, ability to add users and new clients. |
| Agency user | The same client book for that agency. |

Demo logins (seeded on first run):

- Admin: `admin@gbpautoranker.com` / `Admin1234!`
- Agency owner: `maya@northstarlocal.com` / `Agency1234!`
- Agency user: `leo@northstarlocal.com` / `Agency1234!`

Change those passwords after you go live. Demo accounts are already confirmed.

New agency signups must confirm a work email before they can sign in. Forgot password sends a one-hour reset link through Resend. If `RESEND_API_KEY` is missing, the confirm and reset links are shown on screen and every attempted send is written to the email log.

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
| `/signup` | Agency account creation (confirmation email) |
| `/dashboard` | Role-aware workspace |
| `/dashboard/emails` | Admin email composer and send log |

Without `DATABASE_URL`, records are written to `data/*.json`. With Postgres, the same seed runs into the database on first boot: three sample businesses (two assigned to North Star Local) and the demo accounts.

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

`APP_URL` is used in confirmation, reset, and dashboard links. Verify the from-domain in Resend or stay on `beth.t@example.com` (test sends only go to your Resend account email).

5. Add a Railway Postgres plugin to the same project. Point `DATABASE_URL` at `${{Postgres.DATABASE_URL}}` so the app uses the private hostname.

A volume at `/data` is optional once Postgres is connected. The Dockerfile is the production image; `railway.json` points Railway at it.

## Brand

Primary blue `#1769E8`, deep blue `#0642B5`, navy `#082B75`, near-black `#08090B`, white `#FFFFFF`, off-white `#F7F9FC`, border `#E3E8EF`. Buttons and dashboard highlights use the `#0642B5 → #1769E8` gradient.
