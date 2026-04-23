import styles from "./Overview.module.css";

import { IntentTag } from "@/components/ui/IntentTag";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { SourcePill } from "@/components/ui/SourcePill";
import { UrgencyChip } from "@/components/ui/UrgencyChip";
import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await loadDashboardData();
  const { metrics, overviewCompetitors, signals, sourceBreakdown, trendData } = data;
  const donutSegments = buildDonutSegments(sourceBreakdown);
  const totalSignals = signals.length || metrics.signalsThisWeek;

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <div className={styles.pageSub}>
            Unified dashboard across X/Post, Reddit, Hacker News, and Product Hunt.
            <span className={styles.liveDot}>Live data</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.primary}`}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New tracker
          </button>
        </div>
      </div>

      <div className={styles.statsStrip}>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "var(--green-soft)" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 12h4l2-7 4 14 2-7h8" />
            </svg>
          </div>
          <div>
            <div className={styles.num}>{metrics.signalsThisWeek}</div>
            <div className={styles.lbl}>Signals this week</div>
          </div>
        </div>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "rgba(239,68,68,.1)" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fca5a5"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 2c1 3 3 4 3 7a3 3 0 0 1-6 0c0-1 .5-2 1-3-2 1-4 4-4 7a6 6 0 0 0 12 0c0-4-3-7-6-11Z" />
            </svg>
          </div>
          <div>
            <div className={styles.num} style={{ color: "#fca5a5" }}>
              {metrics.hotLeads}
            </div>
            <div className={styles.lbl}>Hot leads</div>
          </div>
        </div>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "rgba(245,158,11,.1)" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fcd34d"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <div>
            <div className={styles.num} style={{ color: "#fcd34d" }}>
              {metrics.suggestedReplies}
            </div>
            <div className={styles.lbl}>Suggested replies</div>
          </div>
        </div>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "rgba(106,114,132,.1)" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9aa3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <div className={styles.num} style={{ color: "#9aa3b8" }}>
              {metrics.activeSources}
            </div>
            <div className={styles.lbl}>Active sources</div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.col}>
          <div className={`${styles.card} ${styles.chartCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Trend (7d)</h3>
                <div className={styles.cardSub}>Cross-channel signal volume</div>
              </div>
            </div>
            <div className={styles.barChart}>
              {trendData.map((datum) => (
                <div className={styles.bCol} key={datum.day}>
                  <div
                    className={styles.bVal}
                    style={{
                      height: datum.height,
                      ...(datum.active
                        ? {
                            background: "var(--green)",
                            boxShadow: "0 0 16px rgba(34,197,94,.4)",
                          }
                        : {}),
                    }}
                  />
                  <div className={styles.bLbl} style={datum.active ? { color: "var(--text)" } : {}}>
                    {datum.day}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.card} ${styles.chartCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Top Sources</h3>
                <div className={styles.cardSub}>Distribution by volume</div>
              </div>
            </div>
            <div className={styles.donutWrap}>
              <div className={styles.donut}>
                <svg viewBox="0 0 36 36" className={styles.circularChart}>
                  <path
                    className={styles.circleBg}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {donutSegments.map((segment) => (
                    <path
                      key={segment.label}
                      className={styles.circle}
                      stroke={segment.color}
                      strokeDasharray={`${segment.pct}, 100`}
                      strokeDashoffset={segment.offset}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  ))}
                </svg>
                <div className={styles.donutCenter}>
                  <div className={styles.dNum}>{totalSignals}</div>
                  <div className={styles.dLbl}>Live items</div>
                </div>
              </div>
              <div className={styles.donutLegend}>
                {sourceBreakdown.map((entry) => (
                  <div className={styles.legItem} key={entry.label}>
                    <div className={styles.legDot} style={{ background: entry.color }}></div>
                    <span className={styles.legLbl}>{entry.label}</span>
                    <span className={styles.legVal}>{entry.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.col2}>
          <div className={`${styles.card} ${styles.tableCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Latest Signals</h3>
                <div className={styles.cardSub}>Combined from Neon and Notion</div>
              </div>
              <button className={`${styles.btn} ${styles.smallBtn}`}>View all →</button>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Signal</th>
                    <th>Source</th>
                    <th style={{ width: "70px" }}>Score</th>
                    <th>Intent</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((signal, index) => (
                    <tr key={`${signal.title}-${index}`}>
                      <td className={styles.tTitle}>
                        {signal.title}
                        <span className={styles.sub}>{signal.sub}</span>
                      </td>
                      <td>
                        <SourcePill src={signal.src} />
                      </td>
                      <td>
                        <ScoreBadge score={signal.score} />
                      </td>
                      <td>
                        <IntentTag intent={signal.intent} color={signal.intentColor} />
                      </td>
                      <td>
                        <UrgencyChip urgency={signal.urgency} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${styles.card} ${styles.compCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Competitor Mentions</h3>
                <div className={styles.cardSub}>Rolling 7 days</div>
              </div>
              <button className={`${styles.btn} ${styles.smallBtn}`}>Full report →</button>
            </div>
            <div className={styles.compList}>
              {overviewCompetitors.map((competitor, index) => (
                <div className={styles.cRow} key={`${competitor.name}-${index}`}>
                  <div
                    className={styles.cLogo}
                    style={{
                      background: competitor.bg || competitor.color,
                      color: competitor.bg ? "#fff" : "transparent",
                    }}
                  >
                    {!competitor.bg ? (
                      <span style={{ color: "#fff" }}>{competitor.initials}</span>
                    ) : null}
                    {competitor.bg && competitor.initials === "T" ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ color: competitor.color }}
                      >
                        <path d="M12 2L2 22h20L12 2z" />
                      </svg>
                    ) : null}
                  </div>
                  <div className={styles.cName}>{competitor.name}</div>
                  <div className={styles.cVol}>{competitor.mentions}</div>
                  <div className={styles.cBarWrap}>
                    <div className={styles.cBarBg}>
                      <div
                        className={styles.cBarFill}
                        style={{ width: `${competitor.pct}%`, background: competitor.color }}
                      />
                    </div>
                  </div>
                  <div className={`${styles.cTrend} ${competitor.down ? styles.down : styles.up}`}>
                    {competitor.down ? "↓" : "↑"} {competitor.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildDonutSegments(entries: Array<{ label: string; pct: number; color: string }>) {
  let offset = 0;
  return entries.slice(0, 3).map((entry) => {
    const segment = {
      label: entry.label,
      pct: entry.pct,
      color: entry.color,
      offset: `${-offset}`,
    };
    offset += entry.pct;
    return segment;
  });
}
