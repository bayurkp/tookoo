import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSuppliers,
  getSupplier,
  upsertSupplier,
  deleteSupplier,
} from '@/features/suppliers/api/suppliers-api';
import type { Supplier } from '@/types/supplier.types';

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => getSupplier(id),
    enabled: Boolean(id),
  });
}

export function useUpsertSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supplier: Partial<Supplier> & { name: string; phone: string }) =>
      upsertSupplier(supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
