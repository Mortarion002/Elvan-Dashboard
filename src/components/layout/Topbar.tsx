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
      <div className={styles.summary}>
        <div className={styles.eyebrow}>
          <span className={`${styles.modeDot} ${styles[statusSummary.mode]}`}></span>
          {statusSummary.label}
        </div>
        <div className={styles.title}>Read-only bridge across X_Post, n8n, Reddit, and Neon</div>
        <div className={styles.meta}>
          <span>Last signal {statusSummary.lastSignalLabel}</span>
          <span>Last workflow {statusSummary.lastWorkflowLabel}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.statPill}>
          <span className={styles.statLabel}>Healthy channels</span>
          <strong>{healthyChannels}</strong>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statLabel}>Degraded</span>
          <strong>{degradedChannels}</strong>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statLabel}>Mirrored</span>
          <strong>{coverage.mirroredSignals}</strong>
        </div>
        <Link href="/integrations" className={styles.linkBtn}>
          Integration health
        </Link>
      </div>
    </header>
  );
}
