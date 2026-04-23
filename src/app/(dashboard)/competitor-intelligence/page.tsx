import Link from "next/link";

import styles from "../views.module.css";

import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function CompetitorIntelligencePage() {
  const data = await loadDashboardData();
  const multiSourceMentions = data.crossSignals.filter((entry) => entry.sources.length > 1).length;

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Competitor Intelligence</h1>
          <div className={styles.pageSub}>
            Tool mentions aggregated across X/Post, Reddit, Hacker News, and Product Hunt so you can
            spot overlap, pressure points, and where Elvan has the clearest wedge.
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/signal-feed" className={styles.btn}>
            Signal feed
          </Link>
          <Link href="/overview" className={`${styles.btn} ${styles.primaryBtn}`}>
            Overview
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.competitors.length}</div>
          <div className={styles.statLabel}>Tracked tools</div>
          <div className={styles.statMeta}>Top tools extracted from the current unified dataset.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{multiSourceMentions}</div>
          <div className={styles.statLabel}>Cross-source overlap</div>
          <div className={styles.statMeta}>Competitors appearing in at least two distinct sources.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {data.competitors.reduce((sum, competitor) => sum + competitor.mentions, 0)}
          </div>
          <div className={styles.statLabel}>Total mentions</div>
          <div className={styles.statMeta}>Combined mention count across the ranked competitor set.</div>
        </div>
      </div>

      <div className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Mention volume</h2>
              <div className={styles.cardSub}>
                Ranked by current 7-day mention count inside the dashboard feed.
              </div>
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Competitor</th>
                <th>Mentions</th>
                <th>Share</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {data.competitors.map((competitor) => (
                <tr key={competitor.name}>
                  <td>{competitor.name}</td>
                  <td className={styles.mono}>{competitor.mentions}</td>
                  <td className={styles.mono}>{competitor.pct}%</td>
                  <td className={styles.mono}>{competitor.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Cross-source signals</h2>
              <div className={styles.cardSub}>
                Tools showing up across multiple pipelines with their most recent signal titles.
              </div>
            </div>
          </div>
          <div className={styles.list}>
            {data.crossSignals.length ? (
              data.crossSignals.map((entry) => (
                <div className={styles.reportItem} key={entry.tool}>
                  <div className={styles.reportTitle}>{entry.tool}</div>
                  <div className={styles.reportMeta}>
                    Sources: {entry.sources.join(", ")} · Aggregate score {entry.score}
                  </div>
                  <div className={styles.reportCopy}>{entry.titles.join(" | ")}</div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                No cross-source competitor overlaps are available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
