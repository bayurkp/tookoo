import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { getProducts, getProductById } from '../get-products';
import { upsertProduct } from '../upsert-product';
import { deleteProduct } from '../delete-product';
import type { Product } from '@/types/product.types';

describe('Products API Layer', () => {
  beforeEach(async () => {
    await db.products.clear();
  });

  it('inserts and retrieves active products', async () => {
    const newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> = {
      name: 'Kopi Susu Gula Aren',
      price: 18000,
      stock: 50,
      category: 'Minuman',
    };

    const saved = await upsertProduct(newProduct);
    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
    expect(saved.deletedAt).toBeNull();

    const products = await getProducts();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Kopi Susu Gula Aren');

    const byId = await getProductById(saved.id);
    expect(byId?.price).toBe(18000);
  });

  it('updates existing product', async () => {
    const item = await upsertProduct({
      name: 'Roti Bakar',
      price: 15000,
      stock: 10,
      category: 'Makanan',
    });

    const updated = await upsertProduct({
      ...item,
      price: 17000,
    });

    expect(updated.id).toBe(item.id);
    expect(updated.price).toBe(17000);
    expect(updated.updatedAt).toBeGreaterThanOrEqual(item.updatedAt);
  });

  it('soft deletes a product by setting deletedAt', async () => {
    const item = await upsertProduct({
      name: 'Teh Manis',
      price: 5000,
      stock: 100,
      category: 'Minuman',
    });

    await deleteProduct(item.id);

    // Should not appear in active getProducts query
    const activeProducts = await getProducts();
    expect(activeProducts).toHaveLength(0);

    // But record still exists in Dexie with deletedAt timestamp
    const rawRecord = await db.products.get(item.id);
    expect(rawRecord?.deletedAt).not.toBeNull();
  });
});
