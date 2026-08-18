import { db } from '@/lib/db';
import type { SyncMessage } from '@/types/sync.types';
import type { Product } from '@/types/product.types';
import type { Order } from '@/types/order.types';
import type { StoreSettings } from '@/types/store.types';
import type { StoreTable } from '@/types/table.types';
import type { StockAdjustment } from '@/types/stock-adjustment.types';
import type {
  MasterCategory,
  MasterUom,
  MasterVariantAttribute,
  MasterModifierGroup,
  MasterDiscount,
  MasterTax,
} from '@/types/master-data.types';

export interface DatabaseBackup {
  version: number;
  exportedAt: number;
  products: Product[];
  orders: Order[];
  settings?: StoreSettings;
  tables?: StoreTable[];
  stockAdjustments?: StockAdjustment[];
  masterCategories?: MasterCategory[];
  masterUoms?: MasterUom[];
  masterVariantAttributes?: MasterVariantAttribute[];
  masterModifierGroups?: MasterModifierGroup[];
  masterDiscounts?: MasterDiscount[];
  masterTaxes?: MasterTax[];
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
  const [
    products,
    orders,
    settings,
    tables,
    stockAdjustments,
    masterCategories,
    masterUoms,
    masterVariantAttributes,
    masterModifierGroups,
    masterDiscounts,
    masterTaxes,
  ] = await Promise.all([
    db.products.toArray(),
    db.orders.toArray(),
    db.settings.toCollection().first(),
    db.restaurantTables.toArray(),
    db.stockAdjustments.toArray(),
    db.masterCategories.toArray(),
    db.masterUoms.toArray(),
    db.masterVariantAttributes.toArray(),
    db.masterModifierGroups.toArray(),
    db.masterDiscounts.toArray(),
    db.masterTaxes.toArray(),
  ]);

  return {
    version: 2,
    exportedAt: Date.now(),
    products,
    orders,
    settings,
    tables,
    stockAdjustments,
    masterCategories,
    masterUoms,
    masterVariantAttributes,
    masterModifierGroups,
    masterDiscounts,
    masterTaxes,
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

  if (Array.isArray(backup.tables)) {
    for (const tbl of backup.tables) {
      const local = await db.restaurantTables.get(tbl.id);
      if (!local || tbl.updatedAt > local.updatedAt) {
        await db.restaurantTables.put(tbl);
      }
    }
  }

  if (Array.isArray(backup.stockAdjustments)) {
    for (const adj of backup.stockAdjustments) {
      const local = await db.stockAdjustments.get(adj.id);
      if (!local || adj.updatedAt > local.updatedAt) {
        await db.stockAdjustments.put(adj);
      }
    }
  }

  if (Array.isArray(backup.masterCategories)) {
    for (const cat of backup.masterCategories) {
      const local = await db.masterCategories.get(cat.id);
      if (!local || cat.updatedAt > local.updatedAt) {
        await db.masterCategories.put(cat);
      }
    }
  }

  if (Array.isArray(backup.masterUoms)) {
    for (const uom of backup.masterUoms) {
      const local = await db.masterUoms.get(uom.id);
      if (!local || uom.updatedAt > local.updatedAt) {
        await db.masterUoms.put(uom);
      }
    }
  }

  if (Array.isArray(backup.masterVariantAttributes)) {
    for (const attr of backup.masterVariantAttributes) {
      const local = await db.masterVariantAttributes.get(attr.id);
      if (!local || attr.updatedAt > local.updatedAt) {
        await db.masterVariantAttributes.put(attr);
      }
    }
  }

  if (Array.isArray(backup.masterModifierGroups)) {
    for (const mod of backup.masterModifierGroups) {
      const local = await db.masterModifierGroups.get(mod.id);
      if (!local || mod.updatedAt > local.updatedAt) {
        await db.masterModifierGroups.put(mod);
      }
    }
  }

  if (Array.isArray(backup.masterDiscounts)) {
    for (const disc of backup.masterDiscounts) {
      const local = await db.masterDiscounts.get(disc.id);
      if (!local || disc.updatedAt > local.updatedAt) {
        await db.masterDiscounts.put(disc);
      }
    }
  }

  if (Array.isArray(backup.masterTaxes)) {
    for (const tax of backup.masterTaxes) {
      const local = await db.masterTaxes.get(tax.id);
      if (!local || tax.updatedAt > local.updatedAt) {
        await db.masterTaxes.put(tax);
      }
    }
  }

  return { productsCount, ordersCount };
};
