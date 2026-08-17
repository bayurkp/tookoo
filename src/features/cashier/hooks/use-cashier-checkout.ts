import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, type CreateOrderInput } from '@/features/orders/api/create-order';
import { useCartStore } from '../stores/cart-store';
import type { Order } from '@/types/order.types';

export const useCashierCheckout = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: async (input: CreateOrderInput) => {
      const order = await createOrder(input);
      return order;
    },
    onSuccess: () => {
      // Invalidate both orders and products caches
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      clearCart();
    },
  });
};
