import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStaffList,
  getStaff,
  upsertStaff,
  deleteStaff,
  setActiveStaffId,
} from '@/features/staff/api/staff-api';
import { db } from '@/lib/db';
import type { Staff } from '@/types/store.types';
import { hasOutletAccess } from '@/types/store.types';

export const STAFF_QUERY_KEY = ['staff'];

/**
 * Hook to fetch all active staff.
 */
export function useStaffList() {
  return useQuery<Staff[]>({
    queryKey: STAFF_QUERY_KEY,
    queryFn: getStaffList,
  });
}

/**
 * Hook to fetch a single staff by ID.
 */
export function useStaff(id?: string) {
  return useQuery<Staff | null>({
    queryKey: ['staff', id],
    queryFn: () => (id ? getStaff(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch the currently active logged-in staff on this terminal.
 */
export function useActiveStaff() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await db.settings.toCollection().first()) || null,
  });

  const { data: staffList = [], isLoading } = useStaffList();

  const activeStaff =
    staffList.find((s) => s.id === settings?.activeStaffId) || staffList[0] || null;

  return {
    activeStaff,
    staffList,
    isLoading,
  };
}

/**
 * Hook to fetch staff who have access to a specific outlet.
 */
export function useOutletStaff(outletId?: string) {
  const { data: staffList = [], isLoading } = useStaffList();

  const eligibleStaff = outletId
    ? staffList.filter((s) => s.isActive && hasOutletAccess(s, outletId))
    : staffList.filter((s) => s.isActive);

  return {
    staffList: eligibleStaff,
    isLoading,
  };
}

/**
 * Mutation to upsert staff.
 */
export function useUpsertStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Mutation to delete staff.
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Mutation to set active staff on terminal.
 */
export function useSetActiveStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setActiveStaffId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
    },
  });
}
