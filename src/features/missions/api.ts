import { supabase } from '@/lib/supabase';
import type { MissionDetail, MissionListItem, MissionParty, MissionStatus } from '@/types/mission';

export interface MissionFilters {
  search: string;
  status: MissionStatus | 'all';
  category: string | 'all';
  dateFrom: string | null;
  dateTo: string | null;
}

export const DEFAULT_MISSION_FILTERS: MissionFilters = {
  search: '',
  status: 'all',
  category: 'all',
  dateFrom: null,
  dateTo: null,
};

export const MISSIONS_PAGE_SIZE = 20;

export interface MissionsPage {
  items: MissionListItem[];
  totalCount: number;
}

// The Supabase client has no generated Database types, so it can't tell a
// to-one embed from a to-many one and defaults to typing every embed as an
// array. At runtime PostgREST returns a to-one embed (missions.requester_id
// -> profiles, missions.hero_id -> profiles) as a plain object, not
// `[object]` — cast through these shapes instead of indexing into a phantom
// array (see the dashboard's identical note in features/dashboard/api.ts).
interface MissionListRow {
  id: string;
  category: string;
  reward_amount: number;
  status: MissionStatus;
  created_at: string;
  requester: { name: string } | null;
  hero: { name: string } | null;
}

export async function fetchMissions(filters: MissionFilters, page: number): Promise<MissionsPage> {
  const from = page * MISSIONS_PAGE_SIZE;
  const to = from + MISSIONS_PAGE_SIZE - 1;

  let query = supabase
    .from('missions')
    .select(
      'id, category, reward_amount, status, created_at, requester:profiles!requester_id(name), hero:profiles!hero_id(name)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.category !== 'all') query = query.eq('category', filters.category);
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
  if (filters.search.trim()) query = query.ilike('address', `%${filters.search.trim()}%`);

  const { data, count, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as MissionListRow[];

  const items: MissionListItem[] = rows.map((row) => ({
    id: row.id,
    category: row.category,
    rewardAmount: row.reward_amount,
    status: row.status,
    createdAt: row.created_at,
    requesterName: row.requester?.name ?? 'Unknown',
    heroName: row.hero?.name ?? null,
  }));

  return { items, totalCount: count ?? 0 };
}

export async function fetchMissionCategories(): Promise<string[]> {
  const { data, error } = await supabase.from('missions').select('category');
  if (error) throw error;

  const unique = new Set((data ?? []).map((row) => row.category as string));
  return Array.from(unique).sort();
}

interface MissionPartyRow {
  id: string;
  name: string;
  phone: string | null;
  hero_rating: number | null;
  hero_review_count: number;
}

interface MissionDetailRow {
  id: string;
  category: string;
  address: string;
  reward_amount: number;
  status: MissionStatus;
  created_at: string;
  updated_at: string;
  requester: MissionPartyRow | null;
  hero: MissionPartyRow | null;
}

function toMissionParty(row: MissionPartyRow): MissionParty {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    heroRating: row.hero_rating,
    heroReviewCount: row.hero_review_count,
  };
}

export async function fetchMissionById(id: string): Promise<MissionDetail> {
  const { data, error } = await supabase
    .from('missions')
    .select(
      'id, category, address, reward_amount, status, created_at, updated_at, requester:profiles!requester_id(id, name, phone, hero_rating, hero_review_count), hero:profiles!hero_id(id, name, phone, hero_rating, hero_review_count)',
    )
    .eq('id', id)
    .single();

  if (error) throw error;

  const row = data as unknown as MissionDetailRow;
  if (!row.requester) throw new Error('Mission has no requester');

  return {
    id: row.id,
    category: row.category,
    address: row.address,
    rewardAmount: row.reward_amount,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requester: toMissionParty(row.requester),
    hero: row.hero ? toMissionParty(row.hero) : null,
  };
}

export async function cancelMission(id: string): Promise<void> {
  const { error } = await supabase.from('missions').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}
