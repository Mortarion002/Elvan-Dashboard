import "server-only";

import { neon } from "@neondatabase/serverless";

import type { ProspectInput } from "@/lib/campaignClicks";

export type StoredProspect = {
  email: string;
  fullName: string;
  company: string;
  phone: string;
  website: string;
  linkedin: string;
  location: string;
  status: string;
  sequence: string;
  totalClicks: number;
  campaignCount: number;
  campaignNames: string[];
  sourceFiles: string[];
  rawDetails: Record<string, string>;
  savedAt: string;
};

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS clicked_leads (
    email                TEXT PRIMARY KEY,
    full_name            TEXT NOT NULL DEFAULT '',
    company              TEXT NOT NULL DEFAULT '',
    phone                TEXT NOT NULL DEFAULT '',
    website              TEXT NOT NULL DEFAULT '',
    linkedin             TEXT NOT NULL DEFAULT '',
    location             TEXT NOT NULL DEFAULT '',
    status               TEXT NOT NULL DEFAULT '',
    sequence             TEXT NOT NULL DEFAULT '',
    total_clicks         INTEGER NOT NULL DEFAULT 0,
    campaign_count       INTEGER NOT NULL DEFAULT 0,
    campaign_names_json  TEXT NOT NULL DEFAULT '[]',
    source_files_json    TEXT NOT NULL DEFAULT '[]',
    raw_details_json     TEXT NOT NULL DEFAULT '{}',
    saved_at             TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

export async function saveProspects(
  leads: ProspectInput[],
  connectionString: string
): Promise<{ saved: number; skipped: number }> {
  if (!leads.length) {
    return { saved: 0, skipped: 0 };
  }

  const sql = neon(connectionString);
  await sql.query(CREATE_TABLE_SQL);

  const rows = leads.map((lead) => ({
    email: lead.email,
    full_name: lead.fullName,
    company: lead.company,
    phone: lead.phone,
    website: lead.website,
    linkedin: lead.linkedIn,
    location: lead.location,
    status: lead.status,
    sequence: lead.sequence,
    total_clicks: lead.totalClicks,
    campaign_count: lead.campaignCount,
    campaign_names_json: JSON.stringify(lead.campaignNames),
    source_files_json: JSON.stringify(lead.sourceFiles),
  }));

  const result = await sql`
    INSERT INTO clicked_leads (
      email, full_name, company, phone, website, linkedin, location,
      status, sequence, total_clicks, campaign_count,
      campaign_names_json, source_files_json
    )
    SELECT
      d->>'email',
      d->>'full_name',
      d->>'company',
      d->>'phone',
      d->>'website',
      d->>'linkedin',
      d->>'location',
      d->>'status',
      d->>'sequence',
      (d->>'total_clicks')::integer,
      (d->>'campaign_count')::integer,
      d->>'campaign_names_json',
      d->>'source_files_json'
    FROM json_array_elements(${JSON.stringify(rows)}::json) AS d
    ON CONFLICT (email) DO NOTHING
    RETURNING email
  `;

  const saved = (result as unknown[]).length;
  return { saved, skipped: leads.length - saved };
}

export async function getProspects(connectionString: string): Promise<StoredProspect[]> {
  const sql = neon(connectionString);
  await sql.query(CREATE_TABLE_SQL);

  const rows = await sql`
    SELECT
      email, full_name, company, phone, website, linkedin, location,
      status, sequence, total_clicks, campaign_count,
      campaign_names_json, source_files_json, raw_details_json,
      saved_at
    FROM clicked_leads
    ORDER BY saved_at DESC
  `;

  return (rows as Record<string, unknown>[]).map((row) => ({
    email: String(row.email ?? ""),
    fullName: String(row.full_name ?? ""),
    company: String(row.company ?? ""),
    phone: String(row.phone ?? ""),
    website: String(row.website ?? ""),
    linkedin: String(row.linkedin ?? ""),
    location: String(row.location ?? ""),
    status: String(row.status ?? ""),
    sequence: String(row.sequence ?? ""),
    totalClicks: Number(row.total_clicks ?? 0),
    campaignCount: Number(row.campaign_count ?? 0),
    campaignNames: safeParseJson<string[]>(String(row.campaign_names_json ?? "[]"), []),
    sourceFiles: safeParseJson<string[]>(String(row.source_files_json ?? "[]"), []),
    rawDetails: safeParseJson<Record<string, string>>(String(row.raw_details_json ?? "{}"), {}),
    savedAt: String(row.saved_at ?? ""),
  }));
}

export async function getProspectsCount(connectionString: string): Promise<number> {
  const sql = neon(connectionString);
  await sql.query(CREATE_TABLE_SQL);

  const result = await sql`SELECT COUNT(*) AS count FROM clicked_leads`;
  return Number((result[0] as { count: string }).count ?? 0);
}

export async function deleteProspect(email: string, connectionString: string): Promise<void> {
  const sql = neon(connectionString);
  await sql.query(CREATE_TABLE_SQL);

  await sql`DELETE FROM clicked_leads WHERE email = ${email}`;
}

function safeParseJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
