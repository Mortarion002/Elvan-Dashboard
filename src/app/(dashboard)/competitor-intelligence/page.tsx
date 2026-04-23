import styles from "../views.module.css";

import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function CompetitorIntelligencePage() {
  const data = await loadDashboardData();

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Competitor Intelligence</h1>
          <div className={styles.pageSub}>
            Competitor mentions aggregated across X/Post, Reddit, Hacker News, and Product Hunt.
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Mention Volume</h2>
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
          <h2 className={styles.cardTitle}>Cross-Source Signals</h2>
          <div className={styles.list}>
            {data.crossSignals.map((entry) => (
              <div className={styles.item} key={entry.tool}>
                <div className={styles.topRow}>
                  <div>
                    <div className={styles.title}>{entry.tool}</div>
                    <div className={styles.sub}>
                      Sources: {entry.sources.join(", ")} · Aggregate score {entry.score}
                    </div>
                  </div>
                </div>
                <div>
                  <div className={styles.label}>Recent titles</div>
                  <div className={styles.copy}>{entry.titles.join(" | ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
