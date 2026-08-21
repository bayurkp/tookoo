import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { db } from '@/lib/db';
import { ShiftsPage } from '../shifts-page';

describe('ShiftsPage', () => {
  beforeEach(async () => {
    await db.shifts.clear();
    await db.cashMovements.clear();
    await db.orders.clear();
  });

  it('renders empty state when no shift is active', async () => {
    renderWithProviders(<ShiftsPage />);

    await waitFor(() => {
      expect(screen.getByText('Shift & Uang Kas')).toBeInTheDocument();
      expect(
        screen.getByText('Belum Ada Shift Kasir yang Aktif')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Buka Shift Baru/i })
      ).toBeInTheDocument();
    });
  });

  it('renders active shift dashboard when a shift is open', async () => {
    await db.shifts.put({
      id: 'sh-1',
      shiftNumber: 'SH-20260821-001',
      cashierName: 'Budi Kasir',
      terminalName: 'Terminal Utama',
      status: 'OPEN',
      openedAt: Date.now(),
      startingCash: 200000,
      totalCashSales: 50000,
      totalNonCashSales: 30000,
      totalPaidIn: 0,
      totalPaidOut: 0,
      ordersCount: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    renderWithProviders(<ShiftsPage />);

    await waitFor(() => {
      expect(screen.getByText('SH-20260821-001')).toBeInTheDocument();
      expect(screen.getByText('Budi Kasir')).toBeInTheDocument();
      expect(screen.getByText('Saldo Kas Fisik Laci')).toBeInTheDocument();
      expect(screen.getByText('Cetak Laporan X')).toBeInTheDocument();
      expect(screen.getByText('Tutup Shift Kasir')).toBeInTheDocument();
    });
  });
});
