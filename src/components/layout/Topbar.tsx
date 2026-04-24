import Link from "next/link";

import type { ChannelStatus, CoverageSummary, StatusSummary } from "@/lib/dashboardData";
import styles from "./Topbar.module.css";

type TopbarProps = {
  statusSummary: StatusSummary;
  coverage: CoverageSummary;
  channelStatuses: ChannelStatus[];
};

export function Topbar({ statusSummary, coverage, channelStatuses }: TopbarProps) {
  const healthyChannels = channelStatuses.filter((channel) => channel.status === "healthy").length;
  const degradedChannels = channelStatuses.filter(
    (channel) => channel.status === "degraded" || channel.status === "offline"
  ).length;

  return (
    <header className={styles.topbar}>
      <label className={styles.search}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input placeholder="Search signals, keywords, authors..." aria-label="Search dashboard" />
        <span className={styles.kbd}>Ctrl F</span>
      </label>

      <div className={styles.topRight}>
        <div className={styles.healthPill} title={`${healthyChannels} healthy, ${degradedChannels} degraded`}>
          <span className={`${styles.modeDot} ${styles[statusSummary.mode]}`}></span>
          {statusSummary.label}
        </div>
        <button className={styles.iconBtn} type="button" title="Inbox" aria-label="Inbox">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7l8 6 8-6" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
          </svg>
        </button>
        <button className={styles.iconBtn} type="button" title="Notifications" aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
          {coverage.totalSignals ? <span className={styles.pulse}></span> : null}
        </button>
        <Link href="/integrations" className={styles.user}>
          <div className={styles.avatar}>AK</div>
          <div>
            <div className={styles.userName}>Aylin Karaca</div>
            <div className={styles.userEmail}>
              {coverage.mirroredSignals} mirrored signals
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
