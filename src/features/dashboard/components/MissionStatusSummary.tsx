import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { MISSION_STATUSES, MISSION_STATUS_LABELS } from '@/types/mission';
import { useMissionStatusCounts } from '../hooks';

export function MissionStatusSummary() {
  const { data, isLoading, isError } = useMissionStatusCounts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">Mission Status Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : isError ? (
          <ErrorState />
        ) : (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {MISSION_STATUSES.map((status) => (
              <div key={status} className="flex flex-col">
                <dt className="text-xs text-muted-foreground">{MISSION_STATUS_LABELS[status]}</dt>
                <dd className="text-lg font-semibold">{data?.[status] ?? 0}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
