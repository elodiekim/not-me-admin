import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { USERS_PAGE_SIZE, type UserFilters } from './api';
import { useUsers } from './hooks';
import { UsersTable } from './components/UsersTable';

const DEFAULT_SORT = 'joinDate-desc';

function parseSort(value: string): Pick<UserFilters, 'sortBy' | 'sortDirection'> {
  const [sortBy, sortDirection] = value.split('-');
  return {
    sortBy: sortBy === 'totalRequests' ? 'totalRequests' : 'joinDate',
    sortDirection: sortDirection === 'asc' ? 'asc' : 'desc',
  };
}

// Filters/sort/page live in the URL, same reasoning as MissionsScreen — so
// leaving for User Detail and coming back restores the view the admin had.
export function UsersScreen() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const status = (searchParams.get('status') as UserFilters['status']) ?? 'all';
  const sortValue = searchParams.get('sort') ?? DEFAULT_SORT;
  const { sortBy, sortDirection } = parseSort(sortValue);
  const filters: UserFilters = { search, status, sortBy, sortDirection };
  const page = Number(searchParams.get('page') ?? '0');

  const [searchInput, setSearchInput] = useState(search);

  const users = useUsers(filters, page);
  const totalPages = users.data ? Math.max(1, Math.ceil(users.data.totalCount / USERS_PAGE_SIZE)) : 1;

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  // Debounced so typing doesn't refetch (or push a URL update) on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams({ search: searchInput || null, page: null });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function handleSortChange(column: UserFilters['sortBy']) {
    const nextDirection = sortBy === column && sortDirection === 'desc' ? 'asc' : 'desc';
    const nextValue = `${column}-${nextDirection}`;
    updateParams({ sort: nextValue === DEFAULT_SORT ? null : nextValue, page: null });
  }

  function setPage(next: number) {
    updateParams({ page: next === 0 ? null : String(next) });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Users</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name or phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-56"
          />
          <Select
            value={status}
            onValueChange={(value) => updateParams({ status: value === 'all' ? null : value, page: null })}
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
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <UsersTable
            items={users.data?.items}
            isLoading={users.isLoading}
            isError={users.isError}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
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
