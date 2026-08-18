import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import {
  getDataSummary,
  clearOrdersData,
  clearProductsAndStockData,
  clearTablesData,
  clearDiscountsAndTaxesData,
  resetMasterDataToDefaults,
  resetFullDatabase,
} from '../data-management-api';

describe('Data Management API', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
    await db.restaurantTables.clear();
    await db.masterDiscounts.clear();
    await db.masterTaxes.clear();
    await db.stockAdjustments.clear();
  });

  it('calculates data summary counts accurately', async () => {
    await db.orders.put({
      id: 'ord-1',
      orderNumber: 'TK-001',
      items: [],
      subtotal: 10000,
      discount: 0,
      totalAmount: 10000,
      paymentMethod: 'CASH',
      amountPaid: 10000,
      changeDue: 0,
      cashierName: 'Kasir',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    await db.products.put({
      id: 'p-1',
      name: 'Kopi Susu',
      category: 'Minuman',
      price: 15000,
      stock: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    const summary = await getDataSummary();
    expect(summary.ordersCount).toBe(1);
    expect(summary.productsCount).toBe(1);
    expect(summary.totalRecords).toBeGreaterThanOrEqual(2);
  });

  it('clears orders data', async () => {
    await db.orders.put({
      id: 'ord-1',
      orderNumber: 'TK-001',
      items: [],
      subtotal: 10000,
      discount: 0,
      totalAmount: 10000,
      paymentMethod: 'CASH',
      amountPaid: 10000,
      changeDue: 0,
      cashierName: 'Kasir',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    const res = await clearOrdersData();
    expect(res.deletedCount).toBe(1);
    expect(await db.orders.count()).toBe(0);
  });

  it('clears products and stock adjustment data', async () => {
    await db.products.put({
      id: 'p-1',
      name: 'Kopi Susu',
      category: 'Minuman',
      price: 15000,
      stock: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    await db.stockAdjustments.put({
      id: 'adj-1',
      adjustmentNumber: 'ADJ-001',
      adjustedBy: 'Kasir',
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    const res = await clearProductsAndStockData();
    expect(res.productsCount).toBe(1);
    expect(res.adjustmentsCount).toBe(1);
    expect(await db.products.count()).toBe(0);
    expect(await db.stockAdjustments.count()).toBe(0);
  });

  it('clears tables and promo data', async () => {
    await db.restaurantTables.put({
      id: 'tbl-1',
      name: 'Meja 1',
      zone: 'Indoor',
      shape: 'RECTANGLE',
      capacity: 4,
      status: 'AVAILABLE',
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    await db.masterDiscounts.put({
      id: 'disc-1',
      name: 'Promo 10%',
      type: 'PERCENTAGE',
      value: 10,
      scope: 'ALL_PRODUCTS',
      isActive: true,
      hasExpiry: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    expect((await clearTablesData()).deletedCount).toBe(1);
    expect(await db.restaurantTables.count()).toBe(0);

    const promoRes = await clearDiscountsAndTaxesData();
    expect(promoRes.discountsCount).toBe(1);
    expect(await db.masterDiscounts.count()).toBe(0);
  });

  it('resets master data and full database', async () => {
    await resetMasterDataToDefaults();
    expect(await db.masterCategories.count()).toBeGreaterThan(0);
    expect(await db.masterUoms.count()).toBeGreaterThan(0);
    expect(await db.restaurantTables.count()).toBeGreaterThan(0);

    await resetFullDatabase({ newStoreName: 'Toko Baru' });
    const settings = await db.settings.toArray();
    expect(settings).toHaveLength(1);
    expect(settings[0].storeName).toBe('Toko Baru');
  });
});
