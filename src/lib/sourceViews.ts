import type { DashboardData, UnifiedSignal } from "@/lib/dashboardData";
import type { Intent, SignalSource, Urgency } from "@/data/mockData";

export type SourceSlug = "reddit" | "x" | "product-hunt" | "hacker-news";

export type SourceMeta = {
  source: SignalSource;
  slug: SourceSlug;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
};

const ARCHIVED_NEON_KINDS = new Set(["notion_backfill"]);

const ELVAN_RELEVANCE_TERMS = [
  "churn",
  "customer feedback",
  "product feedback",
  "voice of customer",
  "voc",
  "nps",
  "net promoter",
  "customer satisfaction",
  "satisfaction survey",
  "survey tool",
  "survey licensing",
  "response rate",
  "support ticket",
  "support backlog",
  "customer service software",
  "feedback tool",
  "feedback widget",
  "in-app customer feedback",
  "onboarding churn",
  "typeform alternative",
  "qualtrics",
  "medallia",
  "survicate",
  "hotjar",
  "uservoice",
  "intercom alternative",
  "zendesk",
  "delighted alternative",
  "replacing delighted",
];

const IRRELEVANT_TERMS = [
  "magic: the gathering",
  "nft community",
  "gift card",
  "parliamentary",
  "upsc",
  "fish identifier",
  "fishermen",
  "mental health",
  "from a gp",
];

export type SourceInboxRecord = {
  id: string;
  title: string;
  subtitle: string;
  source: SignalSource;
  sourceLabel: string;
  sourceSystemLabel: string;
  workflowLabel: string;
  originLabel: string;
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
  occurredAtIso: string;
  lastSeenAtIso: string;
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
  searchText: string;
};

export type SourcePageView = {
  meta: SourceMeta;
  records: SourceInboxRecord[];
  totals: {
    messages: number;
    hotLeads: number;
    alerted: number;
    draftCoverage: number;
  };
};

export const SOURCE_SECTIONS: SourceMeta[] = [
  {
    source: "reddit",
    slug: "reddit",
    label: "Reddit",
    shortLabel: "R",
    description: "Community posts and discussion threads mirrored from Reddit.",
    accent: "#ff4500",
  },
  {
    source: "x",
    slug: "x",
    label: "X",
    shortLabel: "X",
    description: "Social buying signals and competitor mentions captured from X.",
    accent: "#111111",
  },
  {
    source: "ph",
    slug: "product-hunt",
    label: "Product Hunt",
    shortLabel: "P",
    description: "Launches, comments, and product-market signals from Product Hunt.",
    accent: "#da552f",
  },
  {
    source: "hn",
    slug: "hacker-news",
    label: "Hacker News",
    shortLabel: "H",
    description: "Founder, developer, and technical buyer conversations from Hacker News.",
    accent: "#ff6600",
  },
];

export function getSourceMeta(source: SignalSource): SourceMeta {
  const meta = SOURCE_SECTIONS.find((section) => section.source === source);
  if (!meta) {
    throw new Error(`Unknown source: ${source}`);
  }
  return meta;
}

export function getSourceCounts(data: DashboardData): Record<SignalSource, number> {
  const relevantSignals = getRelevantNeonSignals(data);

  return SOURCE_SECTIONS.reduce(
    (counts, section) => {
      counts[section.source] = relevantSignals.filter(
        (signal) => signal.source === section.source
      ).length;
      return counts;
    },
    { reddit: 0, x: 0, ph: 0, hn: 0 } as Record<SignalSource, number>
  );
}

export function buildSourcePageView(
  data: DashboardData,
  source: SignalSource
): SourcePageView {
  const meta = getSourceMeta(source);
  const sourceRecords = getRelevantNeonSignals(data)
    .filter((signal) => signal.source === source)
    .sort((left, right) => right.lastSeenAt.getTime() - left.lastSeenAt.getTime());
  const records = sourceRecords.map((signal) => serializeSignal(signal, meta));
  const draftCount = records.filter((record) => record.reply.trim()).length;

  return {
    meta,
    records,
    totals: {
      messages: records.length,
      hotLeads: records.filter((record) => record.hotLead || record.urgency === "high" || record.score >= 8).length,
      alerted: records.filter((record) => record.alerted).length,
      draftCoverage: Math.round((draftCount / Math.max(records.length, 1)) * 100),
    },
  };
}

function getRelevantNeonSignals(data: DashboardData): UnifiedSignal[] {
  return data.signals.filter(
    (signal) => signal.origins.includes("neon") && isElvanRelevantSignal(signal)
  );
}

function isElvanRelevantSignal(signal: UnifiedSignal): boolean {
  const metadataKind = String(signal.metadata.kind ?? "").trim().toLowerCase();
  if (ARCHIVED_NEON_KINDS.has(metadataKind)) {
    return false;
  }

  const title = signal.title.toLowerCase();
  const keyword = String(signal.matchedKeyword ?? "").toLowerCase();
  const tool = signal.tool.toLowerCase();
  const relevanceText = `${title} ${keyword} ${tool}`;

  if (IRRELEVANT_TERMS.some((term) => relevanceText.includes(term))) {
    return false;
  }

  return ELVAN_RELEVANCE_TERMS.some((term) => relevanceText.includes(term));
}

function serializeSignal(signal: UnifiedSignal, meta: SourceMeta): SourceInboxRecord {
  const searchParts = [
    signal.title,
    signal.subtitle,
    signal.author,
    signal.subreddit,
    signal.matchedKeyword,
    signal.tool,
    signal.painPoint,
    signal.elvanAngle,
    signal.reply,
    signal.sourceSystemLabel,
    signal.workflowLabel,
    signal.originLabel,
    signal.intent,
    signal.urgency,
  ];

  return {
    id: signal.id,
    title: signal.title,
    subtitle: signal.subtitle,
    source: signal.source,
    sourceLabel: meta.label,
    sourceSystemLabel: signal.sourceSystemLabel,
    workflowLabel: signal.workflowLabel,
    originLabel: signal.originLabel,
    score: signal.score,
    rawScore: signal.rawScore,
    intent: signal.intent,
    intentColor: signal.intentColor,
    urgency: signal.urgency,
    priority: signal.priority,
    tool: signal.tool,
    date: signal.date,
    painPoint: signal.painPoint,
    elvanAngle: signal.elvanAngle,
    reply: signal.reply,
    alerted: signal.alerted,
    hotLead: signal.hotLead,
    occurredAtIso: signal.occurredAt.toISOString(),
    lastSeenAtIso: signal.lastSeenAt.toISOString(),
    url: signal.url,
    author: signal.author,
    subreddit: signal.subreddit,
    matchedKeyword: signal.matchedKeyword,
    stats: signal.stats,
    searchText: searchParts.filter(Boolean).join(" ").toLowerCase(),
  };
}
