import styles from './Topbar.module.css';

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input placeholder="Search signals, keywords, authors…" />
        <span className={styles.kbd}>⌘F</span>
      </div>
      <div className={styles.topRight}>
        <button className={styles.iconBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7l8 6 8-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
        </button>
        <button className={styles.iconBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
          <span className={styles.pulse}></span>
        </button>
        <div className={styles.user}>
          <div className={styles.avatar}>AK</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Aylin Karaca</div>
            <div className={styles.userEmail}>aylin@elvan.io</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.userArrow}><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </header>
  );
}
