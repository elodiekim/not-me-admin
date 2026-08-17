import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ErrorState } from '@/components/shared/ErrorState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { MissionListItem } from '@/types/mission';

interface MissionsTableProps {
  items: MissionListItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function MissionsTable({ items, isLoading, isError }: MissionsTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (isError) return <ErrorState />;
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">No missions match these filters.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mission ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Hero</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Reward</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((mission) => (
          <TableRow
            key={mission.id}
            className="cursor-pointer"
            onClick={() => navigate(`/missions/${mission.id}`)}
          >
            <TableCell className="font-mono text-xs">{mission.id.slice(0, 8)}</TableCell>
            <TableCell>{mission.requesterName}</TableCell>
            <TableCell>{mission.heroName ?? '—'}</TableCell>
            <TableCell>{mission.category}</TableCell>
            <TableCell>${mission.rewardAmount.toFixed(2)}</TableCell>
            <TableCell>
              <StatusBadge status={mission.status} />
            </TableCell>
            <TableCell>{new Date(mission.createdAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
