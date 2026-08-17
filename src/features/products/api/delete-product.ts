import { db } from '@/lib/db';

export const deleteProduct = async (id: string): Promise<void> => {
  const existing = await db.products.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.products.update(id, {
    deletedAt: now,
    updatedAt: now,
  });
};
