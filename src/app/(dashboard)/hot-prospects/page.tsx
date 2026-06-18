import { getProspects } from "@/lib/hotProspectsDb";
import { requireInternalUser } from "@/lib/authSession";
import { HotProspectsPage } from "@/components/prospects/HotProspectsPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireInternalUser();

  const connectionString = process.env.NEON_DATABASE_URL ?? "";
  const prospects = connectionString ? await getProspects(connectionString) : [];

  return <HotProspectsPage prospects={prospects} />;
}
