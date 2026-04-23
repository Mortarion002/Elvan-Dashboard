import Link from "next/link";

import overviewStyles from "./Overview.module.css";
import viewStyles from "../views.module.css";

import { loadDashboardData } from "@/lib/dashboardData";
import { IntentTag } from "@/components/ui/IntentTag";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { SourcePill } from "@/components/ui/SourcePill";
import { UrgencyChip } from "@/components/ui/UrgencyChip";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await loadDashboardData();
  const donutSegments = buildDonutSegments(data.sourceBreakdown);
  const totalSignals = data.metrics.totalSignals || data.metrics.signalsThisWeek;
  const healthyChannels = data.channelStatuses.filter((channel) => channel.status === "healthy");
  const recentWorkflowRuns = data.workflowRuns.slice(0, 4);

  return (
    <div className={viewStyles.content}>
      <div className={viewStyles.pageHead}>
        <div>
          <h1 className={viewStyles.pageTitle}>Overview</h1>
          <div className={viewStyles.pageSub}>
            Live read-only aggregation across X/Post, Reddit, Hacker News, Product Hunt, Neon, and
            Notion. The dashboard consumes the parallel channel and does not modify source systems.
          </div>
        </div>
        <div className={viewStyles.actions}>
          <Link href="/signal-feed" className={viewStyles.btn}>
            Full signal feed
          </Link>
          <Link href="/integrations" className={`${viewStyles.btn} ${viewStyles.primaryBtn}`}>
            Pipeline health
          </Link>
        </div>
      </div>

      {data.statusSummary.warnings.length ? (
        <div className={viewStyles.warningCard}>
          <div className={viewStyles.warningTitle}>Operational notes</div>
          <div className={viewStyles.warningList}>
            {data.statusSummary.warnings.map((warning) => (
              <div className={viewStyles.warningItem} key={warning}>
                {warning}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={overviewStyles.statsStrip}>
        <div className={overviewStyles.stripCard}>
          <div className={overviewStyles.num}>{data.metrics.signalsThisWeek}</div>
          <div className={overviewStyles.lbl}>Signals this week</div>
          <div className={overviewStyles.meta}>All unified records captured in the last 7 days.</div>
        </div>
        <div className={overviewStyles.stripCard}>
          <div className={overviewStyles.num}>{data.metrics.hotLeads}</div>
          <div className={overviewStyles.lbl}>Hot leads</div>
          <div className={overviewStyles.meta}>
            High-urgency or high-score records from all connected sources.
          </div>
        </div>
        <div className={overviewStyles.stripCard}>
          <div className={overviewStyles.num}>{data.metrics.suggestedReplies}</div>
          <div className={overviewStyles.lbl}>Draft coverage</div>
          <div className={overviewStyles.meta}>
            Signals with a saved response suggestion ready for review.
          </div>
        </div>
        <div className={overviewStyles.stripCard}>
          <div className={overviewStyles.num}>{data.metrics.pendingAlerts}</div>
          <div className={overviewStyles.lbl}>Pending alerts</div>
          <div className={overviewStyles.meta}>
            Hot signals still waiting for alert review or operator follow-up.
          </div>
        </div>
      </div>

      <div className={overviewStyles.grid}>
        <div className={overviewStyles.column}>
          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHead}>
              <div>
                <h3 className={overviewStyles.cardTitle}>Trend (7d)</h3>
                <div className={overviewStyles.cardSub}>Cross-channel signal volume</div>
              </div>
            </div>
            <div className={overviewStyles.barChart}>
              {data.trendData.map((datum) => (
                <div className={overviewStyles.barColumn} key={datum.day}>
                  <div
                    className={`${overviewStyles.barValue} ${datum.active ? overviewStyles.activeBar : ""}`}
                    style={{ height: datum.height }}
                  />
                  <div className={overviewStyles.barCount}>{datum.count}</div>
                  <div className={overviewStyles.barLabel}>{datum.day}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHead}>
              <div>
                <h3 className={overviewStyles.cardTitle}>Source mix</h3>
                <div className={overviewStyles.cardSub}>Distribution of unified records</div>
              </div>
            </div>
            <div className={overviewStyles.donutWrap}>
              <div className={overviewStyles.donut}>
                <svg viewBox="0 0 36 36" className={overviewStyles.circularChart}>
                  <path
                    className={overviewStyles.circleBg}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {donutSegments.map((segment) => (
                    <path
                      key={segment.label}
                      className={overviewStyles.circle}
                      stroke={segment.color}
                      strokeDasharray={`${segment.pct}, 100`}
                      strokeDashoffset={segment.offset}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  ))}
                </svg>
                <div className={overviewStyles.donutCenter}>
                  <div className={overviewStyles.donutValue}>{totalSignals}</div>
                  <div className={overviewStyles.donutLabel}>Unified records</div>
                </div>
              </div>
              <div className={overviewStyles.legend}>
                {data.sourceBreakdown.map((entry) => (
                  <div className={overviewStyles.legendItem} key={entry.label}>
                    <div className={overviewStyles.legendLeft}>
                      <div className={overviewStyles.legendDot} style={{ background: entry.color }} />
                      <span>{entry.label}</span>
                    </div>
                    <div className={overviewStyles.legendRight}>
                      <span>{entry.count}</span>
                      <strong>{entry.pct}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHead}>
              <div>
                <h3 className={overviewStyles.cardTitle}>Channel coverage</h3>
                <div className={overviewStyles.cardSub}>
                  How the dashboard is merging the parallel channel today.
                </div>
              </div>
            </div>
            <div className={overviewStyles.coverageGrid}>
              <div className={overviewStyles.coverageItem}>
                <span>Mirrored in Neon + Notion</span>
                <strong>{data.coverage.mirroredSignals}</strong>
              </div>
              <div className={overviewStyles.coverageItem}>
                <span>Neon only</span>
                <strong>{data.coverage.neonOnlySignals}</strong>
              </div>
              <div className={overviewStyles.coverageItem}>
                <span>Notion only</span>
                <strong>{data.coverage.notionOnlySignals}</strong>
              </div>
              <div className={overviewStyles.coverageItem}>
                <span>Workflow runs</span>
                <strong>{data.coverage.workflowRuns}</strong>
              </div>
            </div>
            <div className={overviewStyles.noteList}>
              <div className={overviewStyles.noteItem}>
                {healthyChannels.length} channels are currently healthy and readable.
              </div>
              <div className={overviewStyles.noteItem}>
                Last signal {data.statusSummary.lastSignalLabel}.
              </div>
              <div className={overviewStyles.noteItem}>
                Last workflow {data.statusSummary.lastWorkflowLabel}.
              </div>
            </div>
          </div>
        </div>

        <div className={overviewStyles.mainColumn}>
          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHead}>
              <div>
                <h3 className={overviewStyles.cardTitle}>Latest signals</h3>
                <div className={overviewStyles.cardSub}>
                  Recently captured and deduplicated records from the unified feed.
                </div>
              </div>
              <Link href="/signal-feed" className={overviewStyles.smallLink}>
                View all
              </Link>
            </div>
            <div className={overviewStyles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Signal</th>
                    <th>Source</th>
                    <th>Score</th>
                    <th>Intent</th>
                    <th>Urgency</th>
                    <th>Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overviewSignals.map((signal) => (
                    <tr key={signal.id}>
                      <td className={overviewStyles.tableTitle}>
                        {signal.title}
                        <span className={overviewStyles.tableSub}>{signal.subtitle}</span>
                      </td>
                      <td>
                        <SourcePill src={signal.source} />
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
                      <td className={overviewStyles.tableMeta}>{signal.originLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHead}>
              <div>
                <h3 className={overviewStyles.cardTitle}>Recent workflow runs</h3>
                <div className={overviewStyles.cardSub}>
                  Live telemetry mirrored from the Python side into workflow_runs.
                </div>
              </div>
              <Link href="/integrations" className={overviewStyles.smallLink}>
                Full operations
              </Link>
            </div>
            <div className={overviewStyles.workflowList}>
              {recentWorkflowRuns.length ? (
                recentWorkflowRuns.map((run) => (
                  <div className={overviewStyles.workflowItem} key={run.id}>
                    <div className={overviewStyles.workflowTop}>
                      <div>
                        <div className={overviewStyles.workflowName}>{run.workflow}</div>
                        <div className={overviewStyles.workflowSub}>
                          {run.lastActivityLabel} · {run.durationLabel} · {run.sourceSystem}
                        </div>
                      </div>
                      <div className={overviewStyles.workflowStatus}>{run.status}</div>
                    </div>
                    <div className={overviewStyles.workflowStats}>
                      <span>{run.postsDiscovered} discovered</span>
                      <span>{run.draftsGenerated} drafts</span>
                      <span>{run.redditLeads} Reddit leads</span>
                      <span>{run.hotLeadAlertsSent} hot alerts</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={overviewStyles.emptyState}>
                  No workflow telemetry has been mirrored into Neon yet.
                </div>
              )}
            </div>
          </div>

          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHead}>
              <div>
                <h3 className={overviewStyles.cardTitle}>Competitor mentions</h3>
                <div className={overviewStyles.cardSub}>Rolling 7-day comparison across sources.</div>
              </div>
              <Link href="/competitor-intelligence" className={overviewStyles.smallLink}>
                Full report
              </Link>
            </div>
            <div className={overviewStyles.competitorList}>
              {data.overviewCompetitors.map((competitor) => (
                <div className={overviewStyles.competitorRow} key={competitor.name}>
                  <div className={overviewStyles.competitorName}>{competitor.name}</div>
                  <div className={overviewStyles.competitorCount}>{competitor.mentions}</div>
                  <div className={overviewStyles.competitorBar}>
                    <div
                      className={overviewStyles.competitorFill}
                      style={{ width: `${competitor.pct}%`, background: competitor.color }}
                    />
                  </div>
                  <div className={overviewStyles.competitorDelta}>{competitor.delta}</div>
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
  return entries.map((entry) => {
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
