import { Button } from '@/components/ui/button';
import { KpiCards } from './components/KpiCards';
import { OperationsAlerts } from './components/OperationsAlerts';
import { MissionStatusSummary } from './components/MissionStatusSummary';
import { RecentMissions } from './components/RecentMissions';
import { useRefreshDashboard } from './hooks';

export function DashboardScreen() {
  const refresh = useRefreshDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>

      <KpiCards />
      <OperationsAlerts />
      <MissionStatusSummary />
      <RecentMissions />
    </div>
  );
}
