import { db } from '@/lib/db';
import type { Outlet } from '@/types/store.types';

/**
 * Fetch all active (non-deleted) outlets.
 * Automatically seeds default 'Cabang Utama (HQ)' if no outlets exist.
 */
export async function getOutlets(): Promise<Outlet[]> {
  const allOutlets = await db.outlets.toArray();
  const activeOutlets = allOutlets.filter((o) => o.deletedAt === null);

  if (activeOutlets.length === 0) {
    const settings = await db.settings.toCollection().first();
    const defaultHQ: Outlet = {
      id: crypto.randomUUID(),
      storeId: settings?.id || crypto.randomUUID(),
      name: settings?.storeName ? `${settings.storeName} (Pusat)` : 'Cabang Utama (HQ)',
      address: settings?.storeAddress || '',
      phone: '',
      isHQ: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    await db.outlets.put(defaultHQ);

    if (settings && !settings.activeOutletId) {
      await db.settings.update(settings.id, {
        activeOutletId: defaultHQ.id,
        updatedAt: Date.now(),
      });
    }

    return [defaultHQ];
  }

  return activeOutlets.sort((a, b) => (b.isHQ ? 1 : 0) - (a.isHQ ? 1 : 0));
}

/**
 * Fetch a single outlet by ID.
 */
export async function getOutlet(id: string): Promise<Outlet | null> {
  const outlet = await db.outlets.get(id);
  if (!outlet || outlet.deletedAt !== null) return null;
  return outlet;
}

/**
 * Upsert an outlet (insert or update).
 */
export async function upsertOutlet(data: Partial<Outlet> & { name: string }): Promise<Outlet> {
  const now = Date.now();
  const existing = data.id ? await db.outlets.get(data.id) : null;
  const settings = await db.settings.toCollection().first();

  const entity: Outlet = {
    id: data.id || crypto.randomUUID(),
    storeId: data.storeId || existing?.storeId || settings?.id || crypto.randomUUID(),
    name: data.name.trim(),
    address: data.address?.trim() || '',
    phone: data.phone?.trim() || '',
    isHQ: data.isHQ ?? existing?.isHQ ?? false,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.outlets.put(entity);

  // If this device has no active outlet, set this as active
  if (settings && !settings.activeOutletId) {
    await db.settings.update(settings.id, {
      activeOutletId: entity.id,
      updatedAt: now,
    });
  }

  return entity;
}

/**
 * Soft delete an outlet.
 */
export async function deleteOutlet(id: string): Promise<void> {
  const existing = await db.outlets.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.outlets.update(id, {
    deletedAt: now,
    updatedAt: now,
  });

  // If the deleted outlet was active, fallback to another active outlet
  const settings = await db.settings.toCollection().first();
  if (settings?.activeOutletId === id) {
    const remaining = await db.outlets.filter((o) => o.id !== id && o.deletedAt === null).toArray();
    const fallbackId = remaining[0]?.id;
    await db.settings.update(settings.id, {
      activeOutletId: fallbackId || undefined,
      updatedAt: now,
    });
  }
}

/**
 * Set the currently active outlet on this terminal.
 */
export async function setActiveOutletId(outletId: string): Promise<void> {
  const settings = await db.settings.toCollection().first();
  if (settings) {
    await db.settings.update(settings.id, {
      activeOutletId: outletId,
      updatedAt: Date.now(),
    });
  }
}
