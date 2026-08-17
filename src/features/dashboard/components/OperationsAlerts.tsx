import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { useSearchingAlerts } from '../hooks';

export function OperationsAlerts() {
  const { data, isLoading, isError } = useSearchingAlerts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">Operations Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : isError ? (
          <ErrorState />
        ) : data && data.length > 0 ? (
          <ul className="flex flex-col gap-2 text-sm">
            {data.map((mission) => (
              <li key={mission.id}>
                <Link
                  to={`/missions/${mission.id}`}
                  className="flex items-center justify-between hover:underline"
                >
                  <span>
                    {mission.category} · {mission.address}
                  </span>
                  <span className="text-muted-foreground">
                    searching since {new Date(mission.createdAt).toLocaleTimeString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No missions searching for more than 15 minutes.</p>
        )}
      </CardContent>
    </Card>
  );
}
