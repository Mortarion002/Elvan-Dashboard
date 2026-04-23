import Link from "next/link";

import styles from "../views.module.css";

import { loadDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const data = await loadDashboardData();
  const healthyChannels = data.channelStatuses.filter((channel) => channel.status === "healthy");
  const unhealthyChannels = data.channelStatuses.filter((channel) => channel.status !== "healthy");

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Integrations</h1>
          <div className={styles.pageSub}>
            Read-only operational view of the shared Neon mirror, Notion databases, and the producer
            systems feeding the dashboard.
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/overview" className={styles.btn}>
            Overview
          </Link>
          <Link href="/alerts" className={`${styles.btn} ${styles.primaryBtn}`}>
            Alert queue
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{healthyChannels.length}</div>
          <div className={styles.statLabel}>Healthy channels</div>
          <div className={styles.statMeta}>Sources currently readable and fresh enough for the dashboard.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{unhealthyChannels.length}</div>
          <div className={styles.statLabel}>Needs attention</div>
          <div className={styles.statMeta}>Offline, empty, or stale integrations that deserve review.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.workflowRuns.length}</div>
          <div className={styles.statLabel}>Workflow runs</div>
          <div className={styles.statMeta}>Telemetry mirrored into the shared workflow_runs table.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.weeklyReports.length}</div>
          <div className={styles.statLabel}>Weekly reports</div>
          <div className={styles.statMeta}>Reports currently discoverable in the weekly Notion database.</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Channel health</h2>
            <div className={styles.cardSub}>
              Each card below reflects a read-only dashboard dependency or producer system.
            </div>
          </div>
        </div>
        <div className={styles.channelGrid}>
          {data.channelStatuses.map((channel) => (
            <div className={styles.channelCard} key={channel.key}>
              <div className={styles.channelCategory}>{channel.category}</div>
              <div className={styles.cardHead}>
                <div className={styles.channelTitle}>{channel.label}</div>
                <div className={`${styles.statusCell} ${styles[channel.status]}`}>
                  <span className={styles.statusDot}></span>
                  {channel.status}
                </div>
              </div>
              <div className={styles.channelDescription}>{channel.description}</div>
              <div className={styles.channelMeta}>
                <span>{channel.recordCount} records</span>
                <span>{channel.lastSyncLabel}</span>
                <span>{channel.readOnly ? "Read only" : "Writable"}</span>
              </div>
              <div className={styles.channelDescription}>{channel.detail}</div>
              {channel.warnings.length ? (
                <div className={styles.warningList}>
                  {channel.warnings.map((warning) => (
                    <div className={styles.warningItem} key={`${channel.key}-${warning}`}>
                      {warning}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Producer summaries</h2>
              <div className={styles.cardSub}>
                Per-system record counts and the workflows currently represented in the dashboard.
              </div>
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>System</th>
                <th>Records</th>
                <th>Last seen</th>
                <th>Workflows</th>
              </tr>
            </thead>
            <tbody>
              {data.systemSummaries.map((system) => (
                <tr key={system.key}>
                  <td>{system.label}</td>
                  <td className={styles.mono}>{system.count}</td>
                  <td>{system.lastSeenLabel}</td>
                  <td>{system.workflows.join(", ") || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Coverage breakdown</h2>
              <div className={styles.cardSub}>
                How many signals are mirrored, Neon-only, or Notion-only right now.
              </div>
            </div>
          </div>
          <div className={styles.sourceGrid}>
            <div className={styles.sourceCard}>
              <div className={styles.sourceName}>Mirrored</div>
              <div className={styles.metricValue}>{data.coverage.mirroredSignals}</div>
              <div className={styles.statMeta}>Rows visible in both Neon and Notion after merge.</div>
            </div>
            <div className={styles.sourceCard}>
              <div className={styles.sourceName}>Neon only</div>
              <div className={styles.metricValue}>{data.coverage.neonOnlySignals}</div>
              <div className={styles.statMeta}>Most often X_Post and standalone Reddit monitor records.</div>
            </div>
            <div className={styles.sourceCard}>
              <div className={styles.sourceName}>Notion only</div>
              <div className={styles.metricValue}>{data.coverage.notionOnlySignals}</div>
              <div className={styles.statMeta}>Records still only present in the Notion operational store.</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Recent workflow runs</h2>
              <div className={styles.cardSub}>
                Mirrored operational telemetry from the workflow_runs table.
              </div>
            </div>
          </div>
          <div className={styles.workflowList}>
            {data.workflowRuns.length ? (
              data.workflowRuns.map((run) => (
                <div className={styles.workflowRow} key={run.id}>
                  <div className={styles.workflowTop}>
                    <div>
                      <div className={styles.workflowName}>{run.workflow}</div>
                      <div className={styles.workflowMeta}>
                        <span>{run.sourceSystem}</span>
                        <span>{run.lastActivityLabel}</span>
                        <span>{run.durationLabel}</span>
                      </div>
                    </div>
                    <div className={`${styles.statusCell} ${styles[run.status === "success" ? "healthy" : "degraded"]}`}>
                      <span className={styles.statusDot}></span>
                      {run.status}
                    </div>
                  </div>
                  <div className={styles.workflowStats}>
                    <span>{run.postsDiscovered} discovered</span>
                    <span>{run.draftsGenerated} drafts</span>
                    <span>{run.redditLeads} Reddit leads</span>
                    <span>{run.hotLeadAlertsSent} hot alerts</span>
                    {run.queueSent !== null ? <span>Queue sent: {run.queueSent ? "yes" : "no"}</span> : null}
                    {run.digestSent !== null ? <span>Digest sent: {run.digestSent ? "yes" : "no"}</span> : null}
                  </div>
                  {run.errors ? <div className={styles.statMeta}>Error: {run.errors}</div> : null}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No workflow telemetry is available yet.</div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Weekly reports</h2>
              <div className={styles.cardSub}>
                Pages discovered in the optional weekly-report Notion database.
              </div>
            </div>
          </div>
          <div className={styles.reportList}>
            {data.weeklyReports.length ? (
              data.weeklyReports.map((report) => (
                <div className={styles.reportItem} key={report.id}>
                  <div className={styles.reportTitle}>{report.title}</div>
                  <div className={styles.reportMeta}>{report.createdAtLabel}</div>
                  <div className={styles.reportCopy}>{report.summary}</div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                No weekly report pages were found in the configured database.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
