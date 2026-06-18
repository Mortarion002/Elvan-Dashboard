"use client";

import { useMemo, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import Papa from "papaparse";
import {
  Download,
  Flame,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { deleteHotProspect } from "@/app/actions";
import type { StoredProspect } from "@/lib/hotProspectsDb";
import styles from "./HotProspectsPage.module.css";

type SortMode = "saved" | "clicks" | "name";

export function HotProspectsPage({ prospects: initialProspects }: { prospects: StoredProspect[] }) {
  const [prospects, setProspects] = useState(initialProspects);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("saved");
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [, startDeleteTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const visible = query
      ? prospects.filter((p) =>
          [p.fullName, p.email, p.company, p.website, p.linkedin, p.campaignNames.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(query)
        )
      : prospects;

    return [...visible].sort((a, b) => {
      if (sortMode === "clicks") return b.totalClicks - a.totalClicks || a.email.localeCompare(b.email);
      if (sortMode === "name") return displayName(a).localeCompare(displayName(b));
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
  }, [prospects, searchTerm, sortMode]);

  function handleDelete(email: string) {
    setDeletingEmail(email);
    startDeleteTransition(async () => {
      await deleteHotProspect(email);
      setProspects((current) => current.filter((p) => p.email !== email));
      setDeletingEmail(null);
    });
  }

  function downloadCsv() {
    if (!prospects.length) return;

    const headers = ["Lead Name", "Email", "Company Name", "Phone", "Website", "LinkedIn", "Location", "Status", "Sequence", "Total Clicks", "Campaigns", "Saved At"];
    const rows = prospects.map((p) => ({
      "Lead Name": p.fullName,
      Email: p.email,
      "Company Name": p.company,
      Phone: p.phone,
      Website: p.website,
      LinkedIn: p.linkedin,
      Location: p.location,
      Status: p.status,
      Sequence: p.sequence,
      "Total Clicks": p.totalClicks,
      Campaigns: p.campaignNames.join("; "),
      "Saved At": formatDate(p.savedAt),
    }));
    const csv = Papa.unparse(rows, { columns: headers, newline: "\r\n" });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hot-prospects-${formatDateStamp(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className={styles.content}>
      <section className={styles.hero}>
        <div>
          <div className={styles.titleRow}>
            <span className={styles.sourceMark} style={{ "--accent": "#f97316" } as CSSProperties}>
              HP
            </span>
            <h1>Hot Prospects</h1>
          </div>
          <p>All leads who have clicked in your Smartlead campaigns, saved permanently.</p>
        </div>

        <button
          type="button"
          className={styles.downloadButton}
          onClick={downloadCsv}
          disabled={!prospects.length}
        >
          <Download size={17} aria-hidden="true" />
          <span>Download CSV</span>
        </button>
      </section>

      <section className={styles.metrics} aria-label="Hot prospects summary">
        <MetricCard icon={<Users />} label="Total prospects" value={prospects.length} />
        <MetricCard
          icon={<Flame />}
          label="Total clicks"
          value={prospects.reduce((sum, p) => sum + p.totalClicks, 0)}
        />
        <MetricCard
          icon={<Flame />}
          label="Campaigns covered"
          value={new Set(prospects.flatMap((p) => p.campaignNames)).size}
        />
        <MetricCard
          icon={<Users />}
          label="Showing"
          value={`${filtered.length} / ${prospects.length}`}
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Saved Leads</h2>
            <p>
              {prospects.length === 0
                ? "No leads saved yet. Upload CSVs in Campaign Clicks and click Save to Hot Prospects."
                : `${filtered.length} of ${prospects.length} leads shown.`}
            </p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, company, campaign…"
            />
          </label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label="Sort prospects"
          >
            <option value="saved">Recently saved</option>
            <option value="clicks">Most clicks</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        {filtered.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Clicks</th>
                  <th>Campaigns</th>
                  <th>Sequence</th>
                  <th>Links</th>
                  <th>Saved</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prospect) => (
                  <ProspectRow
                    key={prospect.email}
                    prospect={prospect}
                    isDeleting={deletingEmail === prospect.email}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Flame size={28} aria-hidden="true" />
            <strong>
              {prospects.length === 0
                ? "No hot prospects yet."
                : "No leads match your search."}
            </strong>
            {prospects.length === 0 ? (
              <span>Go to Campaign Clicks, upload CSVs, then click Save to Hot Prospects.</span>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

function ProspectRow({
  prospect,
  isDeleting,
  onDelete,
}: {
  prospect: StoredProspect;
  isDeleting: boolean;
  onDelete: (email: string) => void;
}) {
  return (
    <tr className={isDeleting ? styles.rowDeleting : undefined}>
      <td>
        <strong>{displayName(prospect)}</strong>
        <span>{prospect.email}</span>
      </td>
      <td>
        <strong>{prospect.company || "-"}</strong>
        <span>{prospect.location || ""}</span>
      </td>
      <td>
        <span>{prospect.phone || "-"}</span>
      </td>
      <td>
        <b>{prospect.totalClicks}</b>
      </td>
      <td>
        <span>{prospect.campaignNames.join("; ") || "-"}</span>
      </td>
      <td>
        <span>{prospect.sequence || "-"}</span>
      </td>
      <td>
        <div className={styles.linkGroup}>
          {prospect.website ? (
            <a href={normalizeHref(prospect.website)} target="_blank" rel="noreferrer">
              Website
            </a>
          ) : null}
          {prospect.linkedin ? (
            <a href={normalizeHref(prospect.linkedin)} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : null}
          {!prospect.website && !prospect.linkedin ? <span>-</span> : null}
        </div>
      </td>
      <td>
        <span>{formatDate(prospect.savedAt)}</span>
      </td>
      <td>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(prospect.email)}
          disabled={isDeleting}
          aria-label={`Remove ${prospect.email} from Hot Prospects`}
          title="Remove from Hot Prospects"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricTop}>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function displayName(prospect: StoredProspect): string {
  return prospect.fullName || prospect.email;
}

function normalizeHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "-";
  }
}

function formatDateStamp(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
