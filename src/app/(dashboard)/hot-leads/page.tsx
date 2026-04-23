import Link from "next/link";

import styles from "../views.module.css";

import { SignalRecord } from "@/components/ui/SignalRecord";
import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function HotLeadsPage() {
  const data = await loadDashboardData();
  const alertedHotLeads = data.hotLeadSignals.filter((signal) => signal.alerted);

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Hot Leads</h1>
          <div className={styles.pageSub}>
            Highest-intent signals across the Python acquisition bots and n8n collection workflows,
            sorted into a single review queue.
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/alerts" className={styles.btn}>
            Alert operations
          </Link>
          <Link href="/signal-feed" className={`${styles.btn} ${styles.primaryBtn}`}>
            Full signal feed
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.hotLeadSignals.length}</div>
          <div className={styles.statLabel}>Live hot leads</div>
          <div className={styles.statMeta}>Signals marked hot, urgent, or scoring 8+.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.pendingAlertSignals.length}</div>
          <div className={styles.statLabel}>Need review</div>
          <div className={styles.statMeta}>High-priority items still waiting for operator action.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{alertedHotLeads.length}</div>
          <div className={styles.statLabel}>Already alerted</div>
          <div className={styles.statMeta}>
            Hot leads already pushed through an alerting step in the source pipeline.
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.draftGapSignals.length}</div>
          <div className={styles.statLabel}>Missing drafts</div>
          <div className={styles.statMeta}>
            High-signal records that still need a suggested reply or response draft.
          </div>
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
