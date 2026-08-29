export type MissionStatus =
  | 'requested'
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'completed'
  | 'cancelled';

// Order matches ADMIN.md's Mission Status Summary and Status Timeline.
export const MISSION_STATUSES: MissionStatus[] = [
  'requested',
  'accepted',
  'on_the_way',
  'arrived',
  'completed',
  'cancelled',
];

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  requested: 'Searching',
  accepted: 'Accepted',
  on_the_way: 'On The Way',
  arrived: 'Arrived',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export interface RecentMission {
  id: string;
  category: string;
  rewardAmount: number;
  status: MissionStatus;
  createdAt: string;
  requesterName: string;
  heroName: string | null;
}

export interface SearchingAlertMission {
  id: string;
  category: string;
  address: string;
  createdAt: string;
}

export interface MissionListItem {
  id: string;
  category: string;
  rewardAmount: number;
  status: MissionStatus;
  createdAt: string;
  requesterName: string;
  heroName: string | null;
}

export interface MissionParty {
  id: string;
  name: string;
  phone: string | null;
  heroRating: number | null;
  heroReviewCount: number;
}

// Null on every mission cancelled before notme-app's 0018 migration — there's
// no reliable way to backfill whether an old cancellation was an explicit
// click or the opportunistic expiry check firing while that screen happened
// to be open, so old rows just stay null rather than guessing.
export type MissionCancelledReason = 'requester' | 'timeout' | 'admin' | null;

export interface MissionDetail {
  id: string;
  category: string;
  address: string;
  rewardAmount: number;
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
  cancelledReason: MissionCancelledReason;
  requester: MissionParty;
  hero: MissionParty | null;
}

// "Created" precedes every real status; it's always done. Cancelled missions
// don't map onto this progression at all — render them separately.
export const TIMELINE_STEPS: { key: 'created' | MissionStatus; label: string }[] = [
  { key: 'created', label: 'Created' },
  { key: 'requested', label: 'Searching' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'on_the_way', label: 'On The Way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'completed', label: 'Completed' },
];
