import { db } from '@/lib/db';
import type { StoreTable, TableStatus } from '@/types/table.types';

const getTableRepo = () => db.restaurantTables;

export async function getTables(): Promise<StoreTable[]> {
  const all = await getTableRepo().toArray();
  return all
    .filter((t) => t.deletedAt === null)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

export async function upsertTable(
  table: Partial<StoreTable> & { name: string }
): Promise<StoreTable> {
  const now = Date.now();
  const entity: StoreTable = {
    id: table.id || crypto.randomUUID(),
    name: table.name.trim(),
    zone: table.zone?.trim() || 'Area Utama',
    x: Math.max(0, Math.round((table.x ?? 40) / 20) * 20),
    y: Math.max(0, Math.round((table.y ?? 40) / 20) * 20),
    width: Math.max(60, Math.round((table.width ?? 100) / 20) * 20),
    height: Math.max(60, Math.round((table.height ?? 80) / 20) * 20),
    capacity: Math.max(1, table.capacity || 4),
    shape: table.shape || 'RECTANGLE',
    status: table.status || 'AVAILABLE',
    currentOrderId: table.currentOrderId ?? null,
    currentCustomerName: table.currentCustomerName ?? null,
    activeOrderTotal: table.activeOrderTotal ?? null,
    createdAt: table.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await getTableRepo().put(entity);
  return entity;
}

export async function bulkUpsertTables(tables: StoreTable[]): Promise<void> {
  const now = Date.now();
  const prepared = tables.map((t) => ({
    ...t,
    x: Math.max(0, Math.round(t.x / 20) * 20),
    y: Math.max(0, Math.round(t.y / 20) * 20),
    width: Math.max(60, Math.round(t.width / 20) * 20),
    height: Math.max(60, Math.round(t.height / 20) * 20),
    updatedAt: now,
  }));
  await getTableRepo().bulkPut(prepared);
}

export async function updateTableStatus(
  id: string,
  status: TableStatus,
  orderMeta?: { orderId?: string | null; customerName?: string | null; orderTotal?: number | null }
): Promise<void> {
  const existing = await getTableRepo().get(id);
  if (!existing) return;

  const now = Date.now();
  await getTableRepo().put({
    ...existing,
    status,
    currentOrderId: orderMeta ? (orderMeta.orderId ?? null) : existing.currentOrderId,
    currentCustomerName: orderMeta
      ? (orderMeta.customerName ?? null)
      : existing.currentCustomerName,
    activeOrderTotal: orderMeta ? (orderMeta.orderTotal ?? null) : existing.activeOrderTotal,
    updatedAt: now,
  });
}

export async function deleteTable(id: string): Promise<void> {
  const existing = await getTableRepo().get(id);
  if (!existing) return;

  const now = Date.now();
  await getTableRepo().put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });
}
