import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import {
  applySyncMessage,
  exportDatabaseToJson,
  importDatabaseFromJson,
} from '../sync-engine';
import { getOrCreateStoreSettings } from '../store-settings-api';
import type { Product } from '@/types/product.types';
import type { SyncMessage } from '@/types/sync.types';

describe('Sync Engine & Settings API', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.orders.clear();
    await db.settings.clear();
  });

  it('initializes default store settings when empty', async () => {
    const settings = await getOrCreateStoreSettings();
    expect(settings.id).toBeDefined();
    expect(settings.storeName).toBe('Toko Saya');
    expect(settings.passphrase.split(' ')).toHaveLength(12);

    // Subsequent call returns existing
    const again = await getOrCreateStoreSettings();
    expect(again.id).toBe(settings.id);
  });

  it('applies sync message using Last-Write-Wins (LWW)', async () => {
    const initialProduct: Product = {
      id: 'prod-sync-1',
      name: 'Roti Bakar',
      price: 15000,
      stock: 10,
      category: 'Makanan',
      createdAt: 1000,
      updatedAt: 1000,
      deletedAt: null,
    };
    await db.products.put(initialProduct);

    // 1. Incoming older message should be ignored
    const olderMessage: SyncMessage<Product> = {
      action: 'UPSERT',
      collection: 'products',
      data: { ...initialProduct, price: 12000, updatedAt: 500 },
      updatedAt: 500,
      deviceId: 'dev-peer-1',
    };
    const appliedOlder = await applySyncMessage(olderMessage);
    expect(appliedOlder).toBe(false);
    expect((await db.products.get('prod-sync-1'))?.price).toBe(15000);

    // 2. Incoming newer message should be written
    const newerMessage: SyncMessage<Product> = {
      action: 'UPSERT',
      collection: 'products',
      data: { ...initialProduct, price: 18000, updatedAt: 2000 },
      updatedAt: 2000,
      deviceId: 'dev-peer-1',
    };
    const appliedNewer = await applySyncMessage(newerMessage);
    expect(appliedNewer).toBe(true);
    expect((await db.products.get('prod-sync-1'))?.price).toBe(18000);
  });

  it('exports and imports database backup accurately', async () => {
    await db.products.put({
      id: 'p-backup-1',
      name: 'Espresso',
      price: 15000,
      stock: 20,
      category: 'Kopi',
      createdAt: 1000,
      updatedAt: 1000,
      deletedAt: null,
    });

    const backup = await exportDatabaseToJson();
    expect(backup.products).toHaveLength(1);
    expect(backup.products[0].name).toBe('Espresso');

    await db.products.clear();
    const result = await importDatabaseFromJson(backup);
    expect(result.productsCount).toBe(1);

    const restored = await db.products.get('p-backup-1');
    expect(restored?.name).toBe('Espresso');
  });
});
