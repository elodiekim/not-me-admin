import { useQuery } from '@tanstack/react-query';
import {
  fetchAverageHeroRating,
  fetchMissionStats,
  fetchMissionsOverTime,
  fetchSignupsOverTime,
  type StatsPeriod,
} from './api';

export function useMissionStats(period: StatsPeriod) {
  return useQuery({ queryKey: ['statistics', 'missions', period], queryFn: () => fetchMissionStats(period) });
}

export function useStatsAverageHeroRating(period: StatsPeriod) {
  return useQuery({
    queryKey: ['statistics', 'avg-hero-rating', period],
    queryFn: () => fetchAverageHeroRating(period),
  });
}

export function useSignupsOverTime(period: StatsPeriod) {
  return useQuery({ queryKey: ['statistics', 'signups', period], queryFn: () => fetchSignupsOverTime(period) });
}

export function useMissionsOverTime(period: StatsPeriod) {
  return useQuery({
    queryKey: ['statistics', 'missions-over-time', period],
    queryFn: () => fetchMissionsOverTime(period),
  });
}
