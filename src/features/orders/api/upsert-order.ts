import { db } from '@/lib/db';
import type { Order } from '@/types/order.types';

export const upsertOrder = async (order: Order): Promise<Order> => {
  const updatedOrder: Order = {
    ...order,
    updatedAt: Date.now(),
  };

  await db.orders.put(updatedOrder);
  return updatedOrder;
};
