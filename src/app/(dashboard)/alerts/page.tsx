import Link from "next/link";

import styles from "../views.module.css";

import { SignalRecord } from "@/components/ui/SignalRecord";
import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const data = await loadDashboardData();

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Alerts</h1>
          <div className={styles.pageSub}>
            Operational view over what still needs operator attention, what has already been alerted,
            and where draft coverage is missing.
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/hot-leads" className={styles.btn}>
            Hot leads
          </Link>
          <Link href="/integrations" className={`${styles.btn} ${styles.primaryBtn}`}>
            Integration health
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.pendingAlertSignals.length}</div>
          <div className={styles.statLabel}>Pending alerts</div>
          <div className={styles.statMeta}>High-priority signals that are not yet marked alerted.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.alertedSignals.length}</div>
          <div className={styles.statLabel}>Alerted signals</div>
          <div className={styles.statMeta}>Signals that have already crossed an upstream alert step.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.draftGapSignals.length}</div>
          <div className={styles.statLabel}>Draft gaps</div>
          <div className={styles.statMeta}>Urgent signals that still do not have a response draft.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.metrics.hotLeads}</div>
          <div className={styles.statLabel}>Hot lead pool</div>
          <div className={styles.statMeta}>Current size of the combined hot-lead set.</div>
        </div>
      </div>

      <div className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Pending review</h2>
              <div className={styles.cardSub}>
                Signals that are still waiting for an operator decision or alert action.
              </div>
            </div>
          </div>
          <div className={styles.list}>
            {data.pendingAlertSignals.length ? (
              data.pendingAlertSignals.map((signal) => (
                <SignalRecord key={signal.id} signal={signal} highlight />
              ))
            ) : (
              <div className={styles.emptyState}>No pending alerts right now.</div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Alert history</h2>
              <div className={styles.cardSub}>
                Recent records already marked as alerted by the upstream systems.
              </div>
            </div>
          </div>
          <div className={styles.list}>
            {data.alertedSignals.length ? (
              data.alertedSignals.map((signal) => <SignalRecord key={signal.id} signal={signal} />)
            ) : (
              <div className={styles.emptyState}>No alert history is available yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Missing draft coverage</h2>
            <div className={styles.cardSub}>
              These records are high-signal but still need a suggested reply in the dashboard feed.
            </div>
          </div>
        </div>
        <div className={styles.list}>
          {data.draftGapSignals.length ? (
            data.draftGapSignals.map((signal) => <SignalRecord key={signal.id} signal={signal} />)
          ) : (
            <div className={styles.emptyState}>All urgent signals currently have a saved draft.</div>
          )}
        </div>
      </div>
    </div>
  );
}
