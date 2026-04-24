# Elvan Signal Bot Dashboard

Live: https://elvan-dashboard.vercel.app/

A unified observability and intelligence layer for multiple production AI systems.

---

## Why this exists

At Elvan, we had multiple AI workflows running in parallel:

- X / Reddit research bot
- n8n pipelines scanning Hacker News and Product Hunt
- Notion as the primary signal store
- Neon as an analytics mirror

Each system worked independently.

The problem:
There was no single place to understand what was happening.

No visibility into:

- what signals were being generated
- which workflows were healthy
- where leads were coming from
- whether systems were silently failing

This dashboard solves that.

---

## What it does

This is a read-only aggregation layer that brings all AI workflows into one operator-facing interface.

It provides:

- **Unified signal feed** across X, Reddit, HN, Product Hunt
- **Hot lead detection** with prioritization
- **Workflow observability (partial, via mirrored data)**
- **Alert tracking and state**
- **Competitor and signal intelligence views**

The key idea:

> keep all systems independent, but give humans one place to reason about them

---

## System Architecture

Three independent systems:

### 1. X_Post Bot (Python)

- Scans X and Reddit
- Scores relevance using LLMs
- Sends Telegram digests
- Mirrors results to Neon

### 2. n8n Signal Pipeline

- Scrapes Hacker News + Product Hunt
- Enriches signals with LLMs
- Stores in Notion (source of truth)
- Mirrors to Neon

### 3. Dashboard (this repo)

- Reads from Neon + Notion
- Aggregates data into UI
- Never writes to upstream systems

**Design principle:**

- operational systems stay decoupled
- dashboard is purely observational

---

## Tech Stack

- Next.js (App Router)
- React 19 + TypeScript
- Neon Postgres (analytics layer)
- Notion API (primary workflow datastore)

---

## AI-first development workflow

This project was built using AI agents as the primary development environment:

- Architecture → Gemini
- UI mockups → Google Stitch
- Design iteration → Claude Design
- Implementation → Claude Code + Codex

AI handled:

- scaffolding
- repetitive logic
- UI structure

I handled:

- system design
- correctness
- architecture decisions

---

## Local Development

```bash
npm install
npm run dev
```

Setup `.env.local`:

```env
NEON_DATABASE_URL=
NOTION_API_KEY=
NOTION_DB_ID=
NOTION_WEEKLY_DB_ID=
```

---

## Key Design Decisions

- **Read-only architecture** → no risk to upstream systems
- **Fail-open data model** → workflows don’t depend on dashboard
- **Neon as shared analytics layer** → decouples UI from execution
- **Notion as source of truth** → keeps workflows stable

---

## What I’d improve next

Add a workflow heartbeat system:

- each workflow logs execution status (success/failure/latency)
- dashboard surfaces real-time health
- alerts trigger on missed runs

This would turn the dashboard into a full observability system.

---

## Author

Aman Kumar
https://amankumar002u.tech
