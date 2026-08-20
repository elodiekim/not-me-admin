import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_USER_FILTERS, USERS_PAGE_SIZE, type UserFilters } from './api';
import { useUsers } from './hooks';
import { UsersTable } from './components/UsersTable';

export function UsersScreen() {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [page, setPage] = useState(0);
  const users = useUsers(filters, page);

  const totalPages = users.data ? Math.max(1, Math.ceil(users.data.totalCount / USERS_PAGE_SIZE)) : 1;

  function handleSortChange(column: UserFilters['sortBy']) {
    setFilters((f) =>
      f.sortBy === column
        ? { ...f, sortDirection: f.sortDirection === 'desc' ? 'asc' : 'desc' }
        : { ...f, sortBy: column, sortDirection: 'desc' },
    );
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Users</h1>
        <Select
          value={filters.status}
          onValueChange={(value) => {
            setFilters((f) => ({ ...f, status: (value ?? 'all') as UserFilters['status'] }));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <UsersTable
            items={users.data?.items}
            isLoading={users.isLoading}
            isError={users.isError}
            sortBy={filters.sortBy}
            sortDirection={filters.sortDirection}
            onSortChange={handleSortChange}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
