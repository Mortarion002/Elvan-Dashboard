import Link from "next/link";

import type { UnifiedSignal } from "@/lib/dashboardData";
import { IntentTag } from "./IntentTag";
import { ScoreBadge } from "./ScoreBadge";
import { SourcePill } from "./SourcePill";
import { UrgencyChip } from "./UrgencyChip";
import styles from "./SignalRecord.module.css";

type SignalRecordProps = {
  signal: UnifiedSignal;
  highlight?: boolean;
};

export function SignalRecord({ signal, highlight = false }: SignalRecordProps) {
  return (
    <article className={`${styles.card} ${highlight ? styles.highlight : ""}`}>
      <div className={styles.header}>
        <div className={styles.headCopy}>
          <div className={styles.title}>{signal.title}</div>
          <div className={styles.subtitle}>{signal.subtitle}</div>
        </div>
        <div className={styles.badges}>
          <SourcePill src={signal.source} />
          <ScoreBadge score={signal.score} />
          <IntentTag intent={signal.intent} color={signal.intentColor} />
          <UrgencyChip urgency={signal.urgency} />
        </div>
      </div>

      <div className={styles.meta}>
        <span>{signal.sourceSystemLabel}</span>
        <span>{signal.workflowLabel}</span>
        <span>{signal.originLabel}</span>
        <span>{signal.tool || "-"}</span>
        {signal.matchedKeyword ? <span>Keyword: {signal.matchedKeyword}</span> : null}
        <span>{signal.alerted ? "Alerted" : "Not alerted"}</span>
      </div>

      <div className={styles.grid}>
        <div>
          <div className={styles.label}>Pain point</div>
          <div className={styles.copy}>{signal.painPoint}</div>
        </div>
        <div>
          <div className={styles.label}>Elvan angle</div>
          <div className={styles.copy}>{signal.elvanAngle}</div>
        </div>
        <div>
          <div className={styles.label}>Draft reply</div>
          <div className={styles.copy}>{signal.reply || "No draft saved yet."}</div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerStats}>
          {signal.stats.likes !== null ? <span>Likes {signal.stats.likes}</span> : null}
          {signal.stats.replies !== null ? <span>Replies {signal.stats.replies}</span> : null}
          {signal.stats.comments !== null ? <span>Comments {signal.stats.comments}</span> : null}
          {signal.stats.upvotes !== null ? <span>Upvotes {signal.stats.upvotes}</span> : null}
          <span>Seen {signal.date}</span>
        </div>
        {signal.url ? (
          <Link href={signal.url} className={styles.link} target="_blank" rel="noreferrer">
            Open original
          </Link>
        ) : null}
      </div>
    </article>
  );
}
