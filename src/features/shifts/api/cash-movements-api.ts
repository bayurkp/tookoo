import { db } from '@/lib/db';
import type { CashMovement, RecordCashMovementPayload } from '@/types/shift.types';

/**
 * Record a Cash In (Paid In) or Cash Out (Paid Out) event into the cash drawer
 */
export const recordCashMovement = async (
  payload: RecordCashMovementPayload
): Promise<CashMovement> => {
  if (payload.amount <= 0) {
    throw new Error('Nominal kas harus lebih besar dari 0.');
  }

  const shift = await db.shifts.get(payload.shiftId);
  if (!shift || shift.status !== 'OPEN') {
    throw new Error('Tidak ada shift aktif untuk mencatat pergerakan kas ini.');
  }

  const settings = await db.settings.toCollection().first();
  const now = Date.now();

  const movement: CashMovement = {
    id: crypto.randomUUID(),
    shiftId: payload.shiftId,
    outletId: payload.outletId || shift.outletId || settings?.activeOutletId || undefined,
    type: payload.type,
    amount: payload.amount,
    category: payload.category || (payload.type === 'PAID_IN' ? 'Kas Masuk' : 'Kas Keluar'),
    reason: payload.reason.trim(),
    performedBy: payload.performedBy || settings?.defaultCashier || 'Kasir',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.cashMovements.put(movement);
  return movement;
};

/**
 * Get all cash movements for a specific shift
 */
export const getCashMovementsByShift = async (shiftId: string): Promise<CashMovement[]> => {
  return db.cashMovements
    .filter((m) => !m.deletedAt && m.shiftId === shiftId)
    .reverse()
    .sortBy('createdAt');
};
