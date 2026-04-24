import Link from "next/link";

import styles from "../views.module.css";

import { SignalRecord } from "@/components/ui/SignalRecord";
import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function SignalFeedPage() {
  const data = await loadDashboardData();

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Signal Feed</h1>
          <div className={styles.pageSub}>
            All captured signals across sources.
            <span className={styles.liveDot}>Live {data.statusSummary.lastSignalLabel}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/overview" className={styles.btn}>
            Export CSV
          </Link>
          <Link href="/integrations" className={`${styles.btn} ${styles.primaryBtn}`}>
            New tracker
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.coverage.totalSignals}</div>
          <div className={styles.statLabel}>Unified records</div>
          <div className={styles.statMeta}>
            Final feed count after merging mirrored Neon rows with Notion records.
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.coverage.mirroredSignals}</div>
          <div className={styles.statLabel}>Seen in both</div>
          <div className={styles.statMeta}>Signals present in both Neon and Notion.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.coverage.neonOnlySignals}</div>
          <div className={styles.statLabel}>Neon only</div>
          <div className={styles.statMeta}>Usually X_Post or Reddit monitor records.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.coverage.notionOnlySignals}</div>
          <div className={styles.statLabel}>Notion only</div>
          <div className={styles.statMeta}>Signals not yet mirrored or intentionally retained in Notion.</div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Source</span>
          <span className={`${styles.pill} ${styles.pillActive}`}>All</span>
          {data.sourceSummaries.map((summary) => (
            <span className={styles.pill} key={summary.source}>
              {summary.label}
            </span>
          ))}
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Intent</span>
          <span className={`${styles.pill} ${styles.pillActive}`}>All</span>
          <span className={styles.pill}>Buying</span>
          <span className={styles.pill}>Comparing</span>
          <span className={styles.pill}>Venting</span>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Sort</span>
          <span className={`${styles.pill} ${styles.pillActive}`}>Newest</span>
          <span className={styles.pill}>Score</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Source coverage</h2>
            <div className={styles.cardSub}>
              Per-source volume, hot lead density, and reply coverage.
            </div>
          </div>
        </div>
        <div className={styles.sourceGrid}>
          {data.sourceSummaries.map((summary) => (
            <div className={styles.sourceCard} key={summary.source}>
              <div className={styles.sourceHead}>
                <div className={styles.sourceName}>
                  <span className={styles.sourceDot} style={{ background: summary.color }} />
                  {summary.label}
                </div>
                <strong>{summary.count}</strong>
              </div>
              <div className={styles.sourceMetric}>
                <div>
                  <span className={styles.metricLabel}>Hot leads</span>
                  <span className={styles.metricValue}>{summary.hotLeads}</span>
                </div>
                <div>
                  <span className={styles.metricLabel}>Reply coverage</span>
                  <span className={styles.metricValue}>{summary.replyCoverage}%</span>
                </div>
                <div>
                  <span className={styles.metricLabel}>Alerted</span>
                  <span className={styles.metricValue}>{summary.alerted}</span>
                </div>
                <div>
                  <span className={styles.metricLabel}>Last seen</span>
                  <span className={styles.metricValue}>{summary.lastSeenLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Unified timeline</h2>
            <div className={styles.cardSub}>
              Showing all {data.signals.length} currently deduplicated records in descending freshness order.
            </div>
          </div>
        </div>
        <div className={styles.list}>
          {data.signals.map((signal) => (
            <SignalRecord key={signal.id} signal={signal} highlight={signal.hotLead} />
          ))}
        </div>
      </div>
    </div>
  );
}
