import Dexie, { type Table } from 'dexie';
import type { Product } from '@/types/product.types';
import type { Order } from '@/types/order.types';
import type { StoreSettings } from '@/types/store.types';
import type { StockAdjustment } from '@/types/stock-adjustment.types';

export class TookooDatabase extends Dexie {
  products!: Table<Product, string>;
  orders!: Table<Order, string>;
  settings!: Table<StoreSettings, string>;
  stockAdjustments!: Table<StockAdjustment, string>;

  constructor() {
    super('TookooDB');

    this.version(1).stores({
      products: 'id, name, category, price, stock, createdAt, updatedAt, deletedAt',
      orders:
        'id, orderNumber, totalAmount, paymentMethod, cashierName, createdAt, updatedAt, deletedAt',
      settings: 'id, storeName, passphrase, createdAt, updatedAt, deletedAt',
      stockAdjustments: 'id, adjustmentNumber, adjustedBy, createdAt, updatedAt, deletedAt',
    });
  }
}

export const db = new TookooDatabase();
