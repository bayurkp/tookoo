import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomers,
  getCustomer,
  upsertCustomer,
  deleteCustomer,
} from '@/features/customers/api/customers-api';
import type { Customer } from '@/types/customer.types';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => getCustomer(id),
    enabled: Boolean(id),
  });
}

export function useUpsertCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customer: Partial<Customer> & { name: string; phone: string }) =>
      upsertCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
