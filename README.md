# Elvan Signal Bot Dashboard

Next.js dashboard for viewing Elvan signal data across X_Post, Reddit, Hacker News, Product Hunt, Neon, and Notion.

The dashboard is a read-only aggregation layer. It does not replace or modify the operational stores used by `X_Post` or the n8n workflows.

## What It Reads

- Neon for mirrored X_Post findings
- Neon for mirrored HN and Product Hunt signals from n8n
- Notion for the existing n8n primary signals database
- Notion weekly reports when configured

If live credentials are missing, the UI falls back to mock data so the app still renders.

## Stack

- Next.js App Router
- React 19
- TypeScript
- CSS Modules
- `@neondatabase/serverless` for Neon access

## Local Development

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in:

```env
NEON_DATABASE_URL=your_neon_postgres_connection_string
NOTION_API_KEY=your_notion_integration_token
NOTION_DB_ID=your_primary_signals_database_id
NOTION_WEEKLY_DB_ID=your_weekly_reports_database_id
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Vercel Deployment

This app is ready to run on Vercel as a server-rendered dashboard.

Required Vercel environment variables:

```env
NEON_DATABASE_URL=your_neon_postgres_connection_string
NOTION_API_KEY=your_notion_integration_token
NOTION_DB_ID=your_primary_signals_database_id
NOTION_WEEKLY_DB_ID=your_weekly_reports_database_id
```

Recommended deployment flow:

1. Import the GitHub repo in Vercel or run `vercel link` from this folder.
2. Add the four environment variables in Vercel for `Production`, `Preview`, and `Development`.
3. Run `vercel --prod` for the first live deployment.

Deployment notes:

- The dashboard stays read-only against Neon and Notion.
- The dashboard layout is pinned to the Node.js runtime for server-side data access.
- Notion weekly reports are optional. If that database is empty or missing records, the rest of the dashboard still works.

## Main Areas

- `/overview` for top-level metrics and workflow health
- `/hot-leads` for high-priority signals
- `/signal-feed` for the full unified timeline
- `/competitor-intelligence` for tool and competitor mentions
- `/alerts` for alert review state
- `/integrations` for channel and workflow health

## Project Structure

- `src/app` contains App Router pages and layouts
- `src/components` contains layout and UI components
- `src/data` contains mock fallback data
- `src/lib/dashboardData.ts` contains live Neon and Notion aggregation logic
