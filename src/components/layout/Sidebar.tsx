"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationCounts } from "@/lib/dashboardData";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  navigationCounts: NavigationCounts;
  unhealthyChannels: number;
};

export function Sidebar({ navigationCounts, unhealthyChannels }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";

    return () => {
      delete document.documentElement.dataset.sidebar;
    };
  }, [collapsed]);

  const mainNav = [
    {
      href: "/overview",
      label: "Overview",
      icon: (
        <svg className={styles.ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      href: "/hot-leads",
      label: "Hot Leads",
      badge: formatBadge(navigationCounts.hotLeads),
      icon: (
        <svg
          className={styles.ico}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2c1 3 3 4 3 7a3 3 0 0 1-6 0c0-1 .5-2 1-3-2 1-4 4-4 7a6 6 0 0 0 12 0c0-4-3-7-6-11Z" />
        </svg>
      ),
    },
    {
      href: "/signal-feed",
      label: "Signal Feed",
      badge: formatBadge(navigationCounts.signals),
      icon: (
        <svg
          className={styles.ico}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12h4l2-7 4 14 2-7h8" />
        </svg>
      ),
    },
    {
      href: "/competitor-intelligence",
      label: "Competitors",
      icon: (
        <svg
          className={styles.ico}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21V9l5-4 5 4v12" />
          <path d="M13 21v-8l4-3 4 3v8" />
          <path d="M3 21h18" />
        </svg>
      ),
    },
  ];

  const settingsNav = [
    {
      href: "/alerts",
      label: "Alerts",
      badge: formatBadge(navigationCounts.alerts),
      icon: (
        <svg
          className={styles.ico}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      href: "/integrations",
      label: "Integrations",
      badge: unhealthyChannels ? formatBadge(unhealthyChannels) : undefined,
      icon: (
        <svg
          className={styles.ico}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 14 L10 8 L14 12 L20 6"
              stroke="#04140b"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="6" r="2" fill="#04140b" />
          </svg>
        </div>
        <div className={styles.logoText}>
          Elvan<span className={styles.dot}>.</span>ai
        </div>
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setCollapsed((current) => !current)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.navLabel}>Signal Views</div>

      {mainNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
          aria-label={item.label}
          title={collapsed ? item.label : undefined}
        >
          {item.icon}
          <span className={styles.navText}>{item.label}</span>
          {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
        </Link>
      ))}

      <div className={styles.navLabel}>Operations</div>

      {settingsNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
          aria-label={item.label}
          title={collapsed ? item.label : undefined}
        >
          {item.icon}
          <span className={styles.navText}>{item.label}</span>
          {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
        </Link>
      ))}
    </aside>
  );
}

function formatBadge(value: number): string | undefined {
  if (!value) {
    return undefined;
  }
  return value > 999 ? "999+" : String(value);
}
