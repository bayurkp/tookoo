import { db } from '@/lib/db';
import type { Shift, OpenShiftPayload, CloseShiftPayload } from '@/types/shift.types';

/**
 * Generate human-friendly shift code (e.g. SH-20260821-001)
 */
export const generateShiftNumber = async (): Promise<string> => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await db.shifts
    .filter((s) => {
      const shiftDate = new Date(s.openedAt).toISOString().slice(0, 10).replace(/-/g, '');
      return shiftDate === dateStr;
    })
    .count();

  const seq = String(countToday + 1).padStart(3, '0');
  return `SH-${dateStr}-${seq}`;
};

/**
 * Get active open shift with live calculated order & cash movement totals
 */
export const getActiveShift = async (outletId?: string): Promise<Shift | null> => {
  const activeShift = await db.shifts
    .filter((s) => {
      if (s.deletedAt || s.status !== 'OPEN') return false;
      if (outletId && s.outletId && s.outletId !== outletId) return false;
      return true;
    })
    .first();

  if (!activeShift) return null;

  // Calculate live totals from orders created during this shift
  const orders = await db.orders
    .filter((o) => !o.deletedAt && o.createdAt >= activeShift.openedAt)
    .toArray();

  let cashSales = 0;
  let nonCashSales = 0;

  for (const ord of orders) {
    if (ord.paymentMethod === 'CASH') {
      cashSales += ord.totalAmount || 0;
    } else {
      nonCashSales += ord.totalAmount || 0;
    }
  }

  // Calculate live totals from cash movements during this shift
  const movements = await db.cashMovements
    .filter((m) => !m.deletedAt && m.shiftId === activeShift.id)
    .toArray();

  let paidIn = 0;
  let paidOut = 0;

  for (const m of movements) {
    if (m.type === 'PAID_IN') {
      paidIn += m.amount || 0;
    } else if (m.type === 'PAID_OUT') {
      paidOut += m.amount || 0;
    }
  }

  const expectedEndingCash = activeShift.startingCash + cashSales + paidIn - paidOut;

  return {
    ...activeShift,
    totalCashSales: cashSales,
    totalNonCashSales: nonCashSales,
    totalPaidIn: paidIn,
    totalPaidOut: paidOut,
    ordersCount: orders.length,
    expectedEndingCash,
  };
};

/**
 * Open a new shift with starting cash float
 */
export const openShift = async (payload: OpenShiftPayload): Promise<Shift> => {
  const existing = await getActiveShift(payload.outletId);
  if (existing) {
    throw new Error('Shift kasir masih aktif. Tutup shift saat ini sebelum membuka shift baru.');
  }

  const settings = await db.settings.toCollection().first();
  const now = Date.now();
  const shiftNumber = await generateShiftNumber();

  const newShift: Shift = {
    id: crypto.randomUUID(),
    shiftNumber,
    outletId: payload.outletId || settings?.activeOutletId || undefined,
    staffId: payload.staffId || settings?.activeStaffId || undefined,
    cashierName: payload.cashierName || settings?.defaultCashier || 'Kasir',
    terminalName: payload.terminalName || settings?.deviceName || 'Terminal Utama',
    status: 'OPEN',
    openedAt: now,
    closedAt: null,
    startingCash: Math.max(0, payload.startingCash || 0),
    expectedEndingCash: Math.max(0, payload.startingCash || 0),
    actualEndingCash: undefined,
    cashDifference: 0,
    totalCashSales: 0,
    totalNonCashSales: 0,
    totalPaidIn: 0,
    totalPaidOut: 0,
    ordersCount: 0,
    notes: payload.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.shifts.put(newShift);
  return newShift;
};

/**
 * Close active shift, reconcile physical cash, and compute over/short difference
 */
export const closeShift = async (payload: CloseShiftPayload): Promise<Shift> => {
  const shift = await db.shifts.get(payload.shiftId);
  if (!shift) {
    throw new Error('Data shift tidak ditemukan.');
  }

  if (shift.status === 'CLOSED') {
    throw new Error('Shift ini sudah ditutup sebelumnya.');
  }

  const now = Date.now();

  // Re-calculate all finalized figures
  const orders = await db.orders
    .filter((o) => !o.deletedAt && o.createdAt >= shift.openedAt && o.createdAt <= now)
    .toArray();

  let cashSales = 0;
  let nonCashSales = 0;

  for (const ord of orders) {
    if (ord.paymentMethod === 'CASH') {
      cashSales += ord.totalAmount || 0;
    } else {
      nonCashSales += ord.totalAmount || 0;
    }
  }

  const movements = await db.cashMovements
    .filter((m) => !m.deletedAt && m.shiftId === shift.id)
    .toArray();

  let paidIn = 0;
  let paidOut = 0;

  for (const m of movements) {
    if (m.type === 'PAID_IN') {
      paidIn += m.amount || 0;
    } else if (m.type === 'PAID_OUT') {
      paidOut += m.amount || 0;
    }
  }

  const expectedEndingCash = shift.startingCash + cashSales + paidIn - paidOut;
  const actualEndingCash = Math.max(0, payload.actualEndingCash || 0);
  const cashDifference = actualEndingCash - expectedEndingCash;

  const closedShift: Shift = {
    ...shift,
    status: 'CLOSED',
    closedAt: now,
    expectedEndingCash,
    actualEndingCash,
    cashDifference,
    totalCashSales: cashSales,
    totalNonCashSales: nonCashSales,
    totalPaidIn: paidIn,
    totalPaidOut: paidOut,
    ordersCount: orders.length,
    notes: payload.notes?.trim() || shift.notes,
    updatedAt: now,
  };

  await db.shifts.put(closedShift);
  return closedShift;
};

/**
 * Get closed shift history
 */
export const getShiftHistory = async (options?: {
  outletId?: string;
  limit?: number;
}): Promise<Shift[]> => {
  const limit = options?.limit || 50;
  const shifts = await db.shifts
    .filter((s) => {
      if (s.deletedAt) return false;
      if (options?.outletId && s.outletId && s.outletId !== options.outletId) return false;
      return true;
    })
    .reverse()
    .sortBy('openedAt');

  return shifts.slice(0, limit);
};

/**
 * Get single shift by ID
 */
export const getShiftById = async (id: string): Promise<Shift | null> => {
  const shift = await db.shifts.get(id);
  if (!shift || shift.deletedAt) return null;
  return shift;
};
