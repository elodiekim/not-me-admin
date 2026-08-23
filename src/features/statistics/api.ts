import { supabase } from '@/lib/supabase';
import type { DateCount } from '@/types/stats';

export type StatsPeriod = 'all' | 'last7' | 'last30';

const DAY_MS = 24 * 60 * 60 * 1000;

function cutoffFor(period: StatsPeriod): string | null {
  if (period === 'all') return null;
  const days = period === 'last7' ? 7 : 30;
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function groupByDay(timestamps: string[]): DateCount[] {
  const counts = new Map<string, number>();
  for (const timestamp of timestamps) {
    const day = timestamp.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));
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

export async function fetchSignupsOverTime(period: StatsPeriod): Promise<DateCount[]> {
  const cutoff = cutoffFor(period);
  let query = supabase.from('profiles').select('created_at');
  if (cutoff) query = query.gte('created_at', cutoff);

  const { data, error } = await query;
  if (error) throw error;

  return groupByDay((data ?? []).map((row) => row.created_at));
}

export async function fetchMissionsOverTime(period: StatsPeriod): Promise<DateCount[]> {
  const cutoff = cutoffFor(period);
  let query = supabase.from('missions').select('created_at');
  if (cutoff) query = query.gte('created_at', cutoff);

  const { data, error } = await query;
  if (error) throw error;

  return groupByDay((data ?? []).map((row) => row.created_at));
}
