import { supabase } from '@/lib/supabase';
import { normalizeDigits } from '@/lib/phone';
import type { DeactivatedReason, MissionHistoryEntry, ReviewWrittenEntry, UserDetail, UserListItem } from '@/types/user';

export const USERS_PAGE_SIZE = 20;

export interface UsersPage {
  items: UserListItem[];
  totalCount: number;
}

export interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'left' | 'disabled';
  sortBy: 'joinDate' | 'totalRequests';
  sortDirection: 'asc' | 'desc';
}

interface ProfileRow {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
  is_active: boolean;
  deactivated_reason: DeactivatedReason;
  is_admin: boolean;
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

// Email lives on auth.users, not profiles — the client can't query that
// table directly, so this goes through the admin_list_user_emails RPC
// (notme-app's 0020 migration), a SECURITY DEFINER function gated to
// admins. Pass ids to narrow it to specific users; omit for everyone.
// Swallows its own errors rather than throwing: this runs inside
// Promise.all alongside the actual user data, and email is supplementary
// (falls back to "Unknown" in the UI) — one RPC hiccup (or the 0020
// migration not being applied yet) shouldn't take down the whole
// Users list/detail screen along with it.
async function fetchEmails(ids?: string[]): Promise<Map<string, string>> {
  const { data, error } = await supabase.rpc('admin_list_user_emails', ids ? { target_ids: ids } : {});
  if (error) {
    console.error('fetchEmails failed:', error);
    return new Map();
  }

  return new Map((data ?? []).map((row: { id: string; email: string }) => [row.id, row.email]));
}

function toUserListItem(
  profile: ProfileRow,
  requestCounts: Map<string, number>,
  emails: Map<string, string>,
): UserListItem {
  return {
    id: profile.id,
    name: profile.name,
    email: emails.get(profile.id) ?? null,
    phone: profile.phone,
    joinDate: profile.created_at,
    totalRequests: requestCounts.get(profile.id) ?? 0,
    isActive: profile.is_active,
    deactivatedReason: profile.deactivated_reason,
    isAdmin: profile.is_admin,
  };
}

// Sorting by Total Requests can't happen in the DB query — it isn't a
// profiles column, just a count derived from missions. So this path fetches
// every matching profile (not just the current page), tallies counts, sorts
// in JS, and slices the page out of that. Fine at MVP scale; if the user
// table grows large enough for this to matter, the real fix is a Postgres
// view that pre-aggregates the count so it can be sorted server-side.
async function fetchUsersSortedByRequests(filters: UserFilters, page: number): Promise<UsersPage> {
  let query = supabase.from('profiles').select('id, name, phone, created_at, is_active, deactivated_reason, is_admin');
  if (filters.status === 'active') query = query.eq('is_active', true);
  if (filters.status === 'left') query = query.eq('is_active', false).eq('deactivated_reason', 'self');
  // deactivated_reason is null both for active accounts and for accounts
  // disabled before notme-app's 0019 migration introduced the column — back
  // then only admins could disable anyone, so a null reason on an inactive
  // row is unambiguously an old admin action, not a gap to leave unfiltered.
  if (filters.status === 'disabled') {
    query = query.eq('is_active', false).or('deactivated_reason.eq.admin,deactivated_reason.is.null');
  }

  const { data: profiles, error } = await query;
  if (error) throw error;
  if (!profiles || profiles.length === 0) return { items: [], totalCount: 0 };

  const ids = profiles.map((p) => p.id);
  const [requestCounts, emails] = await Promise.all([fetchRequestCounts(ids), fetchEmails(ids)]);

  const sorted = profiles
    .map((p) => toUserListItem(p, requestCounts, emails))
    .sort((a, b) => (filters.sortDirection === 'asc' ? 1 : -1) * (a.totalRequests - b.totalRequests));

  const from = page * USERS_PAGE_SIZE;
  return { items: sorted.slice(from, from + USERS_PAGE_SIZE), totalCount: sorted.length };
}

async function fetchUsersSortedByJoinDate(filters: UserFilters, page: number): Promise<UsersPage> {
  const from = page * USERS_PAGE_SIZE;
  const to = from + USERS_PAGE_SIZE - 1;

  let query = supabase
    .from('profiles')
    .select('id, name, phone, created_at, is_active, deactivated_reason, is_admin', { count: 'exact' })
    .order('created_at', { ascending: filters.sortDirection === 'asc' })
    .range(from, to);
  if (filters.status === 'active') query = query.eq('is_active', true);
  if (filters.status === 'left') query = query.eq('is_active', false).eq('deactivated_reason', 'self');
  // deactivated_reason is null both for active accounts and for accounts
  // disabled before notme-app's 0019 migration introduced the column — back
  // then only admins could disable anyone, so a null reason on an inactive
  // row is unambiguously an old admin action, not a gap to leave unfiltered.
  if (filters.status === 'disabled') {
    query = query.eq('is_active', false).or('deactivated_reason.eq.admin,deactivated_reason.is.null');
  }

  const { data: profiles, count, error } = await query;
  if (error) throw error;
  if (!profiles || profiles.length === 0) return { items: [], totalCount: count ?? 0 };

  const ids = profiles.map((p) => p.id);
  const [requestCounts, emails] = await Promise.all([fetchRequestCounts(ids), fetchEmails(ids)]);

  return { items: profiles.map((p) => toUserListItem(p, requestCounts, emails)), totalCount: count ?? 0 };
}

function matchesSearch(profile: ProfileRow, term: string): boolean {
  if (profile.name.toLowerCase().includes(term.toLowerCase())) return true;

  const termDigits = normalizeDigits(term);
  return termDigits.length > 0 && profile.phone != null && normalizeDigits(profile.phone).includes(termDigits);
}

function compareUsers(a: UserListItem, b: UserListItem, filters: UserFilters): number {
  const dir = filters.sortDirection === 'asc' ? 1 : -1;
  return filters.sortBy === 'totalRequests'
    ? dir * (a.totalRequests - b.totalRequests)
    : dir * (new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
}

// Phone numbers aren't stored in one consistent format (some hyphenated,
// some not), so a DB-level ILIKE on phone would miss real matches whenever
// the search term's hyphenation doesn't line up with what's stored — ILIKE
// does literal substring matching, hyphens and all. There's no way to
// normalize a column's punctuation from a PostgREST filter without an RPC,
// so search fetches every matching-status profile and compares digits-only
// in JS instead. Same "fine at MVP scale" tradeoff as the Total Requests
// sort above.
async function fetchUsersWithSearch(filters: UserFilters, term: string, page: number): Promise<UsersPage> {
  let query = supabase.from('profiles').select('id, name, phone, created_at, is_active, deactivated_reason, is_admin');
  if (filters.status === 'active') query = query.eq('is_active', true);
  if (filters.status === 'left') query = query.eq('is_active', false).eq('deactivated_reason', 'self');
  // deactivated_reason is null both for active accounts and for accounts
  // disabled before notme-app's 0019 migration introduced the column — back
  // then only admins could disable anyone, so a null reason on an inactive
  // row is unambiguously an old admin action, not a gap to leave unfiltered.
  if (filters.status === 'disabled') {
    query = query.eq('is_active', false).or('deactivated_reason.eq.admin,deactivated_reason.is.null');
  }

  const { data: profiles, error } = await query;
  if (error) throw error;

  const matched = (profiles ?? []).filter((p) => matchesSearch(p, term));
  if (matched.length === 0) return { items: [], totalCount: 0 };

  const matchedIds = matched.map((p) => p.id);
  const [requestCounts, emails] = await Promise.all([fetchRequestCounts(matchedIds), fetchEmails(matchedIds)]);
  const items = matched
    .map((p) => toUserListItem(p, requestCounts, emails))
    .sort((a, b) => compareUsers(a, b, filters));

  const from = page * USERS_PAGE_SIZE;
  return { items: items.slice(from, from + USERS_PAGE_SIZE), totalCount: items.length };
}

export async function fetchUsers(filters: UserFilters, page: number): Promise<UsersPage> {
  const term = filters.search.trim();
  if (term) return fetchUsersWithSearch(filters, term, page);

  return filters.sortBy === 'totalRequests'
    ? fetchUsersSortedByRequests(filters, page)
    : fetchUsersSortedByJoinDate(filters, page);
}

// Unfiltered, all-time — same reasoning as Export Mission Data: a full data
// dump, not tied to whatever filters/sort happen to be set on this screen.
export async function fetchAllUsersForExport(): Promise<UserListItem[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, phone, created_at, is_active, deactivated_reason, is_admin');

  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  const ids = profiles.map((p) => p.id);
  const [requestCounts, emails] = await Promise.all([fetchRequestCounts(ids), fetchEmails(ids)]);
  return profiles.map((p) => toUserListItem(p, requestCounts, emails));
}

export async function fetchUserById(id: string): Promise<UserDetail> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, phone, created_at, is_active, deactivated_reason, is_admin, hero_rating, hero_review_count')
    .eq('id', id)
    .single();

  if (profileError) throw profileError;

  const [
    { count: totalRequests, error: requestsError },
    { count: cancellations, error: cancellationsError },
    { count: missionsCompleted, error: completedError },
    { data: missionHistoryRows, error: historyError },
    { data: reviewRows, error: reviewsError },
    emails,
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
    fetchEmails([id]),
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
    email: emails.get(profile.id) ?? null,
    phone: profile.phone,
    joinDate: profile.created_at,
    isActive: profile.is_active,
    deactivatedReason: profile.deactivated_reason,
    isAdmin: profile.is_admin,
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
