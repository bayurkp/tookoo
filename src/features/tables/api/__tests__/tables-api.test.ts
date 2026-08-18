import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { getTables, upsertTable, updateTableStatus, deleteTable } from '../tables-api';

describe('Tables API', () => {
  beforeEach(async () => {
    await db.restaurantTables.clear();
  });

  it('upserts and retrieves tables', async () => {
    const table = await upsertTable({
      name: 'Meja 99',
      zone: 'Area Utama (Indoor)',
      capacity: 4,
      shape: 'RECTANGLE',
      status: 'AVAILABLE',
      x: 100,
      y: 100,
      width: 100,
      height: 80,
    });

    expect(table.id).toBeDefined();
    expect(table.name).toBe('Meja 99');

    const all = await getTables();
    expect(all.some((t) => t.id === table.id)).toBe(true);
  });

  it('updates table status correctly', async () => {
    const table = await upsertTable({
      name: 'Meja VIP',
      zone: 'VIP Room',
      capacity: 6,
      shape: 'RECTANGLE',
      status: 'AVAILABLE',
      x: 40,
      y: 40,
      width: 120,
      height: 80,
    });

    await updateTableStatus(table.id, 'OCCUPIED', {
      orderId: 'order-123',
      customerName: 'Budi Santoso',
      orderTotal: 150000,
    });

    const updated = await db.restaurantTables.get(table.id);
    expect(updated?.status).toBe('OCCUPIED');
    expect(updated?.currentOrderId).toBe('order-123');
    expect(updated?.activeOrderTotal).toBe(150000);
  });

  it('soft deletes a table', async () => {
    const table = await upsertTable({
      name: 'Meja Delete',
      zone: 'Outdoor',
      capacity: 2,
      shape: 'SQUARE',
      status: 'AVAILABLE',
      x: 40,
      y: 40,
      width: 80,
      height: 80,
    });

    await deleteTable(table.id);
    const active = await getTables();
    expect(active.some((t) => t.id === table.id)).toBe(false);

    const inDb = await db.restaurantTables.get(table.id);
    expect(inDb?.deletedAt).not.toBeNull();
  });
});
