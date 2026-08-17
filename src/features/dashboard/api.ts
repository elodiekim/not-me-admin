import { supabase } from '@/lib/supabase';
import { MISSION_STATUSES, type MissionStatus, type RecentMission, type SearchingAlertMission } from '@/types/mission';

const SEARCHING_ALERT_THRESHOLD_MS = 15 * 60 * 1000;

async function countMissionsByStatus(status: MissionStatus): Promise<number> {
  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchMissionStatusCounts(): Promise<Record<MissionStatus, number>> {
  const counts = await Promise.all(MISSION_STATUSES.map(countMissionsByStatus));
  return Object.fromEntries(MISSION_STATUSES.map((status, i) => [status, counts[i]])) as Record<
    MissionStatus,
    number
  >;
}

export async function fetchTotalUsers(): Promise<number> {
  const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function fetchAverageHeroRating(): Promise<number | null> {
  const { data, error } = await supabase.from('profiles').select('hero_rating').not('hero_rating', 'is', null);
  if (error) throw error;
  if (!data || data.length === 0) return null;

  const sum = data.reduce((total, row) => total + (row.hero_rating ?? 0), 0);
  return sum / data.length;
}

export async function fetchSearchingAlerts(): Promise<SearchingAlertMission[]> {
  const threshold = new Date(Date.now() - SEARCHING_ALERT_THRESHOLD_MS).toISOString();

  const { data, error } = await supabase
    .from('missions')
    .select('id, category, address, created_at')
    .eq('status', 'requested')
    .lt('created_at', threshold)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    address: row.address,
    createdAt: row.created_at,
  }));
}

// The Supabase client has no generated Database types, so it can't tell a
// to-one embed (this one — missions.requester_id -> profiles) from a to-many
// one, and defaults to typing every embed as an array. At runtime PostgREST
// returns a to-one embed as a plain object, not `[object]` — cast through
// this shape instead of indexing into a phantom array.
interface RecentMissionRow {
  id: string;
  category: string;
  reward_amount: number;
  status: MissionStatus;
  created_at: string;
  requester: { name: string } | null;
  hero: { name: string } | null;
}

export async function fetchRecentMissions(limit = 10): Promise<RecentMission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select(
      'id, category, reward_amount, status, created_at, requester:profiles!requester_id(name), hero:profiles!hero_id(name)',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = (data ?? []) as unknown as RecentMissionRow[];

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    rewardAmount: row.reward_amount,
    status: row.status,
    createdAt: row.created_at,
    requesterName: row.requester?.name ?? 'Unknown',
    heroName: row.hero?.name ?? null,
  }));
}
