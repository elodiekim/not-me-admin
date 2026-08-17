import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAverageHeroRating, useMissionStatusCounts, useTotalUsers } from '../hooks';

function KpiCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{children}</CardContent>
    </Card>
  );
}

export function KpiCards() {
  const statusCounts = useMissionStatusCounts();
  const totalUsers = useTotalUsers();
  const avgHeroRating = useAverageHeroRating();

  const totalMissions = statusCounts.data
    ? Object.values(statusCounts.data).reduce((sum, n) => sum + n, 0)
    : null;

  const completionRate = statusCounts.data
    ? (() => {
        const { completed, cancelled } = statusCounts.data;
        const decided = completed + cancelled;
        return decided === 0 ? null : completed / decided;
      })()
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total Missions">
        {statusCounts.isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : statusCounts.isError ? (
          <ErrorState />
        ) : (
          totalMissions
        )}
      </KpiCard>

      <KpiCard label="Completion Rate">
        {statusCounts.isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : statusCounts.isError ? (
          <ErrorState />
        ) : completionRate === null ? (
          <span className="text-base text-muted-foreground">No decided missions yet</span>
        ) : (
          `${Math.round(completionRate * 100)}%`
        )}
      </KpiCard>

      <KpiCard label="Total Users">
        {totalUsers.isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : totalUsers.isError ? (
          <ErrorState />
        ) : (
          totalUsers.data
        )}
      </KpiCard>

      <KpiCard label="Average Hero Rating">
        {avgHeroRating.isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : avgHeroRating.isError ? (
          <ErrorState />
        ) : avgHeroRating.data == null ? (
          <span className="text-base text-muted-foreground">No ratings yet</span>
        ) : (
          avgHeroRating.data.toFixed(1)
        )}
      </KpiCard>
    </div>
  );
}
