"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowDownUp,
  Bell,
  CheckCircle2,
  ExternalLink,
  Flame,
  Inbox,
  MessageSquareText,
} from "lucide-react";

import type { SourceInboxRecord, SourcePageView } from "@/lib/sourceViews";
import styles from "./SourceInbox.module.css";

type SourceInboxProps = {
  view: SourcePageView;
};

type SortMode = "newest" | "score" | "urgency";

const urgencyRank: Record<string, number> = {
  high: 3,
  mid: 2,
  low: 1,
};

export function SourceInbox({ view }: SourceInboxProps) {
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const filteredRecords = useMemo(() => {
    return [...view.records].sort((left, right) => {
      if (sortMode === "score") {
        return right.score - left.score;
      }
      if (sortMode === "urgency") {
        const urgencyDelta = urgencyRank[right.urgency] - urgencyRank[left.urgency];
        return urgencyDelta || right.score - left.score;
      }
      return new Date(right.lastSeenAtIso).getTime() - new Date(left.lastSeenAtIso).getTime();
    });
  }, [sortMode, view.records]);

  return (
    <main className={styles.content}>
      <section className={styles.hero}>
        <div>
          <div className={styles.titleRow}>
            <span className={styles.sourceMark} style={{ "--accent": view.meta.accent } as CSSProperties}>
              {view.meta.shortLabel}
            </span>
            <h1>{view.meta.label}</h1>
          </div>
          <p>{view.meta.description}</p>
        </div>
      </section>

      <section className={styles.metrics} aria-label={`${view.meta.label} summary`}>
        <MetricCard icon={<Inbox />} label="Messages" value={view.totals.messages} />
        <MetricCard icon={<Flame />} label="Hot leads" value={view.totals.hotLeads} />
        <MetricCard icon={<Bell />} label="Alerted" value={view.totals.alerted} />
        <MetricCard
          icon={<MessageSquareText />}
          label="Draft coverage"
          value={`${view.totals.draftCoverage}%`}
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Message Inbox</h2>
            <p>
              Showing {view.records.length} messages from {view.meta.label}.
            </p>
          </div>
          <button
            type="button"
            className={styles.sortButton}
            aria-label="Toggle sort order"
            onClick={() =>
              setSortMode((current) =>
                current === "newest" ? "urgency" : current === "urgency" ? "score" : "newest"
              )
            }
          >
            <ArrowDownUp size={16} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.records}>
          {filteredRecords.length ? (
            filteredRecords.map((record) => (
              <MessageCard key={record.id} record={record} accent={view.meta.accent} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <Inbox size={26} aria-hidden="true" />
              <strong>No messages yet.</strong>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
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

function MessageCard({ record, accent }: { record: SourceInboxRecord; accent: string }) {
  const visibleStats = [
    record.stats.likes !== null ? `Likes ${record.stats.likes}` : null,
    record.stats.replies !== null ? `Replies ${record.stats.replies}` : null,
    record.stats.comments !== null ? `Comments ${record.stats.comments}` : null,
    record.stats.upvotes !== null ? `Upvotes ${record.stats.upvotes}` : null,
    record.stats.reposts !== null ? `Reposts ${record.stats.reposts}` : null,
  ].filter(Boolean);

  return (
    <article className={styles.recordCard} style={{ "--accent": accent } as CSSProperties}>
      <div className={styles.recordMain}>
        <div className={styles.recordHead}>
          <div>
            <h3>{record.title}</h3>
            <p>{record.subtitle}</p>
          </div>
          <div className={styles.score}>{record.score}</div>
        </div>

        <div className={styles.pills}>
          <span className={`${styles.pill} ${styles[record.urgency]}`}>{formatUrgency(record.urgency)}</span>
          <span className={styles.pill} style={{ "--intent": record.intentColor } as CSSProperties}>
            <span className={styles.intentDot} />
            {record.intent}
          </span>
          <span className={styles.pill}>{record.tool || "-"}</span>
          <span className={styles.pill}>{record.alerted ? "Alerted" : "Not alerted"}</span>
          {record.hotLead ? <span className={`${styles.pill} ${styles.hot}`}>Hot lead</span> : null}
        </div>

        <div className={styles.copyGrid}>
          <InfoBlock label="Pain point" value={record.painPoint} />
          <InfoBlock label="Elvan angle" value={record.elvanAngle} />
          <InfoBlock label="Draft reply" value={record.reply || "No draft saved yet."} />
        </div>
      </div>

      <aside className={styles.recordSide}>
        <div>
          <span>Pipeline</span>
          <strong>{record.sourceSystemLabel}</strong>
        </div>
        <div>
          <span>Workflow</span>
          <strong>{record.workflowLabel}</strong>
        </div>
        <div>
          <span>Origin</span>
          <strong>{record.originLabel}</strong>
        </div>
        {record.matchedKeyword ? (
          <div>
            <span>Keyword</span>
            <strong>{record.matchedKeyword}</strong>
          </div>
        ) : null}
        {visibleStats.length ? <div className={styles.statList}>{visibleStats.join(" / ")}</div> : null}
        {record.url ? (
          <a href={record.url} target="_blank" rel="noreferrer" className={styles.openLink}>
            Open original <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : (
          <span className={styles.noLink}>
            <CheckCircle2 size={14} aria-hidden="true" />
            No source URL
          </span>
        )}
      </aside>
    </article>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoBlock}>
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function formatUrgency(urgency: string): string {
  if (urgency === "high") return "High";
  if (urgency === "mid") return "Medium";
  return "Low";
}
