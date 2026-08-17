import { db } from '@/lib/db';
import type { Order } from '@/types/order.types';

export const getOrders = async (): Promise<Order[]> => {
  return await db.orders
    .filter((order) => order.deletedAt === null)
    .reverse()
    .sortBy('createdAt');
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const order = await db.orders.get(id);
  if (order && order.deletedAt === null) {
    return order;
  }
  return undefined;
};
