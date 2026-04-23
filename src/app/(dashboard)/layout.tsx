import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { loadDashboardData } from "@/lib/dashboardData";
import styles from "./layout.module.css";

export const runtime = "nodejs";
export const maxDuration = 30;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const data = await loadDashboardData();
  const unhealthyChannels = data.channelStatuses.filter(
    (channel) => channel.status !== "healthy"
  ).length;

  return (
    <div className={styles.app}>
      <Sidebar
        navigationCounts={data.navigationCounts}
        unhealthyChannels={unhealthyChannels}
      />
      <div className={styles.main}>
        <Topbar
          statusSummary={data.statusSummary}
          coverage={data.coverage}
          channelStatuses={data.channelStatuses}
        />
        {children}
      </div>
    </div>
  );
}
