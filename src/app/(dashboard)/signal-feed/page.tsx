import styles from "../views.module.css";

import { IntentTag } from "@/components/ui/IntentTag";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { SourcePill } from "@/components/ui/SourcePill";
import { UrgencyChip } from "@/components/ui/UrgencyChip";
import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function SignalFeedPage() {
  const data = await loadDashboardData();

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Signal Feed</h1>
          <div className={styles.pageSub}>
            Unified feed from Neon-backed X/Post data and Notion-backed n8n signals.
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Latest Signals</h2>
        <div className={styles.list}>
          {data.signals.map((signal, index) => (
            <div className={styles.item} key={`${signal.title}-${index}`}>
              <div className={styles.topRow}>
                <div>
                  <div className={styles.title}>{signal.title}</div>
                  <div className={styles.sub}>{signal.sub}</div>
                </div>
                <div className={styles.meta}>
                  <SourcePill src={signal.src} />
                  <ScoreBadge score={signal.score} />
                  <IntentTag intent={signal.intent} color={signal.intentColor} />
                  <UrgencyChip urgency={signal.urgency} />
                </div>
              </div>
              <div className={styles.body}>
                <div>
                  <div className={styles.label}>Pain Point</div>
                  <div className={styles.copy}>{signal.painPoint}</div>
                </div>
                <div>
                  <div className={styles.label}>Elvan Angle</div>
                  <div className={styles.copy}>{signal.elvanAngle}</div>
                </div>
                <div>
                  <div className={styles.label}>Draft</div>
                  <div className={styles.copy}>{signal.reply || "No draft saved"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
