import type { MissionStatus } from './mission';

export interface UserListItem {
  id: string;
  name: string;
  phone: string | null;
  joinDate: string;
  totalRequests: number;
  isActive: boolean;
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
  phone: string | null;
  joinDate: string;
  isActive: boolean;
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
