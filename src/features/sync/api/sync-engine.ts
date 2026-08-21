import { db } from '@/lib/db';
import type { SyncMessage } from '@/types/sync.types';
import type { Product } from '@/types/product.types';
import type { Order } from '@/types/order.types';
import type { StoreSettings, Outlet, Staff } from '@/types/store.types';
import type { StoreTable } from '@/types/table.types';
import type { StockAdjustment } from '@/types/stock-adjustment.types';
import type { Expense } from '@/types/expense.types';
import type { Customer } from '@/types/customer.types';
import type { Supplier } from '@/types/supplier.types';
import type { Shift, CashMovement } from '@/types/shift.types';
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
  expenses?: Expense[];
  customers?: Customer[];
  suppliers?: Supplier[];
  outlets?: Outlet[];
  staff?: Staff[];
  shifts?: Shift[];
  cashMovements?: CashMovement[];
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
    expenses,
    customers,
    suppliers,
    outlets,
    staff,
    shifts,
    cashMovements,
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
    db.expenses.toArray(),
    db.customers.toArray(),
    db.suppliers.toArray(),
    db.outlets.toArray(),
    db.staff.toArray(),
    db.shifts.toArray(),
    db.cashMovements.toArray(),
  ]);

  return {
    version: 3,
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
    expenses,
    customers,
    suppliers,
    outlets,
    staff,
    shifts,
    cashMovements,
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

  if (Array.isArray(backup.expenses)) {
    for (const exp of backup.expenses) {
      const local = await db.expenses.get(exp.id);
      if (!local || exp.updatedAt > local.updatedAt) {
        await db.expenses.put(exp);
      }
    }
  }

  if (Array.isArray(backup.customers)) {
    for (const cust of backup.customers) {
      const local = await db.customers.get(cust.id);
      if (!local || cust.updatedAt > local.updatedAt) {
        await db.customers.put(cust);
      }
    }
  }

  if (Array.isArray(backup.suppliers)) {
    for (const sup of backup.suppliers) {
      const local = await db.suppliers.get(sup.id);
      if (!local || sup.updatedAt > local.updatedAt) {
        await db.suppliers.put(sup);
      }
    }
  }

  if (Array.isArray(backup.outlets)) {
    for (const out of backup.outlets) {
      const local = await db.outlets.get(out.id);
      if (!local || out.updatedAt > local.updatedAt) {
        await db.outlets.put(out);
      }
    }
  }

  if (Array.isArray(backup.staff)) {
    for (const st of backup.staff) {
      const local = await db.staff.get(st.id);
      if (!local || st.updatedAt > local.updatedAt) {
        await db.staff.put(st);
      }
    }
  }

  if (Array.isArray(backup.shifts)) {
    for (const sh of backup.shifts) {
      const local = await db.shifts.get(sh.id);
      if (!local || sh.updatedAt > local.updatedAt) {
        await db.shifts.put(sh);
      }
    }
  }

  if (Array.isArray(backup.cashMovements)) {
    for (const cm of backup.cashMovements) {
      const local = await db.cashMovements.get(cm.id);
      if (!local || cm.updatedAt > local.updatedAt) {
        await db.cashMovements.put(cm);
      }
    }
  }

  return { productsCount, ordersCount };
};
