"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Hash,
  MessageCircle,
  PackageOpen,
  PanelLeftClose,
  PanelLeftOpen,
  RadioTower,
} from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
  }, [collapsed]);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <Image
            src="/brand/elvan-icon-dark.png"
            width={34}
            height={34}
            alt="Elvan"
            className={`${styles.themeAsset} ${styles.assetForLight}`}
          />
          <Image
            src="/brand/elvan-icon-light.png"
            width={34}
            height={34}
            alt="Elvan"
            className={`${styles.themeAsset} ${styles.assetForDark}`}
          />
        </div>
        <span className={styles.brandName}>Elvan</span>
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

      <button
        type="button"
        className={styles.collapseButton}
        onClick={() => setCollapsed((current) => !current)}
        aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
        title={collapsed ? "Show sidebar" : "Hide sidebar"}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </aside>
  );
}

function formatBadge(value: number): string {
  if (value > 999) {
    return "999+";
  }
  return String(value);
}
