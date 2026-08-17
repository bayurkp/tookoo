import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrderById } from '../api/get-orders';
import { upsertOrder } from '../api/upsert-order';
import type { Order } from '@/types/order.types';

export const useOrders = () => {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
};

export const useOrder = (id: string) => {
  return useQuery<Order | undefined>({
    queryKey: ['orders', id],
    queryFn: () => getOrderById(id),
    enabled: Boolean(id),
  });
};

export const useUpsertOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: Order) => upsertOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
