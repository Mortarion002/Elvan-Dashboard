import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { loadDashboardData } from "@/lib/dashboardData";
import { getSourceCounts } from "@/lib/sourceViews";
import styles from "./layout.module.css";

export const runtime = "nodejs";
export const maxDuration = 30;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const data = await loadDashboardData();
  const sourceCounts = getSourceCounts(data);

  return (
    <div className={styles.app}>
      <Sidebar
        sourceCounts={sourceCounts}
        mode={data.statusSummary.mode}
      />
      <div className={styles.main}>
        <Topbar
          statusSummary={data.statusSummary}
          coverage={data.coverage}
        />
        {children}
      </div>
    </div>
  );
}
