import {
  db,
  DEFAULT_MASTER_CATEGORIES,
  DEFAULT_MASTER_UOMS,
  DEFAULT_MASTER_VARIANT_ATTRIBUTES,
  DEFAULT_MASTER_MODIFIER_GROUPS,
  DEFAULT_MASTER_DISCOUNTS,
  DEFAULT_MASTER_TAXES,
  DEFAULT_STORE_TABLES,
} from '@/lib/db';
import { generatePassphrase, generateStoreSecretKey } from '@/lib/passphrase';
import { DEFAULT_CURRENCY } from '@/utils/currency-config';
import type { StoreSettings } from '@/types/store.types';

export interface DataManagementSummary {
  ordersCount: number;
  productsCount: number;
  stockAdjustmentsCount: number;
  tablesCount: number;
  categoriesCount: number;
  uomsCount: number;
  variantAttributesCount: number;
  modifierGroupsCount: number;
  discountsCount: number;
  taxesCount: number;
  totalRecords: number;
}

export type DataCountSummary = DataManagementSummary;

/**
 * Fetch total record counts across all local IndexedDB tables
 */
export const getDatabaseSummary = async (): Promise<DataManagementSummary> => {
  const [
    ordersCount,
    productsCount,
    stockAdjustmentsCount,
    tablesCount,
    categoriesCount,
    uomsCount,
    variantAttributesCount,
    modifierGroupsCount,
    discountsCount,
    taxesCount,
  ] = await Promise.all([
    db.orders.count(),
    db.products.count(),
    db.stockAdjustments.count(),
    db.restaurantTables.count(),
    db.masterCategories.count(),
    db.masterUoms.count(),
    db.masterVariantAttributes.count(),
    db.masterModifierGroups.count(),
    db.masterDiscounts.count(),
    db.masterTaxes.count(),
  ]);

  const totalRecords =
    ordersCount +
    productsCount +
    stockAdjustmentsCount +
    tablesCount +
    categoriesCount +
    uomsCount +
    variantAttributesCount +
    modifierGroupsCount +
    discountsCount +
    taxesCount;

  return {
    ordersCount,
    productsCount,
    stockAdjustmentsCount,
    tablesCount,
    categoriesCount,
    uomsCount,
    variantAttributesCount,
    modifierGroupsCount,
    discountsCount,
    taxesCount,
    totalRecords,
  };
};

export const getDataSummary = getDatabaseSummary;

/**
 * Clear only orders & transaction history
 */
export const clearOrdersData = async (): Promise<{ deletedCount: number }> => {
  const count = await db.orders.count();
  await db.orders.clear();
  return { deletedCount: count };
};

/**
 * Clear products catalog and stock adjustment history
 */
export const clearProductsAndStockData = async (): Promise<{
  productsCount: number;
  adjustmentsCount: number;
}> => {
  const productsCount = await db.products.count();
  const adjustmentsCount = await db.stockAdjustments.count();

  await db.products.clear();
  await db.stockAdjustments.clear();

  return { productsCount, adjustmentsCount };
};

/**
 * Clear floor plan & store tables
 */
export const clearTablesData = async (): Promise<{ deletedCount: number }> => {
  const count = await db.restaurantTables.count();
  await db.restaurantTables.clear();
  return { deletedCount: count };
};

/**
 * Clear master discounts and taxes
 */
export const clearDiscountsAndTaxesData = async (): Promise<{
  discountsCount: number;
  taxesCount: number;
}> => {
  const discountsCount = await db.masterDiscounts.count();
  const taxesCount = await db.masterTaxes.count();

  await db.masterDiscounts.clear();
  await db.masterTaxes.clear();

  return { discountsCount, taxesCount };
};

/**
 * Reset all master catalog data back to default templates
 */
export const resetMasterDataToDefaults = async (): Promise<void> => {
  await db.transaction(
    'rw',
    [
      db.masterCategories,
      db.masterUoms,
      db.masterVariantAttributes,
      db.masterModifierGroups,
      db.masterDiscounts,
      db.masterTaxes,
      db.restaurantTables,
    ],
    async () => {
      await db.masterCategories.clear();
      await db.masterUoms.clear();
      await db.masterVariantAttributes.clear();
      await db.masterModifierGroups.clear();
      await db.masterDiscounts.clear();
      await db.masterTaxes.clear();
      await db.restaurantTables.clear();

      const now = Date.now();
      await db.masterCategories.bulkPut(
        DEFAULT_MASTER_CATEGORIES.map((c) => ({
          ...c,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }))
      );

      await db.masterUoms.bulkPut(
        DEFAULT_MASTER_UOMS.map((u) => ({
          ...u,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }))
      );

      await db.masterVariantAttributes.bulkPut(
        DEFAULT_MASTER_VARIANT_ATTRIBUTES.map((v) => ({
          ...v,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }))
      );

      await db.masterModifierGroups.bulkPut(
        DEFAULT_MASTER_MODIFIER_GROUPS.map((m) => ({
          ...m,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }))
      );

      await db.masterDiscounts.bulkPut(
        DEFAULT_MASTER_DISCOUNTS.map((d) => ({
          ...d,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }))
      );

      await db.masterTaxes.bulkPut(
        DEFAULT_MASTER_TAXES.map((t) => ({
          ...t,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }))
      );

      await db.restaurantTables.bulkPut(
        DEFAULT_STORE_TABLES.map((t) => ({
          ...t,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }))
      );
    }
  );
};

/**
 * Full Factory Reset: Wipes all IndexedDB data and re-initializes store defaults
 */
export const resetFullDatabase = async (options?: {
  newStoreName?: string;
  reseedMasterDefaults?: boolean;
}): Promise<void> => {
  await db.transaction(
    'rw',
    [
      db.orders,
      db.products,
      db.stockAdjustments,
      db.restaurantTables,
      db.masterCategories,
      db.masterUoms,
      db.masterVariantAttributes,
      db.masterModifierGroups,
      db.masterDiscounts,
      db.masterTaxes,
      db.settings,
    ],
    async () => {
      // Clear all transactional and master tables
      await db.orders.clear();
      await db.products.clear();
      await db.stockAdjustments.clear();
      await db.restaurantTables.clear();
      await db.masterCategories.clear();
      await db.masterUoms.clear();
      await db.masterVariantAttributes.clear();
      await db.masterModifierGroups.clear();
      await db.masterDiscounts.clear();
      await db.masterTaxes.clear();
      await db.settings.clear();

      const now = Date.now();

      // Create new initial settings
      const newSettings: StoreSettings = {
        id: crypto.randomUUID(),
        storeName: options?.newStoreName?.trim() || 'Tookoo Store',
        passphrase: generatePassphrase(),
        storeSecretKey: generateStoreSecretKey(),
        currency: DEFAULT_CURRENCY,
        soundEnabled: true,
        autoPrint: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      await db.settings.put(newSettings);

      // Reseed master template catalog if selected
      if (options?.reseedMasterDefaults !== false) {
        await db.masterCategories.bulkPut(
          DEFAULT_MASTER_CATEGORIES.map((c) => ({
            ...c,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );

        await db.masterUoms.bulkPut(
          DEFAULT_MASTER_UOMS.map((u) => ({
            ...u,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );

        await db.masterVariantAttributes.bulkPut(
          DEFAULT_MASTER_VARIANT_ATTRIBUTES.map((v) => ({
            ...v,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );

        await db.masterModifierGroups.bulkPut(
          DEFAULT_MASTER_MODIFIER_GROUPS.map((m) => ({
            ...m,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );

        await db.masterDiscounts.bulkPut(
          DEFAULT_MASTER_DISCOUNTS.map((d) => ({
            ...d,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );

        await db.masterTaxes.bulkPut(
          DEFAULT_MASTER_TAXES.map((t) => ({
            ...t,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );

        await db.restaurantTables.bulkPut(
          DEFAULT_STORE_TABLES.map((t) => ({
            ...t,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );
      }
    }
  );
};
