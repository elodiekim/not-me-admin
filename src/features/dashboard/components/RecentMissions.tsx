import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ErrorState } from '@/components/shared/ErrorState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useRecentMissions } from '../hooks';

export function RecentMissions() {
  const { data, isLoading, isError } = useRecentMissions();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">Recent Missions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : isError ? (
          <ErrorState />
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No missions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mission ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Hero</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((mission) => (
                <TableRow
                  key={mission.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/missions/${mission.id}`)}
                >
                  <TableCell className="font-mono text-xs">{mission.id.slice(0, 8)}</TableCell>
                  <TableCell>{mission.category}</TableCell>
                  <TableCell>{mission.requesterName}</TableCell>
                  <TableCell>{mission.heroName ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={mission.status} />
                  </TableCell>
                  <TableCell>${mission.rewardAmount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(mission.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
