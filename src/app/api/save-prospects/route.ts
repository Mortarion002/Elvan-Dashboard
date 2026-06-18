import { type NextRequest, NextResponse } from "next/server";

import { getCurrentInternalUser } from "@/lib/authSession";
import { saveProspects } from "@/lib/hotProspectsDb";
import type { ProspectInput } from "@/lib/campaignClicks";

export async function POST(request: NextRequest) {
  const user = await getCurrentInternalUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
  }

  let leads: ProspectInput[];
  try {
    leads = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await saveProspects(leads, connectionString);
    return NextResponse.json({ success: true, saved: result.saved, skipped: result.skipped });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to save hot prospects", error);
    return NextResponse.json({ success: false, error: `DB error: ${message}` }, { status: 500 });
  }
}
