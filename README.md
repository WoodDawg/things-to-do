# Things To Do

Personal place tracker. Single user, private, mobile-first. Next.js (App Router) +
Drizzle + Neon Postgres, deployed on Vercel. Design rationale lives in [DESIGN.md](DESIGN.md).

## Setup

### 1. Neon

1. Create a project at [neon.tech](https://neon.tech) (free plan).
2. Copy the **pooled** connection string (the one with `-pooler` in the host) into
   `DATABASE_URL` in `.env.local`.

### 2. Environment variables

```sh
cp .env.example .env.local
```

| Var | How to fill it |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | `openssl rand -base64 48` |
| `APP_PASSWORD_HASH` | `npm run hash-password -- 'your-password'` (quote it) |
| `HOME_LAT` / `HOME_LNG` | Your home coordinates, decimal degrees |
| `HOME_STATE` | Two-letter state the add form defaults to (e.g. `MD`) |
| `GEOCODER_USER_AGENT` | e.g. `things-to-do-app/1.0 (contact: you@example.com)` |

Never commit `.env.local`.

### 3. Migrations

```sh
npm run db:generate   # regenerate SQL after schema changes (already checked in)
npm run db:migrate    # apply migrations to DATABASE_URL
```

### 4. Run

```sh
npm run dev
```

### 5. Deploy to Vercel

1. Push to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo, framework auto-detects Next.js.
3. Add every variable from `.env.example` in Project → Settings → Environment Variables.
4. Deploy. Run `npm run db:migrate` locally (it targets whatever `DATABASE_URL` is in
   `.env.local`) — the production database is the same Neon project.

## Dev fixture data (Phase 2)

`scripts/seed-dev.ts` / `scripts/reset-dev.ts` — invented `[DEV]`-prefixed places for testing
filters and distance sorting. Run with `npx tsx`. Coming in Phase 2; no imports, no
batch geocoding, ever.

## Parked for later (deliberately not in v1)

- **Shortlists** — a many-to-many `lists` table for grouping places ("next weekend", a trip).
- **Photos** — needs blob storage.

## Attribution

Geocoding © OpenStreetMap contributors, licensed under ODbL.
