import styles from "../views.module.css";

import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { SourcePill } from "@/components/ui/SourcePill";
import { UrgencyChip } from "@/components/ui/UrgencyChip";
import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function HotLeadsPage() {
  const data = await loadDashboardData();

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Hot Leads</h1>
          <div className={styles.pageSub}>
            Highest-intent signals across the X/Post bot and n8n collectors.
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.leads.length}</div>
          <div className={styles.statLabel}>Live hot leads</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {data.leads.filter((lead) => lead.alerted).length}
          </div>
          <div className={styles.statLabel}>Already alerted</div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Lead Queue</h2>
          <div className={styles.list}>
            {data.leads.map((lead, index) => (
              <div className={styles.item} key={`${lead.title}-${index}`}>
                <div className={styles.topRow}>
                  <div>
                    <div className={styles.title}>{lead.title}</div>
                    <div className={styles.sub}>{lead.time}</div>
                  </div>
                  <div className={styles.meta}>
                    <SourcePill src={lead.src} />
                    <ScoreBadge score={lead.score} />
                    <UrgencyChip urgency={lead.urgency} />
                  </div>
                </div>
                <div className={styles.body}>
                  <div>
                    <div className={styles.label}>Pain</div>
                    <div className={styles.copy}>{lead.pain}</div>
                  </div>
                  <div>
                    <div className={styles.label}>Elvan Angle</div>
                    <div className={styles.copy}>{lead.angle}</div>
                  </div>
                  <div>
                    <div className={styles.label}>Suggested Reply</div>
                    <div className={styles.copy}>{lead.reply || "No draft yet"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
