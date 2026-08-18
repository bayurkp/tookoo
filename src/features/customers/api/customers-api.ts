import { db } from '@/lib/db';
import type { Customer } from '@/types/customer.types';
import { generateUUID } from '@/utils/uuid';

export async function getCustomers(): Promise<Customer[]> {
  const items = await db.customers
    .filter((c) => c.deletedAt === null)
    .reverse()
    .sortBy('createdAt');
  return items;
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const item = await db.customers.get(id);
  if (!item || item.deletedAt !== null) return null;
  return item;
}

export async function upsertCustomer(
  customer: Partial<Customer> & { name: string; phone: string }
): Promise<Customer> {
  const now = Date.now();
  const id = customer.id || generateUUID();

  const existing = await db.customers.get(id);

  const payload: Customer = {
    id,
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    email: customer.email?.trim() || undefined,
    tier: customer.tier || 'REGULAR',
    discountPercentage: customer.discountPercentage ?? 0,
    points: customer.points ?? existing?.points ?? 0,
    totalSpent: customer.totalSpent ?? existing?.totalSpent ?? 0,
    totalOrders: customer.totalOrders ?? existing?.totalOrders ?? 0,
    address: customer.address?.trim() || undefined,
    notes: customer.notes?.trim() || undefined,
    createdAt: existing?.createdAt || customer.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.customers.put(payload);
  return payload;
}

export async function deleteCustomer(id: string): Promise<void> {
  const existing = await db.customers.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.customers.update(id, {
    deletedAt: now,
    updatedAt: now,
  });
}
