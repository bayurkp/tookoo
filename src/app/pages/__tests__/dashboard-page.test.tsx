import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { DashboardPage } from '../dashboard-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
  });

  it('renders dashboard KPI cards and empty states', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Dashboard Toko')).toBeInTheDocument();
    expect(screen.getByText('Omzet Penjualan')).toBeInTheDocument();
    expect(screen.getByText('Estimasi Laba Kotor')).toBeInTheDocument();
    expect(screen.getByText('Total Transaksi')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Belum ada transaksi hari ini/i)).toBeInTheDocument();
    });
  });

  it('renders live sales, top products, and low stock alert', async () => {
    // Add product
    await db.products.put({
      id: 'prod-1',
      name: 'Kopi Susu Gula Aren',
      category: 'Minuman',
      price: 20000,
      costPrice: 8000,
      stock: 2, // Low stock (minStock defaults to 5)
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    // Add order today
    await db.orders.put({
      id: 'order-1',
      orderNumber: 'TRX-20260818-001',
      items: [
        {
          productId: 'prod-1',
          name: 'Kopi Susu Gula Aren',
          price: 20000,
          qty: 3,
          subtotal: 60000,
        },
      ],
      subtotal: 60000,
      discount: 0,
      totalAmount: 60000,
      paymentMethod: 'CASH',
      amountPaid: 60000,
      changeDue: 0,
      cashierName: 'Kasir Utama',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Omzet = Rp 60.000, Profit = 60.000 - (3 * 8.000) = Rp 36.000
      expect(screen.getAllByText(/60\.000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/36\.000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Kopi Susu Gula Aren').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Terjual 3 unit/i)).toBeInTheDocument();
      expect(screen.getByText(/Sisa 2/i)).toBeInTheDocument();
    });
  });
});
