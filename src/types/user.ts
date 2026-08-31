import type { MissionStatus } from './mission';

// Server-set only (notme-app's 0019 migration) — never taken from client
// input, so it can't be spoofed. Null when the account is active.
export type DeactivatedReason = 'self' | 'admin' | null;

export interface UserListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  joinDate: string;
  totalRequests: number;
  isActive: boolean;
  deactivatedReason: DeactivatedReason;
}

export interface MissionHistoryEntry {
  id: string;
  category: string;
  status: MissionStatus;
  createdAt: string;
}

export interface ReviewWrittenEntry {
  id: string;
  heroName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  joinDate: string;
  isActive: boolean;
  deactivatedReason: DeactivatedReason;
  asRequester: {
    totalRequests: number;
    cancellations: number;
    missionHistory: MissionHistoryEntry[];
    reviewsWritten: ReviewWrittenEntry[];
  };
  asHero: {
    missionsCompleted: number;
    heroRating: number | null;
    heroReviewCount: number;
  };
}
