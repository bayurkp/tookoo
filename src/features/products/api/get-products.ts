import { db } from '@/lib/db';
import type { Product } from '@/types/product.types';

export const getProducts = async (): Promise<Product[]> => {
  return await db.products
    .filter((product) => product.deletedAt === null)
    .reverse()
    .sortBy('createdAt');
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const product = await db.products.get(id);
  if (product && product.deletedAt === null) {
    return product;
  }
  return undefined;
};
