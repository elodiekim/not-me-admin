import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadCsv, toCsv } from '@/lib/csv';
import { fetchAllMissionsForExport } from '../api';
import { useRefreshDashboard } from '../hooks';

export function QuickActions() {
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const navigate = useNavigate();
  const refresh = useRefreshDashboard();

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = search.trim();
    navigate(trimmed ? `/missions?search=${encodeURIComponent(trimmed)}` : '/missions');
  }

  async function handleExport() {
    setIsExporting(true);
    setExportError(null);
    try {
      const missions = await fetchAllMissionsForExport();
      const csv = toCsv(
        missions.map((m) => ({
          id: m.id,
          category: m.category,
          address: m.address,
          requester: m.requesterName,
          hero: m.heroName ?? '',
          status: m.status,
          reward: m.rewardAmount,
          createdAt: m.createdAt,
        })),
      );
      downloadCsv(`missions-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <Input
            placeholder="Search address, requester, or hero…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button type="submit" variant="outline" size="sm">
            Search Mission
          </Button>
        </form>

        <div className="flex flex-col gap-1">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting…' : 'Export Mission Data'}
          </Button>
          {exportError && (
            <p role="alert" className="text-xs text-destructive">
              {exportError}
            </p>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
