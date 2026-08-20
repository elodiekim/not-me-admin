import { KpiCards } from './components/KpiCards';
import { OperationsAlerts } from './components/OperationsAlerts';
import { MissionStatusSummary } from './components/MissionStatusSummary';
import { RecentMissions } from './components/RecentMissions';
import { QuickActions } from './components/QuickActions';

export function DashboardScreen() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <KpiCards />
      <OperationsAlerts />
      <MissionStatusSummary />
      <QuickActions />
      <RecentMissions />
    </div>
  );
}
