# Elvan Signal Bot Dashboard

**Live:** [elvan-dashboard.vercel.app](https://elvan-dashboard.vercel.app/)

A unified observability and sales tooling layer for Elvan's production AI signal systems. Brings Reddit, X, Hacker News, and Product Hunt buying signals into one operator-facing interface — alongside a full campaign click analytics tool and a permanent hot prospect database.

---

## Table of Contents

- [Why this exists](#why-this-exists)
- [Features](#features)
  - [Source Inboxes](#source-inboxes)
  - [Campaign Clicks](#campaign-clicks)
  - [Hot Prospects](#hot-prospects)
  - [System Health](#system-health)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Key Design Decisions](#key-design-decisions)
- [Author](#author)

---

## Why this exists

At Elvan, multiple AI workflows run in parallel:

- **Reddit and X bots** — score and categorise buying signals from social platforms
- **n8n pipelines** — scrape and enrich Hacker News and Product Hunt posts
- **Smartlead campaigns** — outbound email sequences targeting prospects
- **Neon** — shared operational store for all signal data
- **Notion** — optional weekly report archive

Each system worked in isolation. There was no single place to understand what was being generated, which leads were engaging, or whether systems were silently failing. Separately, sales had no way to pull engagement data across multiple Smartlead campaigns at once.

This dashboard solves both.

---

## Features

### Source Inboxes

Four signal source inboxes — Reddit, X (Twitter), Product Hunt, and Hacker News — each showing a feed of AI-scored buying signals captured from that platform.

**Per-signal details:**
- Post title, body excerpt, and source URL
- Author and platform-specific engagement stats (upvotes, comments, likes, reposts)
- AI-detected pain point and Elvan product angle
- Suggested reply draft, ready to copy
- Urgency rating and relevance score (0–10)
- Hot lead flag for high-priority signals

**Filtering and sorting:** sort by recency, urgency, or score. Search across all signal text.

**Delete (X only):** X signals can be permanently removed from the database directly from the inbox.

**Live/partial/fallback modes:** if Neon is unreachable the dashboard automatically falls back to mock data and shows a degraded mode indicator in the sidebar. Upstream workflows are never affected.

---

### Campaign Clicks

A standalone CSV analysis tool for sales. Upload one or more Smartlead campaign exports and the tool automatically:

1. **Detects click columns** — scans all CSV headers and data for click signals: `click_count`, `clicked_at`, `clicked URL`, `clicked` activity status, and more. Works across different Smartlead export formats.

2. **Aggregates across campaigns** — deduplicates leads by email across all uploaded files. A lead who appears in three campaigns with 2 clicks each shows a single row with 6 total clicks.

3. **Shows a clicked leads table** — searchable and sortable by most clicks, most campaigns, or name. Each row shows lead name, email, company, click count, campaign breakdown, current sequence step, and links.

4. **Downloads a CSV** — exports clicked leads with name, email, company, and campaign names. Ready to import into a follow-up sequence.

**Supported click column formats:**
| Pattern | Example |
|---|---|
| Explicit count | `click_count`, `clicks`, `link clicks` |
| Timestamp | `clicked_at`, `clicked_time`, `clicked on` |
| Boolean | `clicked: true`, `clicked: yes` |
| Activity status | `status: clicked`, `latest activity: link clicked` |

**What counts as a click:** any row with a positive `click_count`, a non-empty click timestamp, a truthy click boolean, or an activity field whose value matches `clicked`. Rows with `0`, `false`, `no`, `not clicked`, or blank click fields are excluded.

---

### Hot Prospects

A permanent database of all leads who have shown click engagement across campaigns. Built on top of Campaign Clicks.

**Workflow:**
1. Upload campaign CSVs in Campaign Clicks
2. Review the clicked leads list
3. Click **Save to Hot Prospects** — saves all detected clicked leads to the `clicked_leads` Neon table
4. Duplicate emails are silently skipped (never overwritten)
5. A banner confirms how many were saved and how many were skipped

**Hot Prospects page** (`/hot-prospects`):
- Full searchable, sortable table of every saved prospect
- Columns: Name/Email, Company, Phone, Clicks, Campaigns, Sequence, Website, LinkedIn, Saved date
- Per-row delete to remove a prospect permanently
- **Download CSV** — exports all stored prospects with all fields (name, email, company, phone, website, LinkedIn, location, status, sequence, total clicks, campaigns, saved date)
- Sidebar badge shows the live count of stored prospects

---

### System Health

The sidebar shows a live system status indicator:

| Mode | Meaning |
|---|---|
| **Live** (green) | All signals from Neon, all systems healthy |
| **Partial** (yellow) | Some data missing or stale |
| **Fallback** (red) | Neon unavailable, showing mock data |

The dashboard queries workflow run history to report on the health of each upstream system: X/Reddit bot, n8n HN/PH collector, and the X_Post bot. Stale runs and errors surface as warnings.

---

## Architecture

```
Upstream Systems
├── X / Reddit Bot (Python)
│   ├── Scans X and Reddit for buying signals
│   ├── Scores with LLMs, sends Telegram digest
│   └── Writes to Neon → signal_events
│
├── n8n Pipeline
│   ├── Scrapes Hacker News & Product Hunt
│   ├── Enriches with LLMs
│   └── Writes to Neon → signal_events
│
└── Smartlead
    └── Campaign exports (CSV) ─── uploaded manually into this dashboard
                                            │
                           ┌────────────────▼─────────────────┐
                           │         Neon PostgreSQL           │
                           │  signal_events  workflow_runs     │
                           │  clicked_leads                    │
                           └────────────────┬─────────────────┘
                                            │
                           ┌────────────────▼─────────────────┐
                           │      Elvan Dashboard (this)       │
                           │                                   │
                           │  ┌─ Source Inboxes (read-only)   │
                           │  ├─ Campaign Clicks (CSV, client) │
                           │  └─ Hot Prospects (read + write)  │
                           └───────────────────────────────────┘
```

**Design principle:** the dashboard is purely observational for signal data — it never writes to `signal_events` or triggers upstream workflows. The only writes it performs are to the `clicked_leads` table it owns.

### Data flow

- **Signal inboxes** — async server components query `signal_events` (up to 2000 rows) on each page load with a 15-second in-memory cache. Deduplication is applied by URL (with tracking params stripped) or by title + date.
- **Campaign Clicks** — fully client-side. CSV parsing (PapaParse), column detection, and lead aggregation happen in the browser. No server round-trip until Save is clicked.
- **Hot Prospects save** — Next.js server action validates the session, inserts all leads via a single Neon transaction with `ON CONFLICT (email) DO NOTHING`, and revalidates the `/hot-prospects` path.
- **Hot Prospects page** — server component fetches all rows from `clicked_leads` ordered by `saved_at DESC`, passes to a client component for search and sort.
- **Sidebar count** — fetched in parallel with `loadDashboardData()` in the dashboard layout, adding no net latency.

---

## Database Schema

### `signal_events` (managed by upstream bots)

| Column | Type | Description |
|---|---|---|
| `dedupe_key` | TEXT PK | Deduplication key |
| `source` | TEXT | `x`, `reddit`, `hn`, `ph` |
| `source_system` | TEXT | `x_post`, `reddit_monitor`, `n8n` |
| `title`, `body` | TEXT | Signal content |
| `url`, `author` | TEXT | Source metadata |
| `intent`, `urgency`, `priority` | TEXT | AI classifications |
| `draft_reply` | TEXT | Suggested reply |
| `score`, `boosted_score` | NUMERIC | Relevance 0–10 |
| `tool_mentioned`, `pain_point`, `elvan_angle` | TEXT | AI enrichment |
| `occurred_at` | TIMESTAMPTZ | When the signal happened |
| `alerted`, `hot_lead` | BOOLEAN | Flags |
| `metadata` | JSONB | Flexible extra data |

### `workflow_runs` (managed by upstream bots)

| Column | Type | Description |
|---|---|---|
| `id` | INT PK | Run ID |
| `source_system`, `workflow` | TEXT | Which bot ran |
| `started_at`, `finished_at` | TIMESTAMPTZ | Run window |
| `status` | TEXT | `success`, `failed`, etc. |
| `posts_discovered`, `drafts_generated` | INT | Run metrics |
| `stop_reason`, `errors` | TEXT | Failure context |

### `clicked_leads` (managed by this dashboard)

Auto-provisioned on first use via `CREATE TABLE IF NOT EXISTS`. No manual migration needed.

| Column | Type | Description |
|---|---|---|
| `email` | TEXT PK | Lead email (normalised, lowercase) |
| `full_name` | TEXT | Full name (from name or first + last) |
| `company` | TEXT | Company name |
| `phone` | TEXT | Phone number |
| `website` | TEXT | Company website |
| `linkedin` | TEXT | LinkedIn profile URL |
| `location` | TEXT | City / country |
| `status` | TEXT | Lead status from CSV |
| `sequence` | TEXT | Current email sequence step |
| `total_clicks` | INTEGER | Sum of clicks across all campaigns |
| `campaign_count` | INTEGER | Number of campaigns this lead appeared in |
| `campaign_names_json` | TEXT | JSON array of campaign names |
| `source_files_json` | TEXT | JSON array of uploaded CSV filenames |
| `raw_details_json` | TEXT | JSON object — full original CSV row data |
| `saved_at` | TIMESTAMPTZ | When first saved to Hot Prospects |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Module CSS |
| Icons | Lucide React |
| Database | Neon Postgres via `@neondatabase/serverless` |
| Auth | Neon Auth (`@neondatabase/auth`) |
| CSV parsing | PapaParse |
| Deployment | Vercel |
| Caching | React Server Component cache + 15s in-memory |

---

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`:

```env
NEON_DATABASE_URL=your_neon_postgres_connection_string
NOTION_API_KEY=your_notion_integration_token
NOTION_DB_ID=your_legacy_signal_database_id
NOTION_WEEKLY_DB_ID=your_weekly_reports_database_id
ENABLE_LEGACY_NOTION_SIGNALS=false
NEON_AUTH_BASE_URL=https://ep-autumn-shape-aodsxmjn.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=your_32_char_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_ALLOWED_DOMAINS=getelvan.com,elvan.com
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEON_DATABASE_URL` | Yes | Neon Postgres connection string. Used for signal reads, workflow run history, and the `clicked_leads` table. |
| `NEON_AUTH_BASE_URL` | Yes | Neon Auth endpoint for session management. |
| `NEON_AUTH_COOKIE_SECRET` | Yes | 32+ character secret for signing session cookies. Generate with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_APP_URL` | Yes | Absolute URL of the deployment (used for OAuth callbacks). |
| `AUTH_ALLOWED_DOMAINS` | Yes | Comma-separated list of email domains allowed to sign in. Defaults to `getelvan.com,elvan.com`. |
| `NOTION_API_KEY` | No | Notion integration token. Only needed if `ENABLE_LEGACY_NOTION_SIGNALS=true`. |
| `NOTION_DB_ID` | No | Notion database ID for legacy signal archive. |
| `NOTION_WEEKLY_DB_ID` | No | Notion database ID for weekly reports. |
| `ENABLE_LEGACY_NOTION_SIGNALS` | No | Set to `true` to include Notion-sourced signals alongside Neon data. Default: `false`. |

---

## Key Design Decisions

**Read-only signal layer** — the dashboard never writes to `signal_events` or calls upstream APIs. Upstream bots are fully decoupled and continue running whether the dashboard is up or down.

**Fail-open** — if Neon is unavailable the UI degrades to mock data rather than showing an error page. The live/partial/fallback mode indicator tells operators what they're looking at.

**Client-side CSV processing** — Campaign Clicks does all CSV parsing, column detection, and lead aggregation in the browser using PapaParse. No data is sent to the server until the user explicitly saves to Hot Prospects.

**Skip-on-conflict saves** — `clicked_leads` uses email as the primary key. Re-uploading the same lead from a new campaign will be skipped silently. This prevents accidental data loss and makes repeated saves safe.

**Auto-provisioned table** — `clicked_leads` is created with `CREATE TABLE IF NOT EXISTS` before every read or write. No migration step is needed — the table appears on first use.

**Transaction-based bulk insert** — saving a large list of clicked leads uses a single `neon.transaction()` call with one `INSERT ... ON CONFLICT DO NOTHING RETURNING email` per lead. The count of returned rows vs. total leads gives the saved/skipped split shown in the UI.

**Parallel layout queries** — the sidebar prospect count and dashboard signal data are fetched with `Promise.all` in the layout so neither blocks the other.

**15-second signal cache** — `loadDashboardData` is wrapped in a React `cache()` with a 15-second TTL. Near-real-time refresh without hammering Neon on every page navigation.

---

## Author

Aman Kumar  
[amankumar002u.tech](https://amankumar002u.tech)
