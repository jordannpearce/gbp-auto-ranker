# GBP Auto Ranker

Website and operator dashboard for **GBP Auto Ranker** — a Google Business Profile ranking service. The public site explains the offer, collects campaign intake, and stores every submission so you can manage listings, keywords, and status from one dashboard.

GBP Auto Ranker runs real searches, clicks, and engagement signals against a Google Business Profile so the listing climbs the map pack for the keywords that bring in customers.

## What’s included

- Marketing site with the brand logo and blue/black/white palette
- Campaign intake form: name, business details, Google Maps link, keywords, comments
- Customer dashboard: search, status, keyword lists, Maps link, internal notes
- File-backed storage so you can host on Railway without a separate database

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
| `/get-started` | Campaign intake |
| `/dashboard` | Operator dashboard |

The dashboard password defaults to `gbp-admin`. Change it with `DASHBOARD_PASSWORD`.

Customer records are written to `data/customers.json`. The first run seeds three sample businesses so the dashboard is not empty.

## GitHub + Railway

1. Push this repo to GitHub.
2. In [Railway](https://railway.app), create a new project and deploy from that GitHub repo.
3. Railway will install, build, and start with `npm run start`. It supplies `PORT` automatically.
4. Set these variables on the Railway service:

```
DASHBOARD_PASSWORD=choose-a-strong-password
DASHBOARD_SECRET=choose-a-long-random-string
DATA_DIR=/data
```

5. Add a Railway Volume mounted at `/data` so customer records survive redeploys.

Without a volume, the filesystem is ephemeral and the customer list resets when the service is rebuilt.

Nixpacks is configured in `railway.json`. A `Dockerfile` is also included if you prefer image-based deploys.

## Brand

Primary blue `#1769E8`, deep blue `#0642B5`, navy `#082B75`, near-black `#08090B`, white `#FFFFFF`, off-white `#F7F9FC`, border `#E3E8EF`. Buttons and dashboard highlights use the `#0642B5 → #1769E8` gradient.
