import { db } from '@/lib/db';
import { generateUUID } from '@/utils/uuid';
import type { Product } from '@/types/product.types';

export type UpsertProductInput =
  | (Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> & { id?: string })
  | Product;

export const upsertProduct = async (input: UpsertProductInput): Promise<Product> => {
  const now = Date.now();
  let productToSave: Product;

  if ('id' in input && input.id) {
    const existing = await db.products.get(input.id);
    productToSave = {
      ...existing,
      ...input,
      id: input.id,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      deletedAt: null,
    };
  } else {
    productToSave = {
      ...input,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  }

  await db.products.put(productToSave);
  return productToSave;
};
