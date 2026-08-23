import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DateCountChart } from '@/components/shared/DateCountChart';
import { ErrorState } from '@/components/shared/ErrorState';
import type { StatsPeriod } from './api';
import { useMissionsOverTime, useMissionStats, useSignupsOverTime, useStatsAverageHeroRating } from './hooks';

const PERIOD_LABELS: Record<StatsPeriod, string> = {
  all: 'All Time',
  last7: 'Last 7 Days',
  last30: 'Last 30 Days',
};

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{children}</CardContent>
    </Card>
  );
}

export function StatisticsScreen() {
  const [period, setPeriod] = useState<StatsPeriod>('all');

  const missionStats = useMissionStats(period);
  const avgHeroRating = useStatsAverageHeroRating(period);
  const signups = useSignupsOverTime(period);
  const missionsOverTime = useMissionsOverTime(period);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Statistics</h1>
        <Select value={period} onValueChange={(value) => setPeriod((value ?? 'all') as StatsPeriod)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{PERIOD_LABELS.all}</SelectItem>
            <SelectItem value="last7">{PERIOD_LABELS.last7}</SelectItem>
            <SelectItem value="last30">{PERIOD_LABELS.last30}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Missions">
          {missionStats.isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : missionStats.isError ? (
            <ErrorState />
          ) : (
            missionStats.data?.totalMissions
          )}
        </StatCard>

        <StatCard label="Completion Rate">
          {missionStats.isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : missionStats.isError ? (
            <ErrorState />
          ) : missionStats.data?.completionRate == null ? (
            <span className="text-base text-muted-foreground">No decided missions yet</span>
          ) : (
            `${Math.round(missionStats.data.completionRate * 100)}%`
          )}
        </StatCard>

        <StatCard label="Average Hero Rating">
          {avgHeroRating.isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : avgHeroRating.isError ? (
            <ErrorState />
          ) : avgHeroRating.data == null ? (
            <span className="text-base text-muted-foreground">No ratings yet</span>
          ) : (
            avgHeroRating.data.toFixed(1)
          )}
        </StatCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Missions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {missionsOverTime.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : missionsOverTime.isError ? (
            <ErrorState />
          ) : !missionsOverTime.data || missionsOverTime.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missions in this period.</p>
          ) : (
            <DateCountChart data={missionsOverTime.data} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">Signups Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {signups.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : signups.isError ? (
            <ErrorState />
          ) : !signups.data || signups.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups in this period.</p>
          ) : (
            <DateCountChart data={signups.data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
