import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import {
  openShift,
  closeShift,
  getActiveShift,
  getShiftHistory,
} from '../shifts-api';
import { recordCashMovement, getCashMovementsByShift } from '../cash-movements-api';

describe('Shifts API & Cash Movements', () => {
  beforeEach(async () => {
    await db.shifts.clear();
    await db.cashMovements.clear();
    await db.orders.clear();
  });

  it('opens a new shift successfully', async () => {
    const shift = await openShift({
      startingCash: 200000,
      cashierName: 'Budi Kasir',
      notes: 'Shift Pagi',
    });

    expect(shift.id).toBeDefined();
    expect(shift.status).toBe('OPEN');
    expect(shift.startingCash).toBe(200000);
    expect(shift.cashierName).toBe('Budi Kasir');

    const active = await getActiveShift();
    expect(active?.id).toBe(shift.id);
  });

  it('records paid in and paid out movements and updates live shift totals', async () => {
    const shift = await openShift({ startingCash: 100000 });

    // Paid In: +50,000
    await recordCashMovement({
      shiftId: shift.id,
      type: 'PAID_IN',
      amount: 50000,
      category: 'Modal Tambahan',
      reason: 'Uang kembalian receh',
    });

    // Paid Out: -20,000
    await recordCashMovement({
      shiftId: shift.id,
      type: 'PAID_OUT',
      amount: 20000,
      category: 'Operasional',
      reason: 'Beli kertas kasir',
    });

    const movements = await getCashMovementsByShift(shift.id);
    expect(movements.length).toBe(2);

    const active = await getActiveShift();
    expect(active?.totalPaidIn).toBe(50000);
    expect(active?.totalPaidOut).toBe(20000);
    // 100,000 + 50,000 - 20,000 = 130,000
    expect(active?.expectedEndingCash).toBe(130000);
  });

  it('closes a shift and calculates physical cash difference (Over / Short)', async () => {
    const shift = await openShift({ startingCash: 200000 });

    // Close with actual physical cash 205,000 (Surplus +5,000)
    const closed = await closeShift({
      shiftId: shift.id,
      actualEndingCash: 205000,
      notes: 'Penutupan lancar',
    });

    expect(closed.status).toBe('CLOSED');
    expect(closed.actualEndingCash).toBe(205000);
    expect(closed.expectedEndingCash).toBe(200000);
    expect(closed.cashDifference).toBe(5000);

    const active = await getActiveShift();
    expect(active).toBeNull();

    const history = await getShiftHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(shift.id);
  });
});
