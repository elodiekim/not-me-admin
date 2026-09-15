import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approveHero, fetchUserById, fetchUsers, setUserActive, type UserFilters } from './api';

export const userKeys = {
  list: (filters: UserFilters, page: number) => ['users', 'list', filters, page] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsers(filters: UserFilters, page: number) {
  return useQuery({ queryKey: userKeys.list(filters, page), queryFn: () => fetchUsers(filters, page) });
}

export function useUser(id: string) {
  return useQuery({ queryKey: userKeys.detail(id), queryFn: () => fetchUserById(id) });
}

export function useSetUserActive(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) => setUserActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

export function useApproveHero(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => approveHero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}
