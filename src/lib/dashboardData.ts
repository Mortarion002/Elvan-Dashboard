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
  type Lead,
  type Signal,
  type SignalSource,
  type Urgency,
} from "@/data/mockData";

type UnifiedSignal = {
  id: string;
  source: SignalSource;
  title: string;
  subtitle: string;
  score: number;
  rawScore: number;
  intent: Intent;
  intentColor: string;
  urgency: Urgency;
  tool: string;
  date: string;
  painPoint: string;
  elvanAngle: string;
  reply: string;
  alerted: boolean;
  occurredAt: Date;
  url: string;
};

type SourceBreakdown = {
  label: string;
  pct: number;
  color: string;
};

type OverviewMetrics = {
  signalsThisWeek: number;
  hotLeads: number;
  suggestedReplies: number;
  activeSources: number;
};

type TrendDatum = {
  day: string;
  height: string;
  active?: boolean;
};

export type DashboardData = {
  metrics: OverviewMetrics;
  trendData: TrendDatum[];
  sourceBreakdown: SourceBreakdown[];
  signals: Signal[];
  leads: Lead[];
  competitors: Competitor[];
  overviewCompetitors: Competitor[];
  crossSignals: CrossSignal[];
};

const NOTION_VERSION = "2022-06-28";
const SOURCE_COLORS: Record<string, string> = {
  x: "#111827",
  reddit: "#22c55e",
  hn: "#16a34a",
  ph: "#15803d",
};
const COMPETITOR_COLORS = [
  "#ec4899",
  "#6366f1",
  "#00b5e2",
  "#f97316",
  "#7c3aed",
  "#f43f5e",
  "#22c55e",
  "#14b8a6",
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
];

function getNeonSql() {
  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [neonSignals, notionSignals] = await Promise.all([
    loadNeonSignals(),
    loadNotionSignals(),
  ]);

  const liveSignals = dedupeSignals([...neonSignals, ...notionSignals])
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  if (!liveSignals.length) {
    return buildFallbackDashboardData();
  }

  return buildDashboardData(liveSignals);
}

async function loadNeonSignals(): Promise<UnifiedSignal[]> {
  const sql = getNeonSql();
  if (!sql) {
    return [];
  }

  try {
    const rows = await sql`
      SELECT
        dedupe_key,
        source,
        title,
        body,
        url,
        author,
        subreddit,
        matched_keyword,
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
        alerted,
        hot_lead,
        metadata
      FROM signal_events
      WHERE source IN ('x', 'reddit', 'hn', 'ph')
      ORDER BY COALESCE(occurred_at, last_updated_at) DESC
      LIMIT 100
    ` as Array<{
      dedupe_key: string;
      source: string;
      title: string;
      body: string | null;
      url: string | null;
      author: string | null;
      subreddit: string | null;
      matched_keyword: string | null;
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
      alerted: boolean;
      hot_lead: boolean;
      metadata: Record<string, unknown> | null;
    }>;

    return rows
      .map((row) => mapNeonRowToSignal(row))
      .filter((row): row is UnifiedSignal => row !== null);
  } catch (error) {
    console.error("Failed to load Neon signals for dashboard", error);
    return [];
  }
}

async function loadNotionSignals(): Promise<UnifiedSignal[]> {
  const notionToken = process.env.NOTION_API_KEY;
  const notionDbId = process.env.NOTION_DB_ID;
  if (!notionToken || !notionDbId) {
    return [];
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${notionDbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({
        page_size: 100,
        sorts: [{ property: "Created At", direction: "descending" }],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Notion query failed with HTTP ${response.status}`);
    }

    const payload = await response.json() as { results?: Array<Record<string, unknown>> };
    const results = Array.isArray(payload.results) ? payload.results : [];
    return results
      .map((page) => mapNotionPageToSignal(page))
      .filter((row): row is UnifiedSignal => row !== null);
  } catch (error) {
    console.error("Failed to load Notion signals for dashboard", error);
    return [];
  }
}

function dedupeSignals(signals: UnifiedSignal[]): UnifiedSignal[] {
  const deduped = new Map<string, UnifiedSignal>();

  for (const signal of signals) {
    const key = signal.url
      ? `${signal.source}|${normalizeUrlForKey(signal.url)}`
      : `${signal.source}|${signal.title.trim().toLowerCase()}|${signal.occurredAt.toISOString().slice(0, 10)}`;
    const existing = deduped.get(key);

    if (!existing || signalCompletenessScore(signal) > signalCompletenessScore(existing)) {
      deduped.set(key, signal);
    }
  }

  return Array.from(deduped.values());
}

function signalCompletenessScore(signal: UnifiedSignal): number {
  let score = 0;
  if (signal.reply) score += 2;
  if (signal.painPoint) score += 1;
  if (signal.elvanAngle) score += 1;
  if (signal.tool) score += 1;
  if (signal.alerted) score += 1;
  if (signal.url) score += 1;
  return score;
}

function normalizeUrlForKey(url: string): string {
  return url.trim().toLowerCase().replace(/\/+$/, "");
}

function mapNeonRowToSignal(row: {
  dedupe_key: string;
  source: string;
  title: string;
  body: string | null;
  url: string | null;
  author: string | null;
  subreddit: string | null;
  matched_keyword: string | null;
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
  alerted: boolean;
  hot_lead: boolean;
  metadata: Record<string, unknown> | null;
}): UnifiedSignal | null {
  const source = normalizeSource(row.source);
  if (!source) {
    return null;
  }

  const occurredAt = row.occurred_at ?? new Date();
  const uiScore = scoreToUiScale(source, row.score, row.boosted_score);
  const keyword = row.matched_keyword ?? "";
  const combinedText = `${row.title} ${row.body ?? ""}`.trim();
  const intent = inferIntent({
    source,
    keyword,
    priority: row.priority,
    text: combinedText,
  });
  const tool = inferTool(row.tool_mentioned, keyword, combinedText);

  return {
    id: row.dedupe_key,
    source,
    title: row.title,
    subtitle: buildSubtitle({
      source,
      author: row.author,
      subreddit: row.subreddit,
      occurredAt,
    }),
    score: uiScore,
    rawScore: Number(row.boosted_score ?? row.score ?? 0),
    intent,
    intentColor: intentColor(intent),
    urgency: inferUrgency({
      source,
      score: uiScore,
      priority: row.priority,
      hotLead: row.hot_lead,
    }),
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
    occurredAt,
    url: row.url ?? "",
  };
}

function mapNotionPageToSignal(page: Record<string, unknown>): UnifiedSignal | null {
  const props = (page.properties ?? {}) as Record<string, NotionProperty>;
  const source = normalizeSource(readNotionSelect(props["Source"]));
  if (!source) {
    return null;
  }

  const occurredAt = parseDateValue(readNotionDate(props["Created At"])) ?? new Date();
  const score = readNotionNumber(props["Boosted Score"]);
  const title = readNotionTitle(props["Title"]);
  const tool = inferTool(
    readNotionRichText(props["Tool Mentioned"]),
    "",
    `${title} ${readNotionRichText(props["Pain Point"])}`
  );
  const intent = normalizeIntent(readNotionSelect(props["Intent"]));
  const urgency = normalizeUrgency(readNotionSelect(props["Urgency"]));

  return {
    id: String(page.id ?? title),
    source,
    title,
    subtitle: buildSubtitle({
      source,
      author: null,
      subreddit: readNotionRichText(props["Subreddit"]),
      occurredAt,
    }),
    score: clampScore(score ?? 0),
    rawScore: Number(score ?? 0),
    intent,
    intentColor: intentColor(intent),
    urgency,
    tool,
    date: formatShortDate(occurredAt),
    painPoint: readNotionRichText(props["Pain Point"]) || "No pain point captured",
    elvanAngle: readNotionRichText(props["Elvan Angle"]) || "No angle captured",
    reply: readNotionRichText(props["Draft Reply"]) || "",
    alerted: Boolean(readNotionCheckbox(props["Alerted"])),
    occurredAt,
    url: readNotionUrl(props["URL"]) || "",
  };
}

function buildDashboardData(liveSignals: UnifiedSignal[]): DashboardData {
  const latestSignals = liveSignals.slice(0, 8).map(toSignalCard);
  const hotLeads = liveSignals
    .filter((signal) => signal.score >= 8 || signal.urgency === "high")
    .slice(0, 6)
    .map(toLeadCard);
  const competitors = buildCompetitors(liveSignals);
  const metrics = buildMetrics(liveSignals);
  const trendData = buildTrendData(liveSignals);
  const sourceBreakdown = buildSourceBreakdown(liveSignals);

  return {
    metrics,
    trendData,
    sourceBreakdown,
    signals: latestSignals,
    leads: hotLeads.length ? hotLeads : mockLeads,
    competitors: competitors.length ? competitors : mockCompetitors,
    overviewCompetitors: competitors.slice(0, 5).length
      ? competitors.slice(0, 5)
      : mockOverviewCompetitors,
    crossSignals: buildCrossSignals(liveSignals, competitors),
  };
}

function buildFallbackDashboardData(): DashboardData {
  const fallbackUnified = mockSignals.map((signal, index) => ({
    id: `mock-${index}`,
    source: signal.src,
    title: signal.title,
    subtitle: signal.sub,
    score: signal.score,
    rawScore: signal.score,
    intent: signal.intent,
    intentColor: signal.intentColor,
    urgency: signal.urgency,
    tool: signal.tool,
    date: signal.date,
    painPoint: signal.painPoint,
    elvanAngle: signal.elvanAngle,
    reply: signal.reply,
    alerted: false,
    occurredAt: new Date(),
    url: "",
  }));

  return {
    metrics: buildMetrics(fallbackUnified),
    trendData: buildTrendData(fallbackUnified),
    sourceBreakdown: buildSourceBreakdown(fallbackUnified),
    signals: mockSignals,
    leads: mockLeads,
    competitors: mockCompetitors,
    overviewCompetitors: mockOverviewCompetitors,
    crossSignals: mockCrossSignals,
  };
}

function buildMetrics(signals: UnifiedSignal[]): OverviewMetrics {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const signalsThisWeek = signals.filter((signal) => signal.occurredAt.getTime() >= weekAgo).length;
  return {
    signalsThisWeek,
    hotLeads: signals.filter((signal) => signal.score >= 8 || signal.urgency === "high").length,
    suggestedReplies: signals.filter((signal) => signal.reply.trim().length > 0).length,
    activeSources: new Set(signals.map((signal) => signal.source)).size,
  };
}

function buildTrendData(signals: UnifiedSignal[]): TrendDatum[] {
  const now = new Date();
  const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "short" });
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
    const target = buckets.find((bucket) =>
      isSameDay(bucket.day, signal.occurredAt)
    );
    if (target) {
      target.count += 1;
    }
  }

  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);
  return buckets.map((bucket, index) => ({
    day: bucket.label,
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
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([source, count]) => ({
      label: sourceLabel(source),
      pct: Math.round((count / total) * 100),
      color: SOURCE_COLORS[source],
    }));
}

function buildCompetitors(signals: UnifiedSignal[]): Competitor[] {
  const now = Date.now();
  const currentWindow = now - 7 * 24 * 60 * 60 * 1000;
  const previousWindow = now - 14 * 24 * 60 * 60 * 1000;
  const grouped = new Map<string, { current: number; previous: number; sources: Set<SignalSource> }>();

  for (const signal of signals) {
    if (!signal.tool || signal.tool === "-") {
      continue;
    }

    const entry = grouped.get(signal.tool) ?? {
      current: 0,
      previous: 0,
      sources: new Set<SignalSource>(),
    };
    const timestamp = signal.occurredAt.getTime();
    if (timestamp >= currentWindow) {
      entry.current += 1;
    } else if (timestamp >= previousWindow) {
      entry.previous += 1;
    }
    entry.sources.add(signal.source);
    grouped.set(signal.tool, entry);
  }

  const sorted = Array.from(grouped.entries())
    .sort((a, b) => b[1].current - a[1].current)
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
  const grouped = new Map<string, { sources: Set<SignalSource>; titles: string[]; score: number }>();

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

  return competitors
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
}

function toSignalCard(signal: UnifiedSignal): Signal {
  return {
    title: signal.title,
    sub: signal.subtitle,
    src: signal.source,
    score: signal.score,
    intent: signal.intent,
    intentColor: signal.intentColor,
    urgency: signal.urgency,
    tool: signal.tool,
    date: signal.date,
    painPoint: signal.painPoint,
    elvanAngle: signal.elvanAngle,
    reply: signal.reply,
  };
}

function toLeadCard(signal: UnifiedSignal): Lead {
  return {
    src: signal.source,
    time: signal.date,
    score: signal.score,
    urgency: signal.urgency === "high" ? "high" : "med",
    title: signal.title,
    pain: signal.painPoint,
    tool: signal.tool,
    angle: signal.elvanAngle,
    reply: signal.reply,
    alerted: signal.alerted,
  };
}

function sourceLabel(source: SignalSource): string {
  return {
    x: "X",
    reddit: "Reddit",
    hn: "HackerNews",
    ph: "Product Hunt",
  }[source];
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
  if (params.hotLead || params.priority === "high" || params.score >= 8) {
    return "high";
  }
  if (params.priority === "medium" || params.score >= 5) {
    return "mid";
  }
  return "low";
}

function inferTool(
  explicitTool: string | null | undefined,
  keyword: string,
  text: string,
): string {
  const tool = String(explicitTool ?? "").trim();
  if (tool && tool !== "—") {
    return tool;
  }

  const lowered = `${keyword} ${text}`.toLowerCase();
  for (const name of COMPETITOR_NAMES) {
    if (lowered.includes(name.toLowerCase())) {
      return name;
    }
  }

  return keyword || "—";
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
    const author = params.author ? `u/${params.author}` : "u/unknown";
    return `${subreddit} · ${author} · ${dateText}`;
  }
  if (params.source === "hn") {
    return `news.ycombinator.com · ${dateText}`;
  }
  return `Product Hunt · ${dateText}`;
}

function intentColor(intent: Intent): string {
  return {
    Buying: "#22c55e",
    Comparing: "#16a34a",
    Venting: "#4ade80",
    Learning: "#86efac",
  }[intent];
}

function scoreToUiScale(
  source: SignalSource,
  rawScore: number | null,
  boostedScore: number | null,
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
  }).format(date);
}

function formatCompactTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
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

type NotionProperty = {
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
  select?: { name?: string | null } | null;
  number?: number | null;
  checkbox?: boolean;
  url?: string | null;
  date?: { start?: string | null } | null;
};

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
