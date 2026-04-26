import { cache } from "react";
import { neon } from "@neondatabase/serverless";

import {
  competitors as mockCompetitors,
  crossSignals as mockCrossSignals,
  leads as mockLeads,
  overviewCompetitors as mockOverviewCompetitors,
  signals as mockSignals,
  type Competitor,
  type CrossSignal,
  type Intent,
  type SignalSource,
  type Urgency,
} from "@/data/mockData";

const NOTION_VERSION = "2022-06-28";
const DASHBOARD_TIMEZONE = "Asia/Kolkata";
const MAX_NEON_SIGNAL_ROWS = 2000;
const MAX_WORKFLOW_RUN_ROWS = 100;
const MAX_NOTION_PAGES = 20;
const NOTION_PAGE_SIZE = 100;
const DASHBOARD_CACHE_TTL_MS = 15_000;
const ENABLE_LEGACY_NOTION_SIGNALS =
  process.env.ENABLE_LEGACY_NOTION_SIGNALS?.toLowerCase() === "true";

const SOURCE_COLORS: Record<SignalSource, string> = {
  x: "#60a5fa",
  reddit: "#f97316",
  hn: "#f59e0b",
  ph: "#fb7185",
};

const COMPETITOR_COLORS = [
  "#fb7185",
  "#60a5fa",
  "#f59e0b",
  "#34d399",
  "#a78bfa",
  "#f87171",
  "#22c55e",
  "#38bdf8",
];

const COMPETITOR_NAMES = [
  "Delighted",
  "Typeform",
  "Qualtrics",
  "Survicate",
  "Medallia",
  "Hotjar",
  "SurveyMonkey",
  "Pendo",
  "Intercom",
  "Zendesk",
];

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
]);

export type DashboardMode = "live" | "partial" | "fallback";
export type DataOrigin = "neon" | "notion";
export type ChannelState = "healthy" | "degraded" | "offline" | "empty";

export type SourceBreakdown = {
  label: string;
  pct: number;
  count: number;
  color: string;
};

export type TrendDatum = {
  day: string;
  height: string;
  count: number;
  active?: boolean;
};

export type OverviewMetrics = {
  signalsThisWeek: number;
  hotLeads: number;
  suggestedReplies: number;
  activeSources: number;
  totalSignals: number;
  alertedSignals: number;
  pendingAlerts: number;
  mirroredSignals: number;
};

export type StatusSummary = {
  mode: DashboardMode;
  label: string;
  description: string;
  lastSignalAt: Date | null;
  lastSignalLabel: string;
  lastWorkflowAt: Date | null;
  lastWorkflowLabel: string;
  warnings: string[];
};

export type NavigationCounts = {
  hotLeads: number;
  signals: number;
  alerts: number;
  integrations: number;
};

export type CoverageSummary = {
  totalSignals: number;
  rawSignals: number;
  mirroredSignals: number;
  neonOnlySignals: number;
  notionOnlySignals: number;
  workflowRuns: number;
  weeklyReports: number;
};

export type SourceSummary = {
  source: SignalSource;
  label: string;
  color: string;
  count: number;
  hotLeads: number;
  alerted: number;
  lastSeenAt: Date | null;
  lastSeenLabel: string;
  replyCoverage: number;
};

export type SystemSummary = {
  key: string;
  label: string;
  count: number;
  lastSeenAt: Date | null;
  lastSeenLabel: string;
  workflows: string[];
};

export type ChannelStatus = {
  key: string;
  label: string;
  category: string;
  status: ChannelState;
  description: string;
  detail: string;
  recordCount: number;
  readOnly: boolean;
  lastSyncAt: Date | null;
  lastSyncLabel: string;
  warnings: string[];
};

export type WorkflowRun = {
  id: string;
  sourceSystem: string;
  workflow: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  durationLabel: string;
  lastActivityLabel: string;
  postsDiscovered: number;
  draftsGenerated: number;
  redditLeads: number;
  queueSent: boolean | null;
  digestSent: boolean | null;
  hotLeadAlertsSent: number;
  stopReason: string | null;
  errors: string | null;
};

export type WeeklyReport = {
  id: string;
  title: string;
  createdAt: Date;
  createdAtLabel: string;
  summary: string;
  angle: string;
  score: number | null;
};

export type UnifiedSignal = {
  id: string;
  source: SignalSource;
  sourceSystem: string;
  sourceSystemLabel: string;
  workflow: string;
  workflowLabel: string;
  origins: DataOrigin[];
  originLabel: string;
  title: string;
  subtitle: string;
  score: number;
  rawScore: number;
  intent: Intent;
  intentColor: string;
  urgency: Urgency;
  priority: string | null;
  tool: string;
  date: string;
  painPoint: string;
  elvanAngle: string;
  reply: string;
  alerted: boolean;
  hotLead: boolean;
  occurredAt: Date;
  lastSeenAt: Date;
  url: string;
  author: string | null;
  subreddit: string | null;
  matchedKeyword: string | null;
  stats: {
    likes: number | null;
    replies: number | null;
    reposts: number | null;
    comments: number | null;
    upvotes: number | null;
  };
  metadata: Record<string, unknown>;
};

export type DashboardData = {
  mode: DashboardMode;
  metrics: OverviewMetrics;
  statusSummary: StatusSummary;
  navigationCounts: NavigationCounts;
  coverage: CoverageSummary;
  trendData: TrendDatum[];
  sourceBreakdown: SourceBreakdown[];
  sourceSummaries: SourceSummary[];
  systemSummaries: SystemSummary[];
  overviewSignals: UnifiedSignal[];
  signals: UnifiedSignal[];
  hotLeadSignals: UnifiedSignal[];
  alertedSignals: UnifiedSignal[];
  pendingAlertSignals: UnifiedSignal[];
  draftGapSignals: UnifiedSignal[];
  competitors: Competitor[];
  overviewCompetitors: Competitor[];
  crossSignals: CrossSignal[];
  channelStatuses: ChannelStatus[];
  workflowRuns: WorkflowRun[];
  weeklyReports: WeeklyReport[];
};

type LoaderResult<T> = {
  items: T[];
  enabled: boolean;
  error: string | null;
  truncated: boolean;
  totalCount: number;
};

type NotionQueryOptions = {
  databaseId: string | undefined;
  label: string;
  sortProperty?: string;
};

let dashboardDataCache:
  | {
      value: DashboardData;
      expiresAt: number;
    }
  | null = null;
let dashboardDataInFlight: Promise<DashboardData> | null = null;

type NeonSignalRow = {
  dedupe_key: string;
  source: string;
  source_system: string;
  workflow: string;
  title: string;
  body: string | null;
  url: string | null;
  author: string | null;
  subreddit: string | null;
  matched_keyword: string | null;
  intent: string | null;
  urgency: string | null;
  priority: string | null;
  draft_reply: string | null;
  score: number | null;
  boosted_score: number | null;
  tool_mentioned: string | null;
  pain_point: string | null;
  elvan_angle: string | null;
  occurred_at: Date | null;
  comments_count: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
  upvotes: number | null;
  alerted: boolean;
  hot_lead: boolean;
  metadata: Record<string, unknown> | null;
};

type WorkflowRunRow = {
  id: number;
  source_system: string;
  workflow: string;
  started_at: Date;
  finished_at: Date | null;
  status: string;
  posts_discovered: number | null;
  drafts_generated: number | null;
  reddit_leads: number | null;
  queue_sent: boolean | null;
  digest_sent: boolean | null;
  hot_lead_alerts_sent: number | null;
  stop_reason: string | null;
  errors: string | null;
};

type NotionProperty = {
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
  select?: { name?: string | null } | null;
  number?: number | null;
  checkbox?: boolean;
  url?: string | null;
  date?: { start?: string | null } | null;
};

function getNeonSql() {
  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

export const loadDashboardData = cache(async (): Promise<DashboardData> => {
  const now = Date.now();
  if (dashboardDataCache && dashboardDataCache.expiresAt > now) {
    return dashboardDataCache.value;
  }

  if (dashboardDataInFlight) {
    return dashboardDataInFlight;
  }

  dashboardDataInFlight = buildDashboardData().then((value) => {
    dashboardDataCache = {
      value,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    };
    return value;
  });

  try {
    return await dashboardDataInFlight;
  } finally {
    dashboardDataInFlight = null;
  }
});

async function buildDashboardData(): Promise<DashboardData> {
  const [neonSignalsResult, notionSignalsResult, workflowRunsResult, weeklyReportsResult] =
    await Promise.all([
      loadNeonSignals(),
      loadNotionSignals(),
      loadWorkflowRuns(),
      loadWeeklyReports(),
    ]);

  const mergedSignals = dedupeSignals([
    ...neonSignalsResult.items,
    ...notionSignalsResult.items,
  ]).sort((left, right) => right.lastSeenAt.getTime() - left.lastSeenAt.getTime());

  if (!mergedSignals.length && !workflowRunsResult.items.length) {
    return buildFallbackDashboardData({
      neonSignalsResult,
      notionSignalsResult,
      workflowRunsResult,
      weeklyReportsResult,
    });
  }

  const hotLeadSignals = mergedSignals.filter(isHotLeadSignal);
  const alertedSignals = mergedSignals.filter((signal) => signal.alerted);
  const pendingAlertSignals = hotLeadSignals.filter((signal) => !signal.alerted);
  const draftGapSignals = mergedSignals.filter(
    (signal) => (isHotLeadSignal(signal) || signal.urgency === "high") && !signal.reply.trim()
  );
  const competitors = buildCompetitors(mergedSignals);
  const sourceSummaries = buildSourceSummaries(mergedSignals);
  const workflowRuns = workflowRunsResult.items;
  const weeklyReports = weeklyReportsResult.items;
  const coverage = buildCoverageSummary({
    mergedSignals,
    rawSignalCount: neonSignalsResult.items.length + notionSignalsResult.items.length,
    workflowRuns,
    weeklyReports,
  });
  const metrics = buildMetrics(mergedSignals, coverage);
  const channelStatuses = buildChannelStatuses({
    neonSignalsResult,
    notionSignalsResult,
    workflowRunsResult,
    weeklyReportsResult,
    mergedSignals,
  });
  const statusSummary = buildStatusSummary({
    neonSignalsResult,
    notionSignalsResult,
    workflowRunsResult,
    weeklyReportsResult,
    mergedSignals,
    workflowRuns,
  });

  return {
    mode: statusSummary.mode,
    metrics,
    statusSummary,
    navigationCounts: {
      hotLeads: hotLeadSignals.length,
      signals: mergedSignals.length,
      alerts: pendingAlertSignals.length,
      integrations: channelStatuses.length,
    },
    coverage,
    trendData: buildTrendData(mergedSignals),
    sourceBreakdown: buildSourceBreakdown(mergedSignals),
    sourceSummaries,
    systemSummaries: buildSystemSummaries(mergedSignals),
    overviewSignals: mergedSignals.slice(0, 8),
    signals: mergedSignals,
    hotLeadSignals,
    alertedSignals,
    pendingAlertSignals,
    draftGapSignals,
    competitors: competitors.length ? competitors : mockCompetitors,
    overviewCompetitors: competitors.slice(0, 5).length
      ? competitors.slice(0, 5)
      : mockOverviewCompetitors,
    crossSignals: buildCrossSignals(
      mergedSignals,
      competitors.length ? competitors : mockCompetitors
    ),
    channelStatuses,
    workflowRuns,
    weeklyReports,
  };
}

async function loadNeonSignals(): Promise<LoaderResult<UnifiedSignal>> {
  const sql = getNeonSql();
  if (!sql) {
    return disabledLoaderResult();
  }

  try {
    const [rawCountRows, rawRows] = await Promise.all([
      sql`
        SELECT count(*)::int AS total
        FROM signal_events
        WHERE source IN ('x', 'reddit', 'hn', 'ph')
      `,
      sql`
        SELECT
          dedupe_key,
          source,
          source_system,
          workflow,
          title,
          body,
          url,
          author,
          subreddit,
          matched_keyword,
          intent,
          urgency,
          priority,
          draft_reply,
          score,
          boosted_score,
          tool_mentioned,
          pain_point,
          elvan_angle,
          occurred_at,
          comments_count,
          likes,
          replies,
          reposts,
          upvotes,
          alerted,
          hot_lead,
          metadata
        FROM signal_events
        WHERE source IN ('x', 'reddit', 'hn', 'ph')
        ORDER BY COALESCE(occurred_at, last_updated_at) DESC
        LIMIT ${MAX_NEON_SIGNAL_ROWS}
      `,
    ]);

    const countRows = rawCountRows as unknown as Array<{ total: number }>;
    const rows = rawRows as unknown as NeonSignalRow[];

    const totalCount = Number(countRows[0]?.total ?? 0);
    return {
      items: rows
        .map((row) => mapNeonRowToSignal(row))
        .filter((row): row is UnifiedSignal => row !== null),
      enabled: true,
      error: null,
      truncated: totalCount > rows.length,
      totalCount,
    };
  } catch (error) {
    console.error("Failed to load Neon signals for dashboard", error);
    return {
      items: [],
      enabled: true,
      error: "Neon signal query failed",
      truncated: false,
      totalCount: 0,
    };
  }
}

async function loadWorkflowRuns(): Promise<LoaderResult<WorkflowRun>> {
  const sql = getNeonSql();
  if (!sql) {
    return disabledLoaderResult();
  }

  try {
    const [rawCountRows, rawRows] = await Promise.all([
      sql`
        SELECT count(*)::int AS total
        FROM workflow_runs
      `,
      sql`
        SELECT
          id,
          source_system,
          workflow,
          started_at,
          finished_at,
          status,
          posts_discovered,
          drafts_generated,
          reddit_leads,
          queue_sent,
          digest_sent,
          hot_lead_alerts_sent,
          stop_reason,
          errors
        FROM workflow_runs
        ORDER BY started_at DESC
        LIMIT ${MAX_WORKFLOW_RUN_ROWS}
      `,
    ]);

    const countRows = rawCountRows as unknown as Array<{ total: number }>;
    const rows = rawRows as unknown as WorkflowRunRow[];

    const totalCount = Number(countRows[0]?.total ?? 0);
    return {
      items: rows.map((row) => mapWorkflowRun(row)),
      enabled: true,
      error: null,
      truncated: totalCount > rows.length,
      totalCount,
    };
  } catch (error) {
    console.error("Failed to load workflow runs for dashboard", error);
    return {
      items: [],
      enabled: true,
      error: "Neon workflow run query failed",
      truncated: false,
      totalCount: 0,
    };
  }
}

async function loadNotionSignals(): Promise<LoaderResult<UnifiedSignal>> {
  if (!ENABLE_LEGACY_NOTION_SIGNALS) {
    return disabledLoaderResult();
  }

  const result = await fetchNotionDatabasePages({
    databaseId: process.env.NOTION_DB_ID,
    label: "legacy signals",
    sortProperty: "Created At",
  });
  return {
    items: result.items
      .map((page) => mapNotionPageToSignal(page))
      .filter((row): row is UnifiedSignal => row !== null),
    enabled: result.enabled,
    error: result.error,
    truncated: result.truncated,
    totalCount: result.totalCount,
  };
}

async function loadWeeklyReports(): Promise<LoaderResult<WeeklyReport>> {
  const result = await fetchNotionDatabasePages({
    databaseId: process.env.NOTION_WEEKLY_DB_ID,
    label: "weekly reports",
  });
  return {
    items: result.items
      .map((page) => mapWeeklyReport(page))
      .filter((row): row is WeeklyReport => row !== null),
    enabled: result.enabled,
    error: result.error,
    truncated: result.truncated,
    totalCount: result.totalCount,
  };
}

async function fetchNotionDatabasePages(
  options: NotionQueryOptions
): Promise<LoaderResult<Record<string, unknown>>> {
  const notionToken = process.env.NOTION_API_KEY;
  const databaseId = options.databaseId;
  if (!notionToken || !databaseId) {
    return disabledLoaderResult();
  }

  try {
    const results: Array<Record<string, unknown>> = [];
    let cursor: string | undefined;
    let pagesFetched = 0;
    let hasMore = true;

    while (hasMore && pagesFetched < MAX_NOTION_PAGES && results.length < MAX_NOTION_PAGES * NOTION_PAGE_SIZE) {
      const body: Record<string, unknown> = {
        page_size: NOTION_PAGE_SIZE,
      };

      if (cursor) {
        body.start_cursor = cursor;
      }

      if (options.sortProperty) {
        body.sorts = [{ property: options.sortProperty, direction: "descending" }];
      }

      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Content-Type": "application/json",
          "Notion-Version": NOTION_VERSION,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          `Notion ${options.label} query failed with HTTP ${response.status}: ${detail}`
        );
      }

      const payload = (await response.json()) as {
        results?: Array<Record<string, unknown>>;
        has_more?: boolean;
        next_cursor?: string | null;
      };

      const pageResults = Array.isArray(payload.results) ? payload.results : [];
      results.push(...pageResults);
      cursor = payload.next_cursor ?? undefined;
      hasMore = Boolean(payload.has_more && cursor);
      pagesFetched += 1;
    }

    return {
      items: results,
      enabled: true,
      error: null,
      truncated: hasMore,
      totalCount: results.length,
    };
  } catch (error) {
    console.error(`Failed to load Notion ${options.label} for dashboard`, error);
    return {
      items: [],
      enabled: true,
      error: `Notion ${options.label} query failed`,
      truncated: false,
      totalCount: 0,
    };
  }
}

function buildCoverageSummary(params: {
  mergedSignals: UnifiedSignal[];
  rawSignalCount: number;
  workflowRuns: WorkflowRun[];
  weeklyReports: WeeklyReport[];
}): CoverageSummary {
  const mirroredSignals = params.mergedSignals.filter((signal) => signal.origins.length > 1).length;
  const neonOnlySignals = params.mergedSignals.filter(
    (signal) => signal.origins.length === 1 && signal.origins[0] === "neon"
  ).length;
  const notionOnlySignals = params.mergedSignals.filter(
    (signal) => signal.origins.length === 1 && signal.origins[0] === "notion"
  ).length;

  return {
    totalSignals: params.mergedSignals.length,
    rawSignals: params.rawSignalCount,
    mirroredSignals,
    neonOnlySignals,
    notionOnlySignals,
    workflowRuns: params.workflowRuns.length,
    weeklyReports: params.weeklyReports.length,
  };
}

function buildStatusSummary(params: {
  neonSignalsResult: LoaderResult<UnifiedSignal>;
  notionSignalsResult: LoaderResult<UnifiedSignal>;
  workflowRunsResult: LoaderResult<WorkflowRun>;
  weeklyReportsResult: LoaderResult<WeeklyReport>;
  mergedSignals: UnifiedSignal[];
  workflowRuns: WorkflowRun[];
}): StatusSummary {
  const lastSignalAt = params.mergedSignals[0]?.lastSeenAt ?? null;
  const lastWorkflowAt = params.workflowRuns[0]?.startedAt ?? null;
  const warnings: string[] = [];

  if (params.neonSignalsResult.error) {
    warnings.push("Neon is configured but the dashboard could not read operational signal rows.");
  }

  if (params.notionSignalsResult.error) {
    warnings.push("Legacy Notion signal import is enabled but the dashboard could not read that database.");
  }

  if (params.workflowRunsResult.error) {
    warnings.push("Workflow telemetry is unavailable because the dashboard could not read Neon workflow_runs.");
  }

  if (params.neonSignalsResult.truncated || params.notionSignalsResult.truncated) {
    warnings.push("One or more data sources were truncated for safety; the UI may not reflect the full history.");
  }

  const latestRun = params.workflowRuns[0];
  if (latestRun && latestRun.status.toLowerCase() !== "success") {
    warnings.push(
      `Latest ${latestRun.workflow} run from ${formatSourceSystem(latestRun.sourceSystem)} finished with status ${latestRun.status}.`
    );
  }

  if (params.weeklyReportsResult.enabled && !params.weeklyReportsResult.items.length) {
    warnings.push("Weekly report database is connected but currently empty.");
  }

  let mode: DashboardMode = "live";
  if (!params.mergedSignals.length) {
    mode = "fallback";
  } else if (
    params.neonSignalsResult.error ||
    params.notionSignalsResult.error ||
    !params.neonSignalsResult.items.length
  ) {
    mode = "partial";
  }

  return {
    mode,
    label:
      mode === "live"
        ? "Live Neon operations"
        : mode === "partial"
          ? "Partially live"
          : "Fallback mode",
    description:
      mode === "live"
        ? "Dashboard is reading the shared Neon signal table without writing back to any operational system."
        : mode === "partial"
          ? "Dashboard is connected, but at least one upstream source is missing, stale, or degraded."
          : "Live sources are unavailable, so the dashboard is rendering fallback data only.",
    lastSignalAt,
    lastSignalLabel: formatLongTimestamp(lastSignalAt),
    lastWorkflowAt,
    lastWorkflowLabel: formatLongTimestamp(lastWorkflowAt),
    warnings,
  };
}

function buildMetrics(signals: UnifiedSignal[], coverage: CoverageSummary): OverviewMetrics {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const signalsThisWeek = signals.filter((signal) => signal.lastSeenAt.getTime() >= weekAgo).length;
  const hotLeads = signals.filter(isHotLeadSignal).length;
  const suggestedReplies = signals.filter((signal) => signal.reply.trim().length > 0).length;
  const alertedSignals = signals.filter((signal) => signal.alerted).length;
  const pendingAlerts = signals.filter((signal) => isHotLeadSignal(signal) && !signal.alerted).length;

  return {
    signalsThisWeek,
    hotLeads,
    suggestedReplies,
    activeSources: new Set(signals.map((signal) => signal.source)).size,
    totalSignals: signals.length,
    alertedSignals,
    pendingAlerts,
    mirroredSignals: coverage.mirroredSignals,
  };
}

function buildTrendData(signals: UnifiedSignal[]): TrendDatum[] {
  const now = new Date();
  const dayFormat = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: DASHBOARD_TIMEZONE,
  });
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    return {
      label: dayFormat.format(day),
      day,
      count: 0,
    };
  });

  for (const signal of signals) {
    const target = buckets.find((bucket) => isSameDay(bucket.day, signal.lastSeenAt));
    if (target) {
      target.count += 1;
    }
  }

  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);
  return buckets.map((bucket, index) => ({
    day: bucket.label,
    count: bucket.count,
    height: `${Math.max(18, Math.round((bucket.count / maxCount) * 100))}%`,
    active: index === buckets.length - 1,
  }));
}

function buildSourceBreakdown(signals: UnifiedSignal[]): SourceBreakdown[] {
  const counts = new Map<SignalSource, number>();
  for (const signal of signals) {
    counts.set(signal.source, (counts.get(signal.source) ?? 0) + 1);
  }

  const total = Math.max(
    1,
    Array.from(counts.values()).reduce((sum, count) => sum + count, 0)
  );

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([source, count]) => ({
      label: sourceLabel(source),
      pct: Math.round((count / total) * 100),
      count,
      color: SOURCE_COLORS[source],
    }));
}

function buildSourceSummaries(signals: UnifiedSignal[]): SourceSummary[] {
  const grouped = new Map<SignalSource, UnifiedSignal[]>();

  for (const signal of signals) {
    const list = grouped.get(signal.source) ?? [];
    list.push(signal);
    grouped.set(signal.source, list);
  }

  return Array.from(grouped.entries())
    .map(([source, items]) => {
      const lastSeenAt = items.reduce<Date | null>(
        (latest, item) =>
          !latest || item.lastSeenAt.getTime() > latest.getTime() ? item.lastSeenAt : latest,
        null
      );
      const replyCoverage = Math.round(
        (items.filter((item) => item.reply.trim()).length / Math.max(items.length, 1)) * 100
      );

      return {
        source,
        label: sourceLabel(source),
        color: SOURCE_COLORS[source],
        count: items.length,
        hotLeads: items.filter(isHotLeadSignal).length,
        alerted: items.filter((item) => item.alerted).length,
        lastSeenAt,
        lastSeenLabel: formatLongTimestamp(lastSeenAt),
        replyCoverage,
      };
    })
    .sort((left, right) => right.count - left.count);
}

function buildSystemSummaries(signals: UnifiedSignal[]): SystemSummary[] {
  const grouped = new Map<string, UnifiedSignal[]>();

  for (const signal of signals) {
    const list = grouped.get(signal.sourceSystem) ?? [];
    list.push(signal);
    grouped.set(signal.sourceSystem, list);
  }

  return Array.from(grouped.entries())
    .map(([key, items]) => {
      const lastSeenAt = items.reduce<Date | null>(
        (latest, item) =>
          !latest || item.lastSeenAt.getTime() > latest.getTime() ? item.lastSeenAt : latest,
        null
      );

      return {
        key,
        label: formatSourceSystem(key),
        count: items.length,
        lastSeenAt,
        lastSeenLabel: formatLongTimestamp(lastSeenAt),
        workflows: Array.from(new Set(items.map((item) => item.workflowLabel))).slice(0, 3),
      };
    })
    .sort((left, right) => right.count - left.count);
}

function buildCompetitors(signals: UnifiedSignal[]): Competitor[] {
  const now = Date.now();
  const currentWindow = now - 7 * 24 * 60 * 60 * 1000;
  const previousWindow = now - 14 * 24 * 60 * 60 * 1000;
  const grouped = new Map<string, { current: number; previous: number }>();

  for (const signal of signals) {
    if (!signal.tool || signal.tool === "-") {
      continue;
    }

    const entry = grouped.get(signal.tool) ?? { current: 0, previous: 0 };
    const timestamp = signal.lastSeenAt.getTime();
    if (timestamp >= currentWindow) {
      entry.current += 1;
    } else if (timestamp >= previousWindow) {
      entry.previous += 1;
    }
    grouped.set(signal.tool, entry);
  }

  const sorted = Array.from(grouped.entries())
    .sort((left, right) => {
      if (right[1].current !== left[1].current) {
        return right[1].current - left[1].current;
      }
      return left[0].localeCompare(right[0]);
    })
    .slice(0, 8);

  const maxMentions = Math.max(...sorted.map(([, value]) => value.current), 1);

  return sorted.map(([name, value], index) => {
    const deltaValue = value.current - value.previous;
    const deltaPrefix = deltaValue >= 0 ? "+" : "";
    return {
      name,
      initials: name.slice(0, 1).toUpperCase(),
      color: COMPETITOR_COLORS[index % COMPETITOR_COLORS.length],
      mentions: value.current,
      pct: Math.max(8, Math.round((value.current / maxMentions) * 100)),
      delta: `${deltaPrefix}${deltaValue}`,
      up: deltaValue >= 0,
      down: deltaValue < 0,
    };
  });
}

function buildCrossSignals(signals: UnifiedSignal[], competitors: Competitor[]): CrossSignal[] {
  const lookup = new Set(competitors.map((competitor) => competitor.name));
  const grouped = new Map<
    string,
    { sources: Set<SignalSource>; titles: string[]; score: number }
  >();

  for (const signal of signals) {
    if (!lookup.has(signal.tool)) {
      continue;
    }

    const entry = grouped.get(signal.tool) ?? {
      sources: new Set<SignalSource>(),
      titles: [],
      score: 0,
    };
    entry.sources.add(signal.source);
    if (entry.titles.length < 3) {
      entry.titles.push(signal.title);
    }
    entry.score += signal.score;
    grouped.set(signal.tool, entry);
  }

  const fallback = competitors.length ? competitors : mockCompetitors;
  const result = fallback
    .filter((competitor) => grouped.has(competitor.name))
    .map((competitor) => {
      const entry = grouped.get(competitor.name)!;
      return {
        tool: competitor.name,
        initials: competitor.initials,
        color: competitor.color,
        sources: Array.from(entry.sources),
        score: Number(entry.score.toFixed(1)),
        titles: entry.titles,
      };
    });

  return result.length ? result : mockCrossSignals;
}

function buildChannelStatuses(params: {
  neonSignalsResult: LoaderResult<UnifiedSignal>;
  notionSignalsResult: LoaderResult<UnifiedSignal>;
  workflowRunsResult: LoaderResult<WorkflowRun>;
  weeklyReportsResult: LoaderResult<WeeklyReport>;
  mergedSignals: UnifiedSignal[];
}): ChannelStatus[] {
  const neonSignals = params.neonSignalsResult.items;
  const notionSignals = params.notionSignalsResult.items;
  const workflowRuns = params.workflowRunsResult.items;

  const latestNeonSignal = neonSignals[0]?.lastSeenAt ?? null;
  const latestNotionSignal = notionSignals[0]?.lastSeenAt ?? null;
  const latestWorkflowRun = workflowRuns[0]?.startedAt ?? null;
  const latestXSignal =
    params.mergedSignals.find((signal) => signal.sourceSystem === "x_post")?.lastSeenAt ?? null;
  const latestN8nSignal =
    params.mergedSignals.find((signal) => signal.sourceSystem === "n8n")?.lastSeenAt ?? null;
  const latestRedditSignal =
    params.mergedSignals.find((signal) => signal.sourceSystem === "reddit_monitor")?.lastSeenAt ??
    null;

  return [
    {
      key: "neon",
      label: "Shared Neon signal store",
      category: "Data channel",
      status: resolveChannelState({
        enabled: params.neonSignalsResult.enabled,
        error: params.neonSignalsResult.error,
        count: neonSignals.length,
        lastSyncAt: latestNeonSignal,
      }),
      description: "Read-only aggregation from signal_events and workflow_runs.",
      detail: `${params.neonSignalsResult.totalCount} operational signal records available to the dashboard.`,
      recordCount: params.neonSignalsResult.totalCount,
      readOnly: true,
      lastSyncAt: latestNeonSignal,
      lastSyncLabel: formatLongTimestamp(latestNeonSignal),
      warnings: buildLoaderWarnings(params.neonSignalsResult, "Neon signal store"),
    },
    {
      key: "legacy-notion-signals",
      label: "Legacy Notion signals",
      category: "Optional archive",
      status: resolveChannelState({
        enabled: params.notionSignalsResult.enabled,
        error: params.notionSignalsResult.error,
        count: notionSignals.length,
        lastSyncAt: latestNotionSignal,
      }),
      description: "Optional archive of the old n8n signal database, disabled unless explicitly enabled.",
      detail: params.notionSignalsResult.enabled
        ? `${params.notionSignalsResult.totalCount} legacy Notion records fetched for dashboard aggregation.`
        : "Set ENABLE_LEGACY_NOTION_SIGNALS=true to include archived Notion signal rows.",
      recordCount: params.notionSignalsResult.totalCount,
      readOnly: true,
      lastSyncAt: latestNotionSignal,
      lastSyncLabel: formatLongTimestamp(latestNotionSignal),
      warnings: buildLoaderWarnings(params.notionSignalsResult, "Legacy Notion signals"),
    },
    {
      key: "x-post",
      label: "X_Post bot",
      category: "Producer",
      status: resolveProducerState({
        lastSyncAt: latestWorkflowRun ?? latestXSignal,
        hasSignals: params.mergedSignals.some((signal) => signal.sourceSystem === "x_post"),
        hasError: Boolean(
          workflowRuns[0] && workflowRuns[0].sourceSystem === "x_post" && workflowRuns[0].status !== "success"
        ),
      }),
      description: "Python research bot mirroring X and Reddit findings into Neon without replacing SQLite.",
      detail: `${params.mergedSignals.filter((signal) => signal.sourceSystem === "x_post").length} X_Post records available in the dashboard.`,
      recordCount: params.mergedSignals.filter((signal) => signal.sourceSystem === "x_post").length,
      readOnly: true,
      lastSyncAt: latestWorkflowRun ?? latestXSignal,
      lastSyncLabel: formatLongTimestamp(latestWorkflowRun ?? latestXSignal),
      warnings: workflowRuns[0] && workflowRuns[0].sourceSystem === "x_post" && workflowRuns[0].status !== "success"
        ? [`Latest X_Post workflow run finished with status ${workflowRuns[0].status}.`]
        : [],
    },
    {
      key: "reddit-monitor",
      label: "Reddit monitor",
      category: "Producer",
      status: resolveProducerState({
        lastSyncAt: latestRedditSignal,
        hasSignals: params.mergedSignals.some((signal) => signal.sourceSystem === "reddit_monitor"),
        hasError: false,
      }),
      description: "Standalone Reddit monitoring remains owned by the Python side and arrives through Neon.",
      detail: `${params.mergedSignals.filter((signal) => signal.sourceSystem === "reddit_monitor").length} Reddit monitor records available in Neon.`,
      recordCount: params.mergedSignals.filter((signal) => signal.sourceSystem === "reddit_monitor").length,
      readOnly: true,
      lastSyncAt: latestRedditSignal,
      lastSyncLabel: formatLongTimestamp(latestRedditSignal),
      warnings: [],
    },
    {
      key: "n8n",
      label: "n8n collector",
      category: "Producer",
      status: resolveProducerState({
        lastSyncAt: latestN8nSignal,
        hasSignals: params.mergedSignals.some((signal) => signal.sourceSystem === "n8n"),
        hasError: Boolean(params.neonSignalsResult.error),
      }),
      description: "Collector workflow writes HN and Product Hunt signals into Neon; alerting and summaries read from there.",
      detail: `${params.mergedSignals.filter((signal) => signal.sourceSystem === "n8n").length} n8n records are visible in the dashboard.`,
      recordCount: params.mergedSignals.filter((signal) => signal.sourceSystem === "n8n").length,
      readOnly: true,
      lastSyncAt: latestN8nSignal,
      lastSyncLabel: formatLongTimestamp(latestN8nSignal),
      warnings: [],
    },
    {
      key: "notion-weekly",
      label: "Weekly reports DB",
      category: "Reporting",
      status: resolveChannelState({
        enabled: params.weeklyReportsResult.enabled,
        error: params.weeklyReportsResult.error,
        count: params.weeklyReportsResult.items.length,
        lastSyncAt: params.weeklyReportsResult.items[0]?.createdAt ?? null,
      }),
      description: "Optional weekly summary database from the n8n reporting workflow.",
      detail: `${params.weeklyReportsResult.totalCount} weekly reports available.`,
      recordCount: params.weeklyReportsResult.totalCount,
      readOnly: true,
      lastSyncAt: params.weeklyReportsResult.items[0]?.createdAt ?? null,
      lastSyncLabel: formatLongTimestamp(params.weeklyReportsResult.items[0]?.createdAt ?? null),
      warnings: buildLoaderWarnings(params.weeklyReportsResult, "Weekly reports DB"),
    },
  ];
}

function mapNeonRowToSignal(row: NeonSignalRow): UnifiedSignal | null {
  const source = normalizeSource(row.source);
  if (!source) {
    return null;
  }

  const occurredAt = row.occurred_at ?? new Date();
  const score = scoreToUiScale(source, row.score, row.boosted_score);
  const keyword = row.matched_keyword ?? "";
  const combinedText = `${row.title} ${row.body ?? ""}`.trim();
  const tool = inferTool(row.tool_mentioned, keyword, combinedText);
  const sourceSystem = normalizeSourceSystem(row.source_system);
  const workflow = String(row.workflow || "").trim() || "unknown-workflow";
  const urgency = row.urgency
    ? normalizeUrgency(row.urgency)
    : inferUrgency({
        source,
        score,
        priority: row.priority,
        hotLead: row.hot_lead,
      });

  return {
    id: row.dedupe_key,
    source,
    sourceSystem,
    sourceSystemLabel: formatSourceSystem(sourceSystem),
    workflow,
    workflowLabel: formatWorkflow(workflow),
    origins: ["neon"],
    originLabel: "Neon",
    title: row.title.trim() || "Untitled signal",
    subtitle: buildSubtitle({
      source,
      author: row.author,
      subreddit: row.subreddit,
      occurredAt,
    }),
    score,
    rawScore: Number(row.boosted_score ?? row.score ?? 0),
    intent: row.intent
      ? normalizeIntent(row.intent)
      : inferIntent({
          source,
          keyword,
          priority: row.priority,
          text: combinedText,
        }),
    intentColor: intentColor(
      row.intent
        ? normalizeIntent(row.intent)
        : inferIntent({
            source,
            keyword,
            priority: row.priority,
            text: combinedText,
          })
    ),
    urgency,
    priority: normalizePriority(row.priority),
    tool,
    date: formatShortDate(occurredAt),
    painPoint: row.pain_point ?? `Matched keyword: ${keyword || "research signal"}`,
    elvanAngle:
      row.elvan_angle ??
      (row.draft_reply
        ? "Use the suggested response as a conversation starter."
        : "Review this signal in Telegram and decide whether to engage."),
    reply: row.draft_reply ?? "",
    alerted: Boolean(row.alerted),
    hotLead: Boolean(row.hot_lead) || normalizePriority(row.priority) === "hot",
    occurredAt,
    lastSeenAt: occurredAt,
    url: row.url ?? "",
    author: row.author,
    subreddit: row.subreddit,
    matchedKeyword: row.matched_keyword,
    stats: {
      likes: row.likes,
      replies: row.replies,
      reposts: row.reposts,
      comments: row.comments_count,
      upvotes: row.upvotes,
    },
    metadata: row.metadata ?? {},
  };
}

function mapNotionPageToSignal(page: Record<string, unknown>): UnifiedSignal | null {
  const props = (page.properties ?? {}) as Record<string, NotionProperty>;
  const source = normalizeSource(readNotionSelect(props["Source"]));
  if (!source) {
    return null;
  }

  const occurredAt = parseDateValue(readNotionDate(props["Created At"])) ?? new Date();
  const rawScore = readNotionNumber(props["Boosted Score"]) ?? 0;
  const score = clampScore(rawScore);
  const title = readNotionTitle(props["Title"]) || "Untitled signal";
  const painPoint = readNotionRichText(props["Pain Point"]) || "No pain point captured";
  const elvanAngle = readNotionRichText(props["Elvan Angle"]) || "No angle captured";
  const reply = readNotionRichText(props["Draft Reply"]) || "";
  const tool = inferTool(
    readNotionRichText(props["Tool Mentioned"]),
    "",
    `${title} ${painPoint}`
  );
  const intent = normalizeIntent(readNotionSelect(props["Intent"]));
  const urgency = normalizeUrgency(readNotionSelect(props["Urgency"]));
  const alerted = Boolean(readNotionCheckbox(props["Alerted"]));
  const priority = score >= 7 ? "hot" : score >= 5 ? "medium" : "low";

  return {
    id: String(page.id ?? title),
    source,
    sourceSystem: "n8n",
    sourceSystemLabel: "n8n",
    workflow: "notion-primary",
    workflowLabel: "Notion primary DB",
    origins: ["notion"],
    originLabel: "Notion",
    title,
    subtitle: buildSubtitle({
      source,
      author: null,
      subreddit: readNotionRichText(props["Subreddit"]),
      occurredAt,
    }),
    score,
    rawScore,
    intent,
    intentColor: intentColor(intent),
    urgency,
    priority,
    tool,
    date: formatShortDate(occurredAt),
    painPoint,
    elvanAngle,
    reply,
    alerted,
    hotLead: score >= 7,
    occurredAt,
    lastSeenAt: occurredAt,
    url: readNotionUrl(props["URL"]) || "",
    author: null,
    subreddit: readNotionRichText(props["Subreddit"]) || null,
    matchedKeyword: null,
    stats: {
      likes: null,
      replies: null,
      reposts: null,
      comments: null,
      upvotes: null,
    },
    metadata: {},
  };
}

function mapWeeklyReport(page: Record<string, unknown>): WeeklyReport | null {
  const props = (page.properties ?? {}) as Record<string, NotionProperty>;
  const createdAt =
    parseDateValue(readNotionDate(props["Created At"])) ??
    parseDateValue(readNotionDate(props["Date Range"])) ??
    parseDateValue(String(page.created_time ?? ""));
  const title = readNotionTitle(props["Title"]);

  if (!createdAt || !title) {
    return null;
  }

  const summary =
    readNotionRichText(props["Summary"]) ||
    readNotionRichText(props["Pain Point"]) ||
    "No narrative summary saved.";
  const topCompetitor = readNotionRichText(props["Top Competitor"]);
  const totalSignals = readNotionNumber(props["Total Signals"]);
  const redditCount = readNotionNumber(props["Reddit Count"]);
  const hnCount = readNotionNumber(props["HN Count"]);
  const phCount = readNotionNumber(props["PH Count"]);
  const angleParts = [
    topCompetitor ? `Top competitor: ${topCompetitor}` : null,
    totalSignals !== null ? `Total signals: ${totalSignals}` : null,
    redditCount !== null ? `Reddit: ${redditCount}` : null,
    hnCount !== null ? `HN: ${hnCount}` : null,
    phCount !== null ? `PH: ${phCount}` : null,
  ].filter((value): value is string => Boolean(value));

  return {
    id: String(page.id ?? title),
    title,
    createdAt,
    createdAtLabel: formatLongTimestamp(createdAt),
    summary,
    angle: angleParts.join(" · ") || "No weekly rollup metrics saved.",
    score: totalSignals,
  };
}

function mapWorkflowRun(row: WorkflowRunRow): WorkflowRun {
  const startedAt = new Date(row.started_at);
  const finishedAt = row.finished_at ? new Date(row.finished_at) : null;

  return {
    id: String(row.id),
    sourceSystem: normalizeSourceSystem(row.source_system),
    workflow: row.workflow,
    status: String(row.status || "unknown"),
    startedAt,
    finishedAt,
    durationLabel: formatDuration(startedAt, finishedAt),
    lastActivityLabel: formatLongTimestamp(finishedAt ?? startedAt),
    postsDiscovered: Number(row.posts_discovered ?? 0),
    draftsGenerated: Number(row.drafts_generated ?? 0),
    redditLeads: Number(row.reddit_leads ?? 0),
    queueSent: row.queue_sent,
    digestSent: row.digest_sent,
    hotLeadAlertsSent: Number(row.hot_lead_alerts_sent ?? 0),
    stopReason: row.stop_reason,
    errors: row.errors,
  };
}

function dedupeSignals(signals: UnifiedSignal[]): UnifiedSignal[] {
  const deduped = new Map<string, UnifiedSignal>();

  for (const signal of signals) {
    const key = signal.url
      ? `${signal.source}|${normalizeUrlForKey(signal.url)}`
      : `${signal.source}|${signal.title.trim().toLowerCase()}|${signal.occurredAt.toISOString().slice(0, 10)}`;
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, signal);
      continue;
    }

    deduped.set(key, mergeSignals(existing, signal));
  }

  return Array.from(deduped.values());
}

function mergeSignals(left: UnifiedSignal, right: UnifiedSignal): UnifiedSignal {
  const primary =
    signalCompletenessScore(right) > signalCompletenessScore(left) ? right : left;
  const secondary = primary === left ? right : left;
  const intent = chooseIntent(primary.intent, secondary.intent);
  const urgency = chooseUrgency(primary.urgency, secondary.urgency);
  const occurredAt =
    left.occurredAt.getTime() <= right.occurredAt.getTime() ? left.occurredAt : right.occurredAt;
  const lastSeenAt =
    left.lastSeenAt.getTime() >= right.lastSeenAt.getTime() ? left.lastSeenAt : right.lastSeenAt;
  const source = primary.source;
  const author = primary.author ?? secondary.author ?? null;
  const subreddit = primary.subreddit ?? secondary.subreddit ?? null;

  return {
    ...primary,
    source,
    sourceSystem:
      primary.sourceSystem !== "n8n" || secondary.sourceSystem === "n8n"
        ? primary.sourceSystem
        : secondary.sourceSystem,
    sourceSystemLabel: formatSourceSystem(
      primary.sourceSystem !== "n8n" || secondary.sourceSystem === "n8n"
        ? primary.sourceSystem
        : secondary.sourceSystem
    ),
    workflow: primary.workflow || secondary.workflow,
    workflowLabel: formatWorkflow(primary.workflow || secondary.workflow),
    origins: uniqueOrigins([...left.origins, ...right.origins]),
    originLabel: formatOriginLabel(uniqueOrigins([...left.origins, ...right.origins])),
    title: chooseLongerText(primary.title, secondary.title) || primary.title,
    subtitle: buildSubtitle({
      source,
      author,
      subreddit,
      occurredAt,
    }),
    score: Math.max(left.score, right.score),
    rawScore: Math.max(left.rawScore, right.rawScore),
    intent,
    intentColor: intentColor(intent),
    urgency,
    priority: choosePriority(left.priority, right.priority),
    tool: chooseTool(primary.tool, secondary.tool),
    date: formatShortDate(occurredAt),
    painPoint: chooseLongerText(primary.painPoint, secondary.painPoint) || primary.painPoint,
    elvanAngle:
      chooseLongerText(primary.elvanAngle, secondary.elvanAngle) || primary.elvanAngle,
    reply: chooseLongerText(primary.reply, secondary.reply) || primary.reply,
    alerted: left.alerted || right.alerted,
    hotLead: left.hotLead || right.hotLead,
    occurredAt,
    lastSeenAt,
    url: primary.url || secondary.url,
    author,
    subreddit,
    matchedKeyword: primary.matchedKeyword || secondary.matchedKeyword,
    stats: {
      likes: maxNullableNumber(left.stats.likes, right.stats.likes),
      replies: maxNullableNumber(left.stats.replies, right.stats.replies),
      reposts: maxNullableNumber(left.stats.reposts, right.stats.reposts),
      comments: maxNullableNumber(left.stats.comments, right.stats.comments),
      upvotes: maxNullableNumber(left.stats.upvotes, right.stats.upvotes),
    },
    metadata: {
      ...secondary.metadata,
      ...primary.metadata,
    },
  };
}

function buildFallbackDashboardData(params: {
  neonSignalsResult: LoaderResult<UnifiedSignal>;
  notionSignalsResult: LoaderResult<UnifiedSignal>;
  workflowRunsResult: LoaderResult<WorkflowRun>;
  weeklyReportsResult: LoaderResult<WeeklyReport>;
}): DashboardData {
  const fallbackSignals = mockSignals.map((signal, index) => {
    const occurredAt = new Date();
    return {
      id: `mock-${index}`,
      source: signal.src,
      sourceSystem: "mock",
      sourceSystemLabel: "Fallback",
      workflow: "fallback",
      workflowLabel: "Fallback dataset",
      origins: [],
      originLabel: "Fallback",
      title: signal.title,
      subtitle: signal.sub,
      score: signal.score,
      rawScore: signal.score,
      intent: signal.intent,
      intentColor: signal.intentColor,
      urgency: signal.urgency,
      priority: signal.score >= 7 ? "hot" : signal.score >= 5 ? "medium" : "low",
      tool: signal.tool,
      date: signal.date,
      painPoint: signal.painPoint,
      elvanAngle: signal.elvanAngle,
      reply: signal.reply,
      alerted: false,
      hotLead: signal.score >= 8 || signal.urgency === "high",
      occurredAt,
      lastSeenAt: occurredAt,
      url: "",
      author: null,
      subreddit: null,
      matchedKeyword: null,
      stats: {
        likes: null,
        replies: null,
        reposts: null,
        comments: null,
        upvotes: null,
      },
      metadata: {},
    } satisfies UnifiedSignal;
  });

  const coverage: CoverageSummary = {
    totalSignals: fallbackSignals.length,
    rawSignals: fallbackSignals.length,
    mirroredSignals: 0,
    neonOnlySignals: 0,
    notionOnlySignals: 0,
    workflowRuns: 0,
    weeklyReports: 0,
  };

  const now = new Date();
  const warnings = [
    "Live dashboard data is unavailable, so mock fallback content is being shown.",
  ];

  if (params.neonSignalsResult.error) {
    warnings.push("Neon connectivity failed.");
  }
  if (params.notionSignalsResult.error) {
    warnings.push("Notion connectivity failed.");
  }

  return {
    mode: "fallback",
    metrics: buildMetrics(fallbackSignals, coverage),
    statusSummary: {
      mode: "fallback",
      label: "Fallback mode",
      description: "The dashboard is rendering its fallback dataset because no live aggregated signals were available.",
      lastSignalAt: now,
      lastSignalLabel: formatLongTimestamp(now),
      lastWorkflowAt: null,
      lastWorkflowLabel: "No live workflow telemetry",
      warnings,
    },
    navigationCounts: {
      hotLeads: mockLeads.length,
      signals: fallbackSignals.length,
      alerts: mockLeads.filter((lead) => !lead.alerted).length,
      integrations: 4,
    },
    coverage,
    trendData: buildTrendData(fallbackSignals),
    sourceBreakdown: buildSourceBreakdown(fallbackSignals),
    sourceSummaries: buildSourceSummaries(fallbackSignals),
    systemSummaries: [],
    overviewSignals: fallbackSignals.slice(0, 8),
    signals: fallbackSignals,
    hotLeadSignals: fallbackSignals.filter(isHotLeadSignal),
    alertedSignals: [],
    pendingAlertSignals: fallbackSignals.filter(isHotLeadSignal),
    draftGapSignals: [],
    competitors: mockCompetitors,
    overviewCompetitors: mockOverviewCompetitors,
    crossSignals: mockCrossSignals,
    channelStatuses: buildChannelStatuses({
      neonSignalsResult: params.neonSignalsResult,
      notionSignalsResult: params.notionSignalsResult,
      workflowRunsResult: params.workflowRunsResult,
      weeklyReportsResult: params.weeklyReportsResult,
      mergedSignals: [],
    }),
    workflowRuns: [],
    weeklyReports: [],
  };
}

function resolveChannelState(params: {
  enabled: boolean;
  error: string | null;
  count: number;
  lastSyncAt: Date | null;
}): ChannelState {
  if (!params.enabled) {
    return "offline";
  }
  if (params.error) {
    return "offline";
  }
  if (!params.count) {
    return "empty";
  }
  if (isStale(params.lastSyncAt, 48)) {
    return "degraded";
  }
  return "healthy";
}

function resolveProducerState(params: {
  lastSyncAt: Date | null;
  hasSignals: boolean;
  hasError: boolean;
}): ChannelState {
  if (!params.hasSignals && !params.lastSyncAt) {
    return "empty";
  }
  if (params.hasError) {
    return "degraded";
  }
  if (isStale(params.lastSyncAt, 48)) {
    return "degraded";
  }
  return "healthy";
}

function buildLoaderWarnings<T>(result: LoaderResult<T>, label: string): string[] {
  const warnings: string[] = [];
  if (!result.enabled) {
    warnings.push(`${label} is not configured.`);
  }
  if (result.error) {
    warnings.push(result.error);
  }
  if (result.truncated) {
    warnings.push(`${label} history exceeded the dashboard safety window and may be truncated.`);
  }
  return warnings;
}

function isHotLeadSignal(signal: UnifiedSignal): boolean {
  return signal.hotLead || signal.urgency === "high" || signal.score >= 8;
}

function signalCompletenessScore(signal: UnifiedSignal): number {
  let score = 0;
  if (signal.reply.trim()) score += 2;
  if (signal.painPoint.trim()) score += 2;
  if (signal.elvanAngle.trim()) score += 1;
  if (signal.tool && signal.tool !== "-") score += 1;
  if (signal.url) score += 1;
  if (signal.origins.includes("neon")) score += 1;
  if (signal.origins.includes("notion")) score += 1;
  if (signal.alerted) score += 1;
  return score;
}

function normalizeUrlForKey(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }
    const search = parsed.searchParams.toString();
    const normalizedPath = parsed.pathname.replace(/\/+$/, "") || "/";
    return `${parsed.origin.toLowerCase()}${normalizedPath.toLowerCase()}${search ? `?${search}` : ""}`;
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, "");
  }
}

function normalizeSource(value: string | null | undefined): SignalSource | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "x" || normalized === "twitter") {
    return "x";
  }
  if (normalized === "reddit") {
    return "reddit";
  }
  if (normalized === "hackernews" || normalized === "hn") {
    return "hn";
  }
  if (normalized === "producthunt" || normalized === "ph" || normalized === "product hunt") {
    return "ph";
  }
  return null;
}

function normalizeSourceSystem(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized || "unknown";
}

function formatSourceSystem(value: string): string {
  const normalized = normalizeSourceSystem(value);
  if (normalized === "x_post") {
    return "X_Post";
  }
  if (normalized === "reddit_monitor") {
    return "Reddit monitor";
  }
  if (normalized === "n8n") {
    return "n8n";
  }
  if (normalized === "mock") {
    return "Fallback";
  }
  return normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatWorkflow(value: string): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return "Unknown workflow";
  }
  if (normalized === "build-queue") {
    return "Build queue";
  }
  if (normalized === "workflow1-hn-producthunt") {
    return "HN + Product Hunt collector";
  }
  if (normalized === "notion-primary") {
    return "Notion primary DB";
  }
  return normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeIntent(value: string | null | undefined): Intent {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "buying" || normalized === "direct") {
    return "Buying";
  }
  if (normalized === "comparing") {
    return "Comparing";
  }
  if (normalized === "venting" || normalized === "pain") {
    return "Venting";
  }
  return "Learning";
}

function normalizeUrgency(value: string | null | undefined): Urgency {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "high") {
    return "high";
  }
  if (normalized === "medium" || normalized === "mid" || normalized === "med") {
    return "mid";
  }
  return "low";
}

function normalizePriority(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized || null;
}

function inferIntent(params: {
  source: SignalSource;
  keyword: string;
  priority: string | null;
  text: string;
}): Intent {
  if (params.source === "reddit") {
    return normalizeIntent(params.priority === "high" ? "buying" : params.priority);
  }

  const text = `${params.keyword} ${params.text}`.toLowerCase();
  if (text.includes("looking for") || text.includes("need ") || text.includes("best ")) {
    return "Buying";
  }
  if (text.includes("alternative") || text.includes("replace") || text.includes("vs ")) {
    return "Comparing";
  }
  return "Learning";
}

function inferUrgency(params: {
  source: SignalSource;
  score: number;
  priority: string | null;
  hotLead: boolean;
}): Urgency {
  if (params.hotLead || params.priority === "hot" || params.priority === "high" || params.score >= 8) {
    return "high";
  }
  if (params.priority === "medium" || params.score >= 5) {
    return "mid";
  }
  return "low";
}

function inferTool(explicitTool: string | null | undefined, keyword: string, text: string): string {
  const tool = String(explicitTool ?? "").trim();
  if (tool && tool !== "-" && tool !== "—") {
    return tool;
  }

  const lowered = `${keyword} ${text}`.toLowerCase();
  for (const name of COMPETITOR_NAMES) {
    if (lowered.includes(name.toLowerCase())) {
      return name;
    }
  }

  return keyword || "-";
}

function chooseTool(primary: string, secondary: string): string {
  if (primary && primary !== "-") {
    return primary;
  }
  if (secondary && secondary !== "-") {
    return secondary;
  }
  return primary || secondary || "-";
}

function chooseIntent(primary: Intent, secondary: Intent): Intent {
  if (primary !== "Learning") {
    return primary;
  }
  return secondary;
}

function chooseUrgency(primary: Urgency, secondary: Urgency): Urgency {
  const order: Record<Urgency, number> = {
    high: 3,
    mid: 2,
    low: 1,
  };
  return order[primary] >= order[secondary] ? primary : secondary;
}

function choosePriority(primary: string | null, secondary: string | null): string | null {
  const order = new Map<string, number>([
    ["hot", 3],
    ["high", 3],
    ["medium", 2],
    ["mid", 2],
    ["low", 1],
  ]);
  const left = order.get(primary ?? "") ?? 0;
  const right = order.get(secondary ?? "") ?? 0;
  return left >= right ? primary : secondary;
}

function chooseLongerText(primary: string, secondary: string): string {
  return primary.trim().length >= secondary.trim().length ? primary : secondary;
}

function maxNullableNumber(left: number | null, right: number | null): number | null {
  if (left === null) {
    return right;
  }
  if (right === null) {
    return left;
  }
  return Math.max(left, right);
}

function uniqueOrigins(origins: DataOrigin[]): DataOrigin[] {
  return Array.from(new Set(origins));
}

function formatOriginLabel(origins: DataOrigin[]): string {
  if (!origins.length) {
    return "Fallback";
  }
  if (origins.length === 1) {
    return origins[0] === "neon" ? "Neon" : "Notion";
  }
  return "Neon + Notion";
}

function buildSubtitle(params: {
  source: SignalSource;
  author: string | null;
  subreddit: string | null;
  occurredAt: Date;
}): string {
  const dateText = formatCompactTimestamp(params.occurredAt);
  if (params.source === "x") {
    return `X · ${params.author ?? "@unknown"} · ${dateText}`;
  }
  if (params.source === "reddit") {
    const subreddit = params.subreddit ? `r/${params.subreddit}` : "Reddit";
    const author = params.author ? `u/${params.author.replace(/^u\//, "")}` : "u/unknown";
    return `${subreddit} · ${author} · ${dateText}`;
  }
  if (params.source === "hn") {
    return `Hacker News · ${dateText}`;
  }
  return `Product Hunt · ${dateText}`;
}

function sourceLabel(source: SignalSource): string {
  return {
    x: "X",
    reddit: "Reddit",
    hn: "Hacker News",
    ph: "Product Hunt",
  }[source];
}

function intentColor(intent: Intent): string {
  return {
    Buying: "#34d399",
    Comparing: "#60a5fa",
    Venting: "#f59e0b",
    Learning: "#94a3b8",
  }[intent];
}

function scoreToUiScale(
  source: SignalSource,
  rawScore: number | null,
  boostedScore: number | null
): number {
  if (boostedScore !== null && boostedScore !== undefined) {
    return clampScore(boostedScore);
  }
  if (rawScore === null || rawScore === undefined) {
    return 0;
  }
  if (source === "reddit") {
    return clampScore(rawScore / 10);
  }
  if (source === "x") {
    return clampScore(rawScore / 5);
  }
  return clampScore(rawScore);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: DASHBOARD_TIMEZONE,
  }).format(date);
}

function formatCompactTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DASHBOARD_TIMEZONE,
  }).format(date);
}

function formatLongTimestamp(date: Date | null): string {
  if (!date) {
    return "No data yet";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DASHBOARD_TIMEZONE,
  }).format(date);
}

function formatDuration(startedAt: Date, finishedAt: Date | null): string {
  if (!finishedAt) {
    return "In progress";
  }
  const ms = Math.max(0, finishedAt.getTime() - startedAt.getTime());
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (!remainingSeconds) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function parseDateValue(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isStale(date: Date | null, thresholdHours: number): boolean {
  if (!date) {
    return true;
  }
  return Date.now() - date.getTime() > thresholdHours * 60 * 60 * 1000;
}

function readNotionTitle(property: NotionProperty | undefined): string {
  const title = property?.title ?? [];
  return title.map((item) => item.plain_text ?? "").join("").trim();
}

function readNotionRichText(property: NotionProperty | undefined): string {
  const richText = property?.rich_text ?? [];
  return richText.map((item) => item.plain_text ?? "").join("").trim();
}

function readNotionSelect(property: NotionProperty | undefined): string | null {
  return property?.select?.name?.trim() ?? null;
}

function readNotionNumber(property: NotionProperty | undefined): number | null {
  return property?.number ?? null;
}

function readNotionCheckbox(property: NotionProperty | undefined): boolean {
  return Boolean(property?.checkbox);
}

function readNotionUrl(property: NotionProperty | undefined): string | null {
  return property?.url?.trim() ?? null;
}

function readNotionDate(property: NotionProperty | undefined): string | null {
  return property?.date?.start?.trim() ?? null;
}

function disabledLoaderResult<T>(): LoaderResult<T> {
  return {
    items: [],
    enabled: false,
    error: null,
    truncated: false,
    totalCount: 0,
  };
}
