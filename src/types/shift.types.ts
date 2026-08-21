export type ShiftStatus = 'OPEN' | 'CLOSED';

export type CashMovementType = 'PAID_IN' | 'PAID_OUT';

export interface Shift {
  id: string;
  shiftNumber?: string;
  outletId?: string;
  staffId?: string;
  cashierName: string;
  terminalName: string;
  status: ShiftStatus;
  openedAt: number;
  closedAt?: number | null;
  startingCash: number;
  expectedEndingCash?: number;
  actualEndingCash?: number;
  cashDifference?: number;
  totalCashSales: number;
  totalNonCashSales: number;
  totalPaidIn: number;
  totalPaidOut: number;
  ordersCount: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface CashMovement {
  id: string;
  shiftId: string;
  outletId?: string;
  type: CashMovementType;
  amount: number;
  category: string;
  reason: string;
  performedBy: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface OpenShiftPayload {
  startingCash: number;
  cashierName?: string;
  terminalName?: string;
  outletId?: string;
  staffId?: string;
  notes?: string;
}

export interface CloseShiftPayload {
  shiftId: string;
  actualEndingCash: number;
  notes?: string;
}

export interface RecordCashMovementPayload {
  shiftId: string;
  type: CashMovementType;
  amount: number;
  category: string;
  reason: string;
  performedBy?: string;
  outletId?: string;
}
