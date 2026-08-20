import { supabase } from '@/lib/supabase';
import type { MissionHistoryEntry, ReviewWrittenEntry, UserDetail, UserListItem } from '@/types/user';

export const USERS_PAGE_SIZE = 20;

export interface UsersPage {
  items: UserListItem[];
  totalCount: number;
}

export interface UserFilters {
  status: 'all' | 'active' | 'disabled';
  sortBy: 'joinDate' | 'totalRequests';
  sortDirection: 'asc' | 'desc';
}

interface ProfileRow {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
  is_active: boolean;
}

async function fetchRequestCounts(ids: string[]): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase.from('missions').select('requester_id').in('requester_id', ids);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.requester_id, (counts.get(row.requester_id) ?? 0) + 1);
  }
  return counts;
}

function toUserListItem(profile: ProfileRow, requestCounts: Map<string, number>): UserListItem {
  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    joinDate: profile.created_at,
    totalRequests: requestCounts.get(profile.id) ?? 0,
    isActive: profile.is_active,
  };
}

// Sorting by Total Requests can't happen in the DB query — it isn't a
// profiles column, just a count derived from missions. So this path fetches
// every matching profile (not just the current page), tallies counts, sorts
// in JS, and slices the page out of that. Fine at MVP scale; if the user
// table grows large enough for this to matter, the real fix is a Postgres
// view that pre-aggregates the count so it can be sorted server-side.
async function fetchUsersSortedByRequests(filters: UserFilters, page: number): Promise<UsersPage> {
  let query = supabase.from('profiles').select('id, name, phone, created_at, is_active');
  if (filters.status !== 'all') query = query.eq('is_active', filters.status === 'active');

  const { data: profiles, error } = await query;
  if (error) throw error;
  if (!profiles || profiles.length === 0) return { items: [], totalCount: 0 };

  const requestCounts = await fetchRequestCounts(profiles.map((p) => p.id));

  const sorted = profiles
    .map((p) => toUserListItem(p, requestCounts))
    .sort((a, b) => (filters.sortDirection === 'asc' ? 1 : -1) * (a.totalRequests - b.totalRequests));

  const from = page * USERS_PAGE_SIZE;
  return { items: sorted.slice(from, from + USERS_PAGE_SIZE), totalCount: sorted.length };
}

async function fetchUsersSortedByJoinDate(filters: UserFilters, page: number): Promise<UsersPage> {
  const from = page * USERS_PAGE_SIZE;
  const to = from + USERS_PAGE_SIZE - 1;

  let query = supabase
    .from('profiles')
    .select('id, name, phone, created_at, is_active', { count: 'exact' })
    .order('created_at', { ascending: filters.sortDirection === 'asc' })
    .range(from, to);
  if (filters.status !== 'all') query = query.eq('is_active', filters.status === 'active');

  const { data: profiles, count, error } = await query;
  if (error) throw error;
  if (!profiles || profiles.length === 0) return { items: [], totalCount: count ?? 0 };

  const requestCounts = await fetchRequestCounts(profiles.map((p) => p.id));

  return { items: profiles.map((p) => toUserListItem(p, requestCounts)), totalCount: count ?? 0 };
}

export async function fetchUsers(filters: UserFilters, page: number): Promise<UsersPage> {
  return filters.sortBy === 'totalRequests'
    ? fetchUsersSortedByRequests(filters, page)
    : fetchUsersSortedByJoinDate(filters, page);
}

export async function fetchUserById(id: string): Promise<UserDetail> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, phone, created_at, is_active, hero_rating, hero_review_count')
    .eq('id', id)
    .single();

  if (profileError) throw profileError;

  const [
    { count: totalRequests, error: requestsError },
    { count: cancellations, error: cancellationsError },
    { count: missionsCompleted, error: completedError },
    { data: missionHistoryRows, error: historyError },
    { data: reviewRows, error: reviewsError },
  ] = await Promise.all([
    supabase.from('missions').select('*', { count: 'exact', head: true }).eq('requester_id', id),
    supabase
      .from('mission_cancellations')
      .select('*', { count: 'exact', head: true })
      .eq('actor_id', id)
      .eq('actor_role', 'requester'),
    supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('hero_id', id)
      .eq('status', 'completed'),
    supabase
      .from('missions')
      .select('id, category, status, created_at')
      .eq('requester_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, hero:profiles!hero_id(name)')
      .eq('reviewer_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (requestsError) throw requestsError;
  if (cancellationsError) throw cancellationsError;
  if (completedError) throw completedError;
  if (historyError) throw historyError;
  if (reviewsError) throw reviewsError;

  const missionHistory: MissionHistoryEntry[] = (missionHistoryRows ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
  }));

  // Same to-one-embed-typed-as-array footgun as missions/dashboard api.ts —
  // PostgREST returns `hero` as a plain object at runtime, not `[object]`.
  const reviewsWritten: ReviewWrittenEntry[] = (
    (reviewRows ?? []) as unknown as {
      id: string;
      rating: number;
      comment: string | null;
      created_at: string;
      hero: { name: string } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    heroName: row.hero?.name ?? 'Unknown',
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }));

  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    joinDate: profile.created_at,
    isActive: profile.is_active,
    asRequester: {
      totalRequests: totalRequests ?? 0,
      cancellations: cancellations ?? 0,
      missionHistory,
      reviewsWritten,
    },
    asHero: {
      missionsCompleted: missionsCompleted ?? 0,
      heroRating: profile.hero_rating,
      heroReviewCount: profile.hero_review_count,
    },
  };
}

export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}
