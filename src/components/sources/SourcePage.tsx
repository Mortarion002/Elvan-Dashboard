import { SourceInbox } from "@/components/sources/SourceInbox";
import { loadDashboardData } from "@/lib/dashboardData";
import { buildSourcePageView } from "@/lib/sourceViews";
import type { SignalSource } from "@/data/mockData";

type SourcePageProps = {
  source: SignalSource;
};

export async function SourcePage({ source }: SourcePageProps) {
  const data = await loadDashboardData();
  const view = buildSourcePageView(data, source);

  return (
    <SourceInbox
      view={view}
      statusSummary={{
        mode: data.statusSummary.mode,
        label: data.statusSummary.label,
        lastSignalLabel: data.statusSummary.lastSignalLabel,
        warnings: data.statusSummary.warnings,
      }}
    />
  );
}
