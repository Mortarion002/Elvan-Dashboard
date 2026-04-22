# Elvan Signal Bot Dashboard

Welcome to the Elvan Signal Bot Dashboard! This project is a frontend-only Next.js application designed to visualize and manage high-intent leads and social signals captured by the Elvan AI bot. 

The dashboard provides a pixel-faithful UI implementation, translating design concepts into a robust, component-driven React architecture. Currently, the dashboard is powered by hardcoded mock data to demonstrate its functionality without requiring a backend connection.

## 🚀 Features

- **Four Main Dashboard Views:**
  - `/overview`: A high-level summary of your lead generation metrics, recent signals, and overall bot performance.
  - `/hot-leads`: A prioritized list of scored leads that are ripe for immediate engagement, helping you focus on the highest value opportunities.
  - `/signal-feed`: A real-time, chronological feed of detected signals across monitored platforms (e.g., X, Reddit, LinkedIn).
  - `/competitor-intelligence`: Analytical insights and comparisons against key competitors in your market.
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

## 📁 Project Structure

- `src/app`: Contains the Next.js App Router structure, including the layouts and main pages (`/overview`, `/hot-leads`, etc.).
- `src/components`: Reusable UI elements (`ui/`) and larger structural components (`layout/` like Topbar and Sidebar).
- `src/data`: Contains the `mockData.ts` file that powers the dashboard's current state.

## 🎨 Design Philosophy

The application prioritizes a premium, responsive, and dynamic user experience. It utilizes custom CSS modules to implement modern web design practices, ensuring a sleek appearance with subtle micro-animations and robust component isolation.
