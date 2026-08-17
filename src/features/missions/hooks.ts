import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelMission, fetchMissionById, fetchMissionCategories, fetchMissions, type MissionFilters } from './api';
import { dashboardKeys } from '../dashboard/hooks';

export const missionKeys = {
  list: (filters: MissionFilters, page: number) => ['missions', 'list', filters, page] as const,
  categories: ['missions', 'categories'] as const,
  detail: (id: string) => ['missions', 'detail', id] as const,
};

export function useMissions(filters: MissionFilters, page: number) {
  return useQuery({
    queryKey: missionKeys.list(filters, page),
    queryFn: () => fetchMissions(filters, page),
  });
}

export function useMissionCategories() {
  return useQuery({ queryKey: missionKeys.categories, queryFn: fetchMissionCategories });
}

export function useMission(id: string) {
  return useQuery({ queryKey: missionKeys.detail(id), queryFn: () => fetchMissionById(id) });
}

export function useCancelMission(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelMission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['missions', 'list'] });
      Object.values(dashboardKeys).forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
