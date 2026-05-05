import { Bell, Search, UserRound } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import type { CoverageSummary, StatusSummary } from "@/lib/dashboardData";
import styles from "./Topbar.module.css";

type TopbarProps = {
  statusSummary: StatusSummary;
  coverage: CoverageSummary;
};

export function Topbar({ statusSummary, coverage }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.crumb}>
        Elvan Signals <span>&gt;</span> Source Inbox
      </div>

      <div className={styles.search}>
        <Search size={17} aria-hidden="true" />
        <span>Search messages...</span>
        <kbd>Ctrl</kbd>
        <kbd>K</kbd>
      </div>

      <div className={styles.actions}>
        <div className={styles.compactStat} title={statusSummary.description}>
          <span>{statusSummary.label}</span>
          <strong>{coverage.totalSignals}</strong>
        </div>
        <ThemeToggle />
        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
          {statusSummary.warnings.length ? <span className={styles.notifyDot} /> : null}
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Account">
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}
