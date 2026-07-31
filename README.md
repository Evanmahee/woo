# Woo

SaaS for planning and sending beautiful date invitations.

**Tagline:** To woo.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres)
- Resend (transactional email)
- Stripe Checkout (Woo Pro subscription)
- Anthropic (Surprise Date, Pro only)

## Setup

1. **Install**

```bash
npm install
cp .env.example .env.local
```

2. **Supabase** — create a project, then run `supabase/migration.sql` in the SQL editor.

3. **Fill `.env.local`** with your keys (see `.env.example`).

4. **Stripe** — create a product “Woo Pro” at $4.99/mo, copy the Price ID to `STRIPE_PRICE_ID_WOO_PRO`. For local webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

5. **Resend** — add `RESEND_API_KEY`. With `onboarding@resend.dev` you can only send to your own verified email until you verify a domain.

6. **Run**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing |
| `/create` | Step 1 — date, time, plan |
| `/create/step-2` | Step 2 — recipient + theme + send |
| `/w/[id]` | Public recipient page |
| `/success` | Confirmation + share link |
| `/pricing` | Free vs Woo Pro |

## Deploy (Vercel)

1. Push the repo and import in Vercel.
2. Add the same env vars.
3. Set `NEXT_PUBLIC_APP_URL` to your production URL.
4. Point Stripe webhook to `https://your-domain/api/webhooks/stripe`.
5. Optional domains: `woo.co`, `getwoo.com`.

## Monetization

- **Free — $0** — 1 Woo / month, 1 theme, "I'll pick" only
- **Woo+ — $2.99/mo** — 5 Woos / month, 3 themes, "Let them pick" (decoy tier)
- **Woo Pro — $4.99/mo** — unlimited, all themes, Surprise Date ✨, read receipts

After schema changes, run `supabase/migration_plans.sql` if you already applied the initial migration.
