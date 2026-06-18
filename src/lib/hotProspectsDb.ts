import "server-only";

import { neon } from "@neondatabase/serverless";

import type { ProspectInput } from "@/lib/campaignClicks";

export type StoredProspect = {
  email: string;
  fullName: string;
  savedAt: string;
};

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS clicked_leads (
    email      TEXT PRIMARY KEY,
    full_name  TEXT NOT NULL DEFAULT '',
    saved_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

const BATCH_SIZE = 50;

export async function saveProspects(
  leads: ProspectInput[],
  connectionString: string
): Promise<{ saved: number; skipped: number }> {
  if (!leads.length) {
    return { saved: 0, skipped: 0 };
  }

  const sql = neon(connectionString);
  await sql.query(CREATE_TABLE_SQL);

  let saved = 0;

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);
    const queries = batch.map(
      (lead) => sql`
        INSERT INTO clicked_leads (email, full_name)
        VALUES (${lead.email}, ${lead.fullName})
        ON CONFLICT (email) DO NOTHING
        RETURNING email
      `
    );
    const results = await sql.transaction(queries);
    saved += results.filter((r) => (r as unknown[]).length > 0).length;
  }

  return { saved, skipped: leads.length - saved };
}

export async function getProspects(connectionString: string): Promise<StoredProspect[]> {
  const sql = neon(connectionString);
  await sql.query(CREATE_TABLE_SQL);

  const rows = await sql`
    SELECT email, full_name, saved_at
    FROM clicked_leads
    ORDER BY saved_at DESC
  `;

  return (rows as Record<string, unknown>[]).map((row) => ({
    email: String(row.email ?? ""),
    fullName: String(row.full_name ?? ""),
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

