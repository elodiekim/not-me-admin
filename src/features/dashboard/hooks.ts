import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAverageHeroRating,
  fetchMissionStatusCounts,
  fetchRecentMissions,
  fetchSearchingAlerts,
  fetchTotalUsers,
} from './api';

export const dashboardKeys = {
  statusCounts: ['dashboard', 'mission-status-counts'] as const,
  totalUsers: ['dashboard', 'total-users'] as const,
  avgHeroRating: ['dashboard', 'avg-hero-rating'] as const,
  searchingAlerts: ['dashboard', 'searching-alerts'] as const,
  recentMissions: ['dashboard', 'recent-missions'] as const,
};

export function useMissionStatusCounts() {
  return useQuery({ queryKey: dashboardKeys.statusCounts, queryFn: fetchMissionStatusCounts });
}

export function useTotalUsers() {
  return useQuery({ queryKey: dashboardKeys.totalUsers, queryFn: fetchTotalUsers });
}

export function useAverageHeroRating() {
  return useQuery({ queryKey: dashboardKeys.avgHeroRating, queryFn: fetchAverageHeroRating });
}

export function useSearchingAlerts() {
  return useQuery({ queryKey: dashboardKeys.searchingAlerts, queryFn: fetchSearchingAlerts });
}

export function useRecentMissions() {
  return useQuery({ queryKey: dashboardKeys.recentMissions, queryFn: () => fetchRecentMissions() });
}

export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  return () => {
    Object.values(dashboardKeys).forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
  };
}
