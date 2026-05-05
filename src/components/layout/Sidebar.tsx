"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, MessageCircle, PackageOpen, RadioTower } from "lucide-react";

import type { DashboardMode } from "@/lib/dashboardData";
import { SOURCE_SECTIONS } from "@/lib/sourceViews";
import type { SignalSource } from "@/data/mockData";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  sourceCounts: Record<SignalSource, number>;
  mode: DashboardMode;
};

const iconMap = {
  reddit: MessageCircle,
  x: Hash,
  ph: PackageOpen,
  hn: RadioTower,
};

export function Sidebar({ sourceCounts, mode }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>E</div>
        <div>
          <div className={styles.logoText}>Elvan</div>
          <div className={styles.logoSub}>Signal Console</div>
        </div>
      </div>

      <div className={styles.liveCard}>
        <div className={styles.liveTitle}>
          <span className={`${styles.modeDot} ${styles[mode]}`} />
          Live system
        </div>
        <div className={styles.liveGrid}>
          <div>
            <strong>{Object.values(sourceCounts).reduce((sum, count) => sum + count, 0)}</strong>
            <span>messages</span>
          </div>
          <div>
            <strong>4</strong>
            <span>sources</span>
          </div>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Source sections">
        <div className={styles.navLabel}>Sections</div>
        {SOURCE_SECTIONS.map((section) => {
          const Icon = iconMap[section.source];
          const href = `/${section.slug}`;
          const active = pathname === href;

          return (
            <Link
              href={href}
              key={section.slug}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{section.label}</span>
              <strong>{formatBadge(sourceCounts[section.source])}</strong>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <span>Read-only</span>
        <strong>Neon + archive</strong>
      </div>
    </aside>
  );
}

function formatBadge(value: number): string {
  if (value > 999) {
    return "999+";
  }
  return String(value);
}
