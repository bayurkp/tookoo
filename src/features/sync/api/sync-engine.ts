import { db } from '@/lib/db';
import type { SyncMessage } from '@/types/sync.types';
import type { Product } from '@/types/product.types';
import type { Order } from '@/types/order.types';
import type { StoreSettings } from '@/types/store.types';

export interface DatabaseBackup {
  version: number;
  exportedAt: number;
  products: Product[];
  orders: Order[];
  settings?: StoreSettings;
}

export const applySyncMessage = async (msg: SyncMessage): Promise<boolean> => {
  if (msg.collection === 'products') {
    const product = msg.data as Product;
    const local = await db.products.get(product.id);
    if (!local || msg.updatedAt > local.updatedAt) {
      await db.products.put(product);
      return true;
    }
    return false;
  }

  if (msg.collection === 'orders') {
    const order = msg.data as Order;
    const local = await db.orders.get(order.id);
    if (!local || msg.updatedAt > local.updatedAt) {
      await db.orders.put(order);
      return true;
    }
    return false;
  }

  if (msg.collection === 'settings') {
    const settings = msg.data as StoreSettings;
    const local = await db.settings.get(settings.id);
    if (!local || msg.updatedAt > local.updatedAt) {
      await db.settings.put(settings);
      return true;
    }
    return false;
  }

  return false;
};

export const exportDatabaseToJson = async (): Promise<DatabaseBackup> => {
  const products = await db.products.toArray();
  const orders = await db.orders.toArray();
  const settings = await db.settings.toCollection().first();

  return {
    version: 1,
    exportedAt: Date.now(),
    products,
    orders,
    settings,
  };
};

export const importDatabaseFromJson = async (
  backup: DatabaseBackup
): Promise<{ productsCount: number; ordersCount: number }> => {
  let productsCount = 0;
  let ordersCount = 0;

  if (Array.isArray(backup.products)) {
    for (const prod of backup.products) {
      const local = await db.products.get(prod.id);
      if (!local || prod.updatedAt > local.updatedAt) {
        await db.products.put(prod);
        productsCount++;
      }
    }
  }

  if (Array.isArray(backup.orders)) {
    for (const ord of backup.orders) {
      const local = await db.orders.get(ord.id);
      if (!local || ord.updatedAt > local.updatedAt) {
        await db.orders.put(ord);
        ordersCount++;
      }
    }
  }

  if (backup.settings) {
    const local = await db.settings.get(backup.settings.id);
    if (!local || backup.settings.updatedAt > local.updatedAt) {
      await db.settings.put(backup.settings);
    }
  }

  return { productsCount, ordersCount };
};
