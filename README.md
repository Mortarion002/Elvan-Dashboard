# Elvan Signal Bot Dashboard

Live: [elvan-dashboard.vercel.app](https://elvan-dashboard.vercel.app/)

A unified observability layer for multiple production AI signal systems.

---

## Why this exists

At Elvan, multiple AI workflows run in parallel:

- Reddit and X research bots scoring buying signals
- n8n pipelines scanning Hacker News and Product Hunt
- Neon as the primary shared signal store
- Notion as an optional weekly report archive

Each system worked independently with no single place to understand what was happening — no visibility into what signals were being generated, where leads came from, or whether systems were silently failing.

This dashboard solves that.

---

## What it does

A read-only aggregation layer that brings all AI workflows into one operator-facing interface.

**Four source inboxes:**

- Reddit
- Product Hunt
- Hacker News
- X

Each inbox shows the signals captured from that source with per-signal detail: post content, Elvan angle, and reply draft.

**Dashboard features:**

- Per-source signal counts with live mode indicator
- Source inbox views with full signal records
- Hot lead detection and prioritization
- Competitor intelligence views
- 15-second data cache for near-real-time refresh

---

## System Architecture

Three independent systems feed into the dashboard:

### 1. X / Reddit Bot (Python)

- Scans X and Reddit for buying signals
- Scores relevance using LLMs
- Sends Telegram digests
- Mirrors results to Neon

### 2. n8n Signal Pipeline

- Scrapes Hacker News and Product Hunt
- Enriches signals with LLMs
- Stores scored signals in Neon

### 3. Dashboard (this repo)

- Reads from Neon (primary) and optional Notion weekly reports
- Aggregates all sources into one UI
- Never writes to upstream systems

**Design principle:** operational systems stay fully decoupled — the dashboard is purely observational.

---

## Tech Stack

- Next.js (App Router)
- React 19 + TypeScript
- Neon Postgres (primary signal store via `@neondatabase/serverless`)
- Neon Auth (company-only dashboard access)
- Notion API (optional weekly reports and legacy signal archive)

---

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEON_DATABASE_URL=
NOTION_API_KEY=
NOTION_DB_ID=
NOTION_WEEKLY_DB_ID=
ENABLE_LEGACY_NOTION_SIGNALS=false
NEON_AUTH_BASE_URL=https://ep-autumn-shape-aodsxmjn.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=
NEXT_PUBLIC_APP_URL=https://elvan-dashboard.vercel.app
AUTH_ALLOWED_DOMAINS=getelvan.com,elvan.com
```

`ENABLE_LEGACY_NOTION_SIGNALS` controls whether old Notion-sourced signals are included alongside Neon data. Set to `false` unless you need the archive.

`NEON_AUTH_COOKIE_SECRET` must be a random 32+ character secret. Generate one with:

```bash
openssl rand -base64 32
```

Only accounts with emails on `getelvan.com` or `elvan.com` are allowed through by default.

---

## Key Design Decisions

- **Read-only architecture** — no risk to upstream systems
- **Fail-open data model** — workflows don't depend on the dashboard being up
- **Neon as shared operational layer** — decouples UI from execution environment
- **Notion as optional archive layer** — preserves weekly summaries without driving alerts
- **15s cache** — balances freshness with Neon connection overhead

---

## Author

Aman Kumar
[amankumar002u.tech](https://amankumar002u.tech)
