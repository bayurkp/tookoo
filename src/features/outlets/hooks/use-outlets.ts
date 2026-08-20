import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOutlets,
  getOutlet,
  upsertOutlet,
  deleteOutlet,
  setActiveOutletId,
} from '@/features/outlets/api/outlets-api';
import { db } from '@/lib/db';
import type { Outlet } from '@/types/store.types';

export const OUTLETS_QUERY_KEY = ['outlets'];

/**
 * Hook to fetch all active outlets.
 */
export function useOutlets() {
  return useQuery<Outlet[]>({
    queryKey: OUTLETS_QUERY_KEY,
    queryFn: getOutlets,
  });
}

/**
 * Hook to fetch a single outlet by ID.
 */
export function useOutlet(id?: string) {
  return useQuery<Outlet | null>({
    queryKey: ['outlets', id],
    queryFn: () => (id ? getOutlet(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch the currently active outlet on this terminal.
 */
export function useActiveOutlet() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await db.settings.toCollection().first()) || null,
  });

  const { data: outlets = [], isLoading } = useOutlets();

  const activeOutlet = outlets.find((o) => o.id === settings?.activeOutletId) || outlets[0] || null;

  return {
    activeOutlet,
    outlets,
    isLoading,
  };
}

/**
 * Mutation to upsert an outlet.
 */
export function useUpsertOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertOutlet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUTLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Mutation to delete an outlet.
 */
export function useDeleteOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOutlet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUTLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Mutation to switch the active outlet on this terminal.
 */
export function useSetActiveOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setActiveOutletId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: OUTLETS_QUERY_KEY });
    },
  });
}
