"use client";

import { useMemo, useRef, useState, useTransition, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import Papa from "papaparse";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Flame,
  MousePointerClick,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

import {
  buildClickedLeadsCsv,
  createUploadId,
  detectClickColumns,
  makeCampaignName,
  summarizeCampaignClicks,
  type CampaignCsvRow,
  type CampaignUpload,
  type ClickedLead,
  type ProspectInput,
} from "@/lib/campaignClicks";
import styles from "./CampaignClicksPage.module.css";

type SortMode = "clicks" | "campaigns" | "name";

export function CampaignClicksPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<CampaignUpload[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("clicks");
  const [saveResult, setSaveResult] = useState<{ saved: number; skipped: number } | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  const summary = useMemo(() => summarizeCampaignClicks(uploads), [uploads]);
  const filteredLeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const visible = query
      ? summary.leads.filter((lead) =>
          [
            lead.fullName,
            lead.email,
            lead.company,
            lead.website,
            lead.linkedIn,
            lead.campaigns.join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        )
      : summary.leads;

    return [...visible].sort((left, right) => {
      if (sortMode === "campaigns") {
        return right.campaignCount - left.campaignCount || right.totalClicks - left.totalClicks;
      }
      if (sortMode === "name") {
        return displayName(left).localeCompare(displayName(right));
      }
      return right.totalClicks - left.totalClicks || displayName(left).localeCompare(displayName(right));
    });
  }, [searchTerm, sortMode, summary.leads]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const parsedUploads = await Promise.all(files.map((file, index) => parseCampaignCsv(file, index)));
      setUploads((current) => [...current, ...parsedUploads]);
    } catch (parseError) {
      console.error("Failed to parse campaign CSV", parseError);
      setError("One or more CSV files could not be parsed.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function updateCampaignName(id: string, campaignName: string) {
    setUploads((current) =>
      current.map((upload) => (upload.id === id ? { ...upload, campaignName } : upload))
    );
  }

  function removeUpload(id: string) {
    setUploads((current) => current.filter((upload) => upload.id !== id));
  }

  function downloadClickedLeads() {
    if (!summary.leads.length) {
      return;
    }

    const csv = buildClickedLeadsCsv(summary.leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smartlead-clicked-leads-${formatLocalDateStamp(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleSaveToHotProspects() {
    if (!summary.leads.length) {
      return;
    }

    setSaveResult(null);
    setError(null);
    startSaveTransition(async () => {
      try {
        const leadsToSave: ProspectInput[] = summary.leads.map((lead) => ({
          email: lead.email,
          fullName: lead.fullName,
        }));
        const response = await fetch("/api/save-prospects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadsToSave),
        });
        const result = (await response.json()) as {
          success: boolean;
          saved?: number;
          skipped?: number;
          error?: string;
        };
        if (result.success) {
          setSaveResult({ saved: result.saved ?? 0, skipped: result.skipped ?? 0 });
        } else {
          setError(result.error ?? "Failed to save to Hot Prospects.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Save failed: ${msg}`);
      }
    });
  }

  const hasUploads = uploads.length > 0;
  const hasClickColumns = summary.filesWithClickColumns > 0;

  return (
    <main className={styles.content}>
      <section className={styles.hero}>
        <div>
          <div className={styles.titleRow}>
            <span className={styles.sourceMark} style={{ "--accent": "#2563eb" } as CSSProperties}>
              CL
            </span>
            <h1>Campaign Clicks</h1>
          </div>
          <p>Upload completed Smartlead campaign exports and isolate leads with click activity.</p>
        </div>

        <div className={styles.heroActions}>
          <label className={styles.primaryButton}>
            <Upload size={17} aria-hidden="true" />
            <span>{isParsing ? "Parsing..." : "Add CSV"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              multiple
              className={styles.fileInput}
              onChange={handleFileChange}
              disabled={isParsing}
            />
          </label>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveToHotProspects}
            disabled={!summary.leads.length || isSaving}
          >
            <Flame size={17} aria-hidden="true" />
            <span>{isSaving ? "Saving..." : "Save to Hot Prospects"}</span>
          </button>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Campaign click summary">
        <MetricCard icon={<FileSpreadsheet />} label="CSVs" value={uploads.length} />
        <MetricCard icon={<Users />} label="Rows" value={summary.totalRows} />
        <MetricCard icon={<MousePointerClick />} label="Clicked leads" value={summary.leads.length} />
        <MetricCard icon={<Download />} label="Total clicks" value={summary.totalClicks} />
      </section>

      {error ? (
        <section className={styles.warningPanel}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span>{error}</span>
        </section>
      ) : null}

      {saveResult ? (
        <section className={styles.successPanel}>
          <CheckCircle size={18} aria-hidden="true" />
          <span>
            {saveResult.saved === 0
              ? `All ${saveResult.skipped} leads already saved — nothing new added.`
              : saveResult.skipped === 0
                ? `${saveResult.saved} lead${saveResult.saved === 1 ? "" : "s"} saved to Hot Prospects.`
                : `${saveResult.saved} lead${saveResult.saved === 1 ? "" : "s"} saved to Hot Prospects — ${saveResult.skipped} already existed and were skipped.`}
          </span>
        </section>
      ) : null}

      {hasUploads && !hasClickColumns ? (
        <section className={styles.warningPanel}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span>
            No click data was found in the uploaded CSVs. Smartlead lead-list exports can show leads as
            completed without including engagement fields such as click_count, clicked time, clicked URL, or
            clicked activity status.
          </span>
        </section>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Campaign CSVs</h2>
            <p>{hasUploads ? `${uploads.length} uploaded campaign file${uploads.length === 1 ? "" : "s"}.` : "No campaign CSVs added."}</p>
          </div>
        </div>

        {hasUploads ? (
          <div className={styles.uploadList}>
            {uploads.map((upload) => (
              <UploadRow
                key={upload.id}
                upload={upload}
                onNameChange={updateCampaignName}
                onRemove={removeUpload}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FileSpreadsheet size={28} aria-hidden="true" />
            <strong>No campaign files yet.</strong>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Clicked Leads</h2>
            <p>
              Showing {filteredLeads.length} of {summary.leads.length} leads with click activity.
            </p>
          </div>
          <button
            type="button"
            className={styles.downloadButton}
            onClick={downloadClickedLeads}
            disabled={!summary.leads.length}
          >
            <Download size={16} aria-hidden="true" />
            Download CSV
          </button>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search clicked leads"
            />
          </label>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            aria-label="Sort clicked leads"
          >
            <option value="clicks">Most clicks</option>
            <option value="campaigns">Most campaigns</option>
            <option value="name">Name</option>
          </select>
        </div>

        {filteredLeads.length ? (
          <ClickedLeadTable leads={filteredLeads} />
        ) : (
          <div className={styles.emptyState}>
            <MousePointerClick size={28} aria-hidden="true" />
            <strong>{hasUploads ? "No clicked leads found in this CSV data." : "Upload CSVs to see clicked leads."}</strong>
            {hasUploads && !hasClickColumns ? (
              <span>Use a Smartlead export that includes click_count or clicked activity fields.</span>
            ) : null}
          </div>
        )}
      </section>
    </main>
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

function UploadRow({
  upload,
  onNameChange,
  onRemove,
}: {
  upload: CampaignUpload;
  onNameChange: (id: string, campaignName: string) => void;
  onRemove: (id: string) => void;
}) {
  const clickColumns = detectClickColumns(upload.headers, upload.rows);

  return (
    <article className={styles.uploadRow}>
      <div className={styles.uploadMain}>
        <input
          value={upload.campaignName}
          onChange={(event) => onNameChange(upload.id, event.target.value)}
          aria-label={`Campaign name for ${upload.fileName}`}
        />
        <span>{upload.fileName}</span>
      </div>
      <div className={styles.uploadStats}>
        <span>{upload.rows.length} rows</span>
        <span>{clickColumns.length ? `${clickColumns.length} click columns` : "No click columns"}</span>
        {upload.parseErrors.length ? <span>{upload.parseErrors.length} parse warnings</span> : null}
      </div>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => onRemove(upload.id)}
        aria-label={`Remove ${upload.fileName}`}
        title={`Remove ${upload.fileName}`}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </article>
  );
}

function ClickedLeadTable({ leads }: { leads: ClickedLead[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Lead</th>
            <th>Company</th>
            <th>Clicks</th>
            <th>Campaigns</th>
            <th>Sequence</th>
            <th>Links</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <strong>{displayName(lead)}</strong>
                <span>{lead.email}</span>
              </td>
              <td>
                <strong>{lead.company || "-"}</strong>
                <span>{lead.location || lead.status || ""}</span>
              </td>
              <td>
                <b>{lead.totalClicks}</b>
              </td>
              <td>
                <span>{lead.campaigns.join("; ")}</span>
              </td>
              <td>
                <span>{lead.sequence || "-"}</span>
              </td>
              <td>
                <div className={styles.linkGroup}>
                  {lead.website ? (
                    <a href={normalizeHref(lead.website)} target="_blank" rel="noreferrer">
                      Website
                    </a>
                  ) : null}
                  {lead.linkedIn ? (
                    <a href={normalizeHref(lead.linkedIn)} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  ) : null}
                  {!lead.website && !lead.linkedIn ? <span>-</span> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function parseCampaignCsv(file: File, index: number): Promise<CampaignUpload> {
  const text = await file.text();
  const parsed = Papa.parse<CampaignCsvRow>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
    transform: (value) => String(value ?? "").trim(),
  });
  const headers = (parsed.meta.fields ?? []).filter((header): header is string => Boolean(header));
  const rows = parsed.data.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").trim().length > 0)
  );

  return {
    id: createUploadId(file, index),
    fileName: file.name,
    campaignName: makeCampaignName(file.name),
    headers,
    rows,
    parseErrors: parsed.errors.map((parseError) => parseError.message),
    uploadedAt: Date.now(),
  };
}

function displayName(lead: ClickedLead): string {
  return lead.fullName || lead.email;
}

function normalizeHref(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function formatLocalDateStamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
