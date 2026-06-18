import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { requireInternalUser } from "@/lib/authSession";
import { loadDashboardData } from "@/lib/dashboardData";
import { getProspectsCount } from "@/lib/hotProspectsDb";
import { getSourceCounts } from "@/lib/sourceViews";
import styles from "./layout.module.css";

export const runtime = "nodejs";
export const maxDuration = 30;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInternalUser();
  const connectionString = process.env.NEON_DATABASE_URL ?? "";
  const [data, hotProspectsCount] = await Promise.all([
    loadDashboardData(),
    connectionString ? getProspectsCount(connectionString) : Promise.resolve(0),
  ]);
  const sourceCounts = getSourceCounts(data);

  return (
    <div className={styles.app}>
      <Sidebar
        sourceCounts={sourceCounts}
        mode={data.statusSummary.mode}
        hotProspectsCount={hotProspectsCount}
      />
      <div className={styles.main}>
        <Topbar userEmail={user.email} userName={user.name} />
        {children}
      </div>
    </div>
  );
}
