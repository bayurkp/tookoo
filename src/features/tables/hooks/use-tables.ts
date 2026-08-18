import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTables,
  upsertTable,
  bulkUpsertTables,
  updateTableStatus,
  deleteTable,
} from '../api/tables-api';
import type { StoreTable, TableStatus } from '@/types/table.types';

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: getTables,
  });
}

export function useUpsertTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useBulkUpsertTables() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tables: StoreTable[]) => bulkUpsertTables(tables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      orderMeta,
    }: {
      id: string;
      status: TableStatus;
      orderMeta?: {
        orderId?: string | null;
        customerName?: string | null;
        orderTotal?: number | null;
      };
    }) => updateTableStatus(id, status, orderMeta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}
