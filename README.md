# Elvan Signal Bot Dashboard

Welcome to the Elvan Signal Bot Dashboard! This project is a Next.js application designed to visualize and manage high-intent leads and social signals captured by the Elvan AI systems.

The dashboard now supports live server-side aggregation:

- Neon for X/Post findings mirrored by the Python bot
- Neon for HN / Product Hunt signals dual-written by the n8n collector workflow
- Notion for the existing n8n workflow datastore

Mock data still remains as a fallback so the UI can render even when live credentials are not configured.

## 🚀 Features

- **Four Main Dashboard Views:**
  - `/overview`: A high-level summary of live cross-channel metrics, recent signals, and overall bot performance.
  - `/hot-leads`: A prioritized list of scored leads that are ripe for immediate engagement.
  - `/signal-feed`: A chronological feed of detected signals across X, Reddit, Hacker News, and Product Hunt.
  - `/competitor-intelligence`: Aggregated competitor mentions and cross-source signal overlap.
- **Reusable UI Components:**
  - `SourcePill`: Clear visual indicators for the origin platform of a lead or signal.
  - `ScoreBadge`: Color-coded representations of AI-generated lead scores.
  - `UrgencyChip`: Highlights the time-sensitivity of specific signals.
  - `IntentTag`: Categorizes the underlying user intent based on the bot's analysis.
- **Modern Tech Stack:** Built with Next.js (App Router), React 19, TypeScript, and CSS Modules for scoped, maintainable styling.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** CSS Modules (Vanilla CSS for maximum flexibility and control)

## 📦 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start navigating through the dashboard using the sidebar links to explore the different views.

For live data, create `.env.local` with:

```env
NEON_DATABASE_URL=your_neon_postgres_connection_string
NOTION_API_KEY=your_notion_integration_token
NOTION_DB_ID=your_primary_signals_database_id
NOTION_WEEKLY_DB_ID=your_weekly_reports_database_id
```

`NEON_DATABASE_URL` powers the shared parallel channel.
`NOTION_*` powers the existing n8n / Notion channel.
The dashboard deduplicates overlapping Neon and Notion records so n8n signals do not double-count while both channels stay active.

## 📁 Project Structure

- `src/app`: Contains the Next.js App Router structure, including the layouts and main pages (`/overview`, `/hot-leads`, etc.).
- `src/components`: Reusable UI elements (`ui/`) and larger structural components (`layout/` like Topbar and Sidebar).
- `src/data`: Contains the `mockData.ts` fallback dataset.
- `src/lib/dashboardData.ts`: Loads live data from Neon and Notion, with mock fallback.

## 🎨 Design Philosophy

The application prioritizes a premium, responsive, and dynamic user experience. It utilizes custom CSS modules to implement modern web design practices, ensuring a sleek appearance with subtle micro-animations and robust component isolation.
