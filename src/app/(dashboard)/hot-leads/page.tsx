import Link from "next/link";

import styles from "../views.module.css";

import { SignalRecord } from "@/components/ui/SignalRecord";
import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function HotLeadsPage() {
  const data = await loadDashboardData();
  const alertedHotLeads = data.hotLeadSignals.filter((signal) => signal.alerted);
  const avgScore =
    data.hotLeadSignals.length > 0
      ? (
          data.hotLeadSignals.reduce((total, signal) => total + signal.score, 0) /
          data.hotLeadSignals.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Hot Leads</h1>
          <div className={styles.pageSub}>
            Signals with boosted score 8+ requiring immediate attention.
            <span className={styles.alertDot}>{data.pendingAlertSignals.length} unreviewed</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/alerts" className={styles.btn}>
            Export
          </Link>
          <Link href="/signal-feed" className={`${styles.btn} ${styles.primaryBtn}`}>
            Mark all reviewed
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.hotLeadSignals.length}</div>
          <div className={styles.statLabel}>Total hot leads</div>
          <div className={styles.statMeta}>Signals marked hot, urgent, or scoring 8+.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.pendingAlertSignals.length}</div>
          <div className={styles.statLabel}>Unreviewed</div>
          <div className={styles.statMeta}>High-priority items still waiting for operator action.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{alertedHotLeads.length}</div>
          <div className={styles.statLabel}>Reviewed</div>
          <div className={styles.statMeta}>
            Hot leads already pushed through an alerting step in the source pipeline.
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{avgScore}</div>
          <div className={styles.statLabel}>Avg score</div>
          <div className={styles.statMeta}>
            Mean boosted score across the current hot lead queue.
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Review state</span>
          <span className={`${styles.pill} ${styles.pillActive}`}>Needs action</span>
          <span className={styles.pill}>Already alerted</span>
          <span className={styles.pill}>Missing drafts</span>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Minimum score</span>
          <span className={`${styles.pill} ${styles.pillActive}`}>8+</span>
          <span className={styles.pill}>9+</span>
        </div>
      </div>

      <div className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Needs action now</h2>
              <div className={styles.cardSub}>
                Unalerted hot leads that should be reviewed first.
              </div>
            </div>
          </div>
          <div className={styles.list}>
            {data.pendingAlertSignals.length ? (
              data.pendingAlertSignals.map((signal) => (
                <SignalRecord key={signal.id} signal={signal} highlight />
              ))
            ) : (
              <div className={styles.emptyState}>
                No pending hot leads right now. The queue is clear.
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Already alerted</h2>
              <div className={styles.cardSub}>
                Signals that have already crossed an alert boundary upstream.
              </div>
            </div>
          </div>
          <div className={styles.list}>
            {alertedHotLeads.length ? (
              alertedHotLeads.map((signal) => <SignalRecord key={signal.id} signal={signal} />)
            ) : (
              <div className={styles.emptyState}>
                No hot leads have been marked alerted yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
