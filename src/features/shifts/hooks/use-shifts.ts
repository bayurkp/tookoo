import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActiveShift,
  openShift,
  closeShift,
  getShiftHistory,
  getShiftById,
} from '../api/shifts-api';
import { recordCashMovement, getCashMovementsByShift } from '../api/cash-movements-api';
import type {
  OpenShiftPayload,
  CloseShiftPayload,
  RecordCashMovementPayload,
} from '@/types/shift.types';
import { sounds } from '@/utils/audio';

export const SHIFTS_QUERY_KEYS = {
  active: (outletId?: string) => ['shifts', 'active', outletId] as const,
  history: (outletId?: string) => ['shifts', 'history', outletId] as const,
  detail: (id: string) => ['shifts', 'detail', id] as const,
  movements: (shiftId?: string) => ['shifts', 'movements', shiftId] as const,
};

/**
 * Query hook for currently active shift
 */
export const useActiveShift = (outletId?: string) => {
  return useQuery({
    queryKey: SHIFTS_QUERY_KEYS.active(outletId),
    queryFn: () => getActiveShift(outletId),
    staleTime: 5000,
  });
};

/**
 * Query hook for shift history
 */
export const useShiftHistory = (options?: { outletId?: string; limit?: number }) => {
  return useQuery({
    queryKey: SHIFTS_QUERY_KEYS.history(options?.outletId),
    queryFn: () => getShiftHistory(options),
  });
};

/**
 * Query hook for single shift detail
 */
export const useShiftById = (id?: string) => {
  return useQuery({
    queryKey: SHIFTS_QUERY_KEYS.detail(id || ''),
    queryFn: () => (id ? getShiftById(id) : null),
    enabled: Boolean(id),
  });
};

/**
 * Query hook for cash movements of a specific shift
 */
export const useCashMovements = (shiftId?: string) => {
  return useQuery({
    queryKey: SHIFTS_QUERY_KEYS.movements(shiftId),
    queryFn: () => (shiftId ? getCashMovementsByShift(shiftId) : []),
    enabled: Boolean(shiftId),
  });
};

/**
 * Mutation hook for opening a new shift
 */
export const useOpenShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OpenShiftPayload) => openShift(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      sounds.playSuccess();
    },
    onError: () => {
      sounds.playAlert();
    },
  });
};

/**
 * Mutation hook for closing active shift
 */
export const useCloseShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CloseShiftPayload) => closeShift(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      sounds.playSuccess();
    },
    onError: () => {
      sounds.playAlert();
    },
  });
};

/**
 * Mutation hook for recording paid in / paid out cash movements
 */
export const useRecordCashMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordCashMovementPayload) => recordCashMovement(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: SHIFTS_QUERY_KEYS.movements(variables.shiftId) });
      sounds.playSuccess();
    },
    onError: () => {
      sounds.playAlert();
    },
  });
};
