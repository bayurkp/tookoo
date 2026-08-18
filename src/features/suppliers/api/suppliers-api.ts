import { db } from '@/lib/db';
import type { Supplier } from '@/types/supplier.types';
import { generateUUID } from '@/utils/uuid';

export async function getSuppliers(): Promise<Supplier[]> {
  const items = await db.suppliers
    .filter((s) => s.deletedAt === null)
    .reverse()
    .sortBy('createdAt');
  return items;
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const item = await db.suppliers.get(id);
  if (!item || item.deletedAt !== null) return null;
  return item;
}

export async function upsertSupplier(
  supplier: Partial<Supplier> & { name: string; phone: string }
): Promise<Supplier> {
  const now = Date.now();
  const id = supplier.id || generateUUID();

  const existing = await db.suppliers.get(id);

  const payload: Supplier = {
    id,
    name: supplier.name.trim(),
    contactPerson: supplier.contactPerson?.trim() || undefined,
    phone: supplier.phone.trim(),
    email: supplier.email?.trim() || undefined,
    address: supplier.address?.trim() || undefined,
    suppliedItems: supplier.suppliedItems?.trim() || undefined,
    paymentTerms: supplier.paymentTerms?.trim() || undefined,
    notes: supplier.notes?.trim() || undefined,
    createdAt: existing?.createdAt || supplier.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.suppliers.put(payload);
  return payload;
}

export async function deleteSupplier(id: string): Promise<void> {
  const existing = await db.suppliers.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.suppliers.update(id, {
    deletedAt: now,
    updatedAt: now,
  });
}
