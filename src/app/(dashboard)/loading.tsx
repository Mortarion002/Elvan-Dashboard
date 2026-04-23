import styles from "./views.module.css";

export default function DashboardLoading() {
  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Loading dashboard</h1>
          <div className={styles.pageSub}>
            Pulling the latest mirrored signals from Neon and Notion.
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div className={styles.statCard} key={index}>
            <div className={styles.statValue}>...</div>
            <div className={styles.statLabel}>Refreshing</div>
            <div className={styles.statMeta}>Reading the parallel channel.</div>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Working</div>
        <div className={styles.cardSub}>
          The dashboard is still read-only. It is only loading fresh data for this route.
        </div>
      </div>
    </div>
  );
}
