import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MISSION_STATUSES, MISSION_STATUS_LABELS } from '@/types/mission';
import { MISSIONS_PAGE_SIZE } from './api';
import type { MissionFilters } from './api';
import { useMissionCategories, useMissions } from './hooks';
import { MissionsTable } from './components/MissionsTable';

// Filters, sort, and page live in the URL (not local state) so that leaving
// for Mission Detail and coming back — via the "← Missions" link or the
// browser's back button — restores exactly the filtered view the admin had,
// instead of resetting to defaults every time.
export function MissionsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: MissionFilters = {
    search: searchParams.get('search') ?? '',
    status: (searchParams.get('status') as MissionFilters['status']) ?? 'all',
    category: searchParams.get('category') ?? 'all',
    dateFrom: searchParams.get('from'),
    dateTo: searchParams.get('to'),
  };
  const page = Number(searchParams.get('page') ?? '0');

  const [searchInput, setSearchInput] = useState(filters.search);

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

  const categories = useMissionCategories();
  const missions = useMissions(filters, page);

  function updateFilter<K extends 'status' | 'category' | 'dateFrom' | 'dateTo'>(
    key: K,
    value: MissionFilters[K],
  ) {
    const paramKey = key === 'dateFrom' ? 'from' : key === 'dateTo' ? 'to' : key;
    const isDefault = value === 'all' || !value;
    updateParams({ [paramKey]: isDefault ? null : String(value), page: null });
  }

  function setPage(next: number) {
    updateParams({ page: next === 0 ? null : String(next) });
  }

  const totalPages = missions.data ? Math.max(1, Math.ceil(missions.data.totalCount / MISSIONS_PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Missions</h1>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mission-search">Search</Label>
            <Input
              id="mission-search"
              placeholder="Address, requester, or hero…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter('status', (value ?? 'all') as MissionFilters['status'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {MISSION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {MISSION_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value ?? 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.data?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Date Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || null)}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <MissionsTable items={missions.data?.items} isLoading={missions.isLoading} isError={missions.isError} />

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
