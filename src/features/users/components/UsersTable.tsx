import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActiveBadge } from '@/components/shared/ActiveBadge';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatPhone } from '@/lib/phone';
import type { UserListItem } from '@/types/user';
import type { UserFilters } from '../api';

interface SortableColumn {
  key: UserFilters['sortBy'];
  label: string;
}

const SORTABLE_COLUMNS: SortableColumn[] = [
  { key: 'joinDate', label: 'Join Date' },
  { key: 'totalRequests', label: 'Total Requests' },
];

interface UsersTableProps {
  items: UserListItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  sortBy: UserFilters['sortBy'];
  sortDirection: UserFilters['sortDirection'];
  onSortChange: (column: UserFilters['sortBy']) => void;
}

export function UsersTable({ items, isLoading, isError, sortBy, sortDirection, onSortChange }: UsersTableProps) {
  const navigate = useNavigate();

  function renderSortableHead(column: SortableColumn) {
    const isActive = sortBy === column.key;
    return (
      <TableHead
        key={column.key}
        role="button"
        onClick={() => onSortChange(column.key)}
        className="cursor-pointer select-none"
      >
        {column.label} {isActive && (sortDirection === 'desc' ? '↓' : '↑')}
      </TableHead>
    );
  }

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
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">No users yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          {renderSortableHead(SORTABLE_COLUMNS[0])}
          {renderSortableHead(SORTABLE_COLUMNS[1])}
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((user) => (
          <TableRow key={user.id} className="cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email ?? '—'}</TableCell>
            <TableCell>{user.phone ? formatPhone(user.phone) : '—'}</TableCell>
            <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
            <TableCell>{user.totalRequests}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <ActiveBadge isActive={user.isActive} />
                {user.deactivatedReason && (
                  <span className="text-xs text-muted-foreground">
                    ({user.deactivatedReason === 'self' ? 'self' : 'admin'})
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
