import styles from "@/components/sources/SourceInbox.module.css";

export default function DashboardLoading() {
  return (
    <main className={styles.content}>
      <section className={styles.hero}>
        <div>
          <div className={styles.breadcrumb}>Elvan Signal Console</div>
          <div className={styles.titleRow}>
            <span className={styles.sourceMark}>...</span>
            <h1>Loading source inbox</h1>
          </div>
          <p>Pulling the latest read-only signal records from the unified data layer.</p>
        </div>
      </section>
      <section className={styles.metrics}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div className={styles.metricCard} key={index}>
            <div className={styles.metricTop}>
              <span>Refreshing</span>
            </div>
            <strong>...</strong>
          </div>
        ))}
      </section>
    </main>
  );
}
