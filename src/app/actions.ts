"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

import { getCurrentInternalUser } from "@/lib/authSession";
import { invalidateDashboardCache } from "@/lib/dashboardData";
import { saveProspects, deleteProspect } from "@/lib/hotProspectsDb";
import type { ClickedLead } from "@/lib/campaignClicks";

export async function deleteXSignal(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentInternalUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return { success: false, error: "Database not configured" };
  }

  const sql = neon(connectionString);

  try {
    const result = await sql`
      DELETE FROM signal_events
      WHERE dedupe_key = ${id} AND source = 'x'
      RETURNING dedupe_key
    `;

    const rows = result as unknown as Array<{ dedupe_key: string }>;
    if (!rows.length) {
      return { success: false, error: "Record not found or not an X post" };
    }

    invalidateDashboardCache();
    revalidatePath("/x");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete X signal", error);
    return { success: false, error: "Delete failed" };
  }
}

export async function saveHotProspects(
  leads: ClickedLead[]
): Promise<{ success: boolean; saved?: number; skipped?: number; error?: string }> {
  const user = await getCurrentInternalUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return { success: false, error: "Database not configured" };
  }

  try {
    const result = await saveProspects(leads, connectionString);
    revalidatePath("/hot-prospects");
    return { success: true, saved: result.saved, skipped: result.skipped };
  } catch (error) {
    console.error("Failed to save hot prospects", error);
    return { success: false, error: "Save failed" };
  }
}

export async function deleteHotProspect(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentInternalUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return { success: false, error: "Database not configured" };
  }

  try {
    await deleteProspect(email, connectionString);
    revalidatePath("/hot-prospects");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete hot prospect", error);
    return { success: false, error: "Delete failed" };
  }
}
