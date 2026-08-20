import { db } from '@/lib/db';
import type { Staff } from '@/types/store.types';

/**
 * Fetch all active (non-deleted) staff members.
 * Automatically seeds a default Owner account if no staff exist.
 */
export async function getStaffList(): Promise<Staff[]> {
  const allStaff = await db.staff.toArray();
  const activeStaff = allStaff.filter((s) => s.deletedAt === null);

  if (activeStaff.length === 0) {
    const settings = await db.settings.toCollection().first();
    const defaultOwner: Staff = {
      id: crypto.randomUUID(),
      storeId: settings?.id || crypto.randomUUID(),
      name: settings?.defaultCashier || 'Owner / Kasir Utama',
      role: 'OWNER',
      pin: settings?.ownerPin || '',
      hasAllOutlets: true,
      outletIds: [],
      phone: '',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    await db.staff.put(defaultOwner);

    if (settings && !settings.activeStaffId) {
      await db.settings.update(settings.id, {
        activeStaffId: defaultOwner.id,
        updatedAt: Date.now(),
      });
    }

    return [defaultOwner];
  }

  return activeStaff.sort((a, b) => (b.role === 'OWNER' ? 1 : 0) - (a.role === 'OWNER' ? 1 : 0));
}

/**
 * Fetch a single staff by ID.
 */
export async function getStaff(id: string): Promise<Staff | null> {
  const staff = await db.staff.get(id);
  if (!staff || staff.deletedAt !== null) return null;
  return staff;
}

/**
 * Upsert a staff member.
 */
export async function upsertStaff(data: Partial<Staff> & { name: string }): Promise<Staff> {
  const now = Date.now();
  const existing = data.id ? await db.staff.get(data.id) : null;
  const settings = await db.settings.toCollection().first();

  const entity: Staff = {
    id: data.id || crypto.randomUUID(),
    storeId: data.storeId || existing?.storeId || settings?.id || crypto.randomUUID(),
    name: data.name.trim(),
    role: data.role || existing?.role || 'CASHIER',
    pin: data.pin?.trim() || existing?.pin || '',
    hasAllOutlets: data.hasAllOutlets ?? existing?.hasAllOutlets ?? data.role === 'OWNER',
    outletIds: data.outletIds || existing?.outletIds || [],
    phone: data.phone?.trim() || '',
    isActive: data.isActive ?? existing?.isActive ?? true,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.staff.put(entity);

  return entity;
}

/**
 * Soft delete a staff member.
 */
export async function deleteStaff(id: string): Promise<void> {
  const existing = await db.staff.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.staff.update(id, {
    deletedAt: now,
    updatedAt: now,
  });

  const settings = await db.settings.toCollection().first();
  if (settings?.activeStaffId === id) {
    const remaining = await db.staff.filter((s) => s.id !== id && s.deletedAt === null).toArray();
    await db.settings.update(settings.id, {
      activeStaffId: remaining[0]?.id || undefined,
      updatedAt: now,
    });
  }
}

/**
 * Set the active logged-in staff on this terminal.
 */
export async function setActiveStaffId(staffId: string): Promise<void> {
  const settings = await db.settings.toCollection().first();
  if (settings) {
    const staff = await db.staff.get(staffId);
    await db.settings.update(settings.id, {
      activeStaffId: staffId,
      defaultCashier: staff?.name || settings.defaultCashier,
      activeRole: staff?.role || settings.activeRole,
      updatedAt: Date.now(),
    });
  }
}
