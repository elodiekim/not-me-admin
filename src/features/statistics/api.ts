import { supabase } from '@/lib/supabase';

export type StatsPeriod = 'all' | 'last30';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function cutoffFor(period: StatsPeriod): string | null {
  return period === 'all' ? null : new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
}

export interface MissionStats {
  totalMissions: number;
  completionRate: number | null;
}

async function countMissions(period: StatsPeriod, status?: 'completed' | 'cancelled'): Promise<number> {
  const cutoff = cutoffFor(period);
  let query = supabase.from('missions').select('*', { count: 'exact', head: true });
  if (status) query = query.eq('status', status);
  if (cutoff) query = query.gte('created_at', cutoff);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function fetchMissionStats(period: StatsPeriod): Promise<MissionStats> {
  const [total, completed, cancelled] = await Promise.all([
    countMissions(period),
    countMissions(period, 'completed'),
    countMissions(period, 'cancelled'),
  ]);

  const decided = completed + cancelled;

  return {
    totalMissions: total,
    completionRate: decided === 0 ? null : completed / decided,
  };
}

// Statistics' Average Hero Rating is period-filterable (unlike the
// Dashboard's, which reads profiles.hero_rating — an all-time snapshot with
// no per-review timestamp). Computed directly from reviews.rating instead,
// which does carry a created_at to filter by.
export async function fetchAverageHeroRating(period: StatsPeriod): Promise<number | null> {
  const cutoff = cutoffFor(period);
  let query = supabase.from('reviews').select('rating');
  if (cutoff) query = query.gte('created_at', cutoff);

  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return null;

  const sum = data.reduce((total, row) => total + row.rating, 0);
  return sum / data.length;
}

export interface SignupDay {
  date: string;
  count: number;
}

export async function fetchSignupsOverTime(period: StatsPeriod): Promise<SignupDay[]> {
  const cutoff = cutoffFor(period);
  let query = supabase.from('profiles').select('created_at');
  if (cutoff) query = query.gte('created_at', cutoff);

  const { data, error } = await query;
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
