import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, type CreateOrderInput } from '@/features/orders/api/create-order';
import { useCartStore } from '../stores/cart-store';
import { p2pEngine } from '@/lib/webrtc';
import { db } from '@/lib/db';
import type { Order } from '@/types/order.types';

export const useCashierCheckout = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: async (input: CreateOrderInput) => {
      const order = await createOrder(input);
      return order;
    },
    onSuccess: async (order) => {
      // Invalidate both orders and products caches locally
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      clearCart();

      // Broadcast order to all connected peers
      const settings = await db.settings.toCollection().first();
      const deviceId = settings?.id || 'host-device';

      p2pEngine.broadcast({
        action: 'UPSERT',
        collection: 'orders',
        data: order,
        updatedAt: order.updatedAt,
        deviceId,
      });

      // Broadcast updated product stocks for each cart item
      for (const item of order.items) {
        const updatedProduct = await db.products.get(item.productId);
        if (updatedProduct) {
          p2pEngine.broadcast({
            action: 'UPSERT',
            collection: 'products',
            data: updatedProduct,
            updatedAt: updatedProduct.updatedAt,
            deviceId,
          });
        }
      }
    },
  });
};
