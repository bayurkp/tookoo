import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { ReportsPage } from '../reports-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/reports?tab=pnl']}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ReportsPage', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
  });

  it('renders reports header and financial metrics', async () => {
    // Add product
    await db.products.put({
      id: 'p-1',
      name: 'Roti Bakar Keju',
      category: 'Makanan',
      price: 15000,
      costPrice: 5000,
      stock: 20,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    // Add order
    await db.orders.put({
      id: 'ord-1',
      orderNumber: 'TRX-20260818-002',
      items: [
        {
          productId: 'p-1',
          name: 'Roti Bakar Keju',
          price: 15000,
          qty: 2,
          subtotal: 30000,
        },
      ],
      subtotal: 30000,
      discount: 5000,
      totalAmount: 25000,
      paymentMethod: 'QRIS',
      cashierName: 'Kasir Utama',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<ReportsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Laporan & Analisis Finansial')).toBeInTheDocument();
    expect(screen.getByText('Omzet Bersih')).toBeInTheDocument();
    expect(screen.getByText('Modal Barang (HPP)')).toBeInTheDocument();
    expect(screen.getByText('Laba Kotor')).toBeInTheDocument();

    await waitFor(() => {
      // Net Sales = 25.000, COGS = 2 * 5.000 = 10.000, Gross Profit = 15.000
      expect(screen.getAllByText(/25\.000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/10\.000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/15\.000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Margin Laba: 60%/i)).toBeInTheDocument();
    });
  });

  it('switches to Product Performance and Payment Breakdown tabs', async () => {
    await db.orders.put({
      id: 'ord-2',
      orderNumber: 'TRX-20260818-003',
      items: [
        {
          productId: 'p-2',
          name: 'Es Teh Manis',
          price: 5000,
          qty: 4,
          subtotal: 20000,
        },
      ],
      subtotal: 20000,
      discount: 0,
      totalAmount: 20000,
      paymentMethod: 'CASH',
      cashierName: 'Kasir',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<ReportsPage />, { wrapper: createWrapper() });

    // Switch to Product Performance Tab
    const prodTab = screen.getByRole('tab', { name: /Performa Produk/i });
    fireEvent.keyDown(prodTab, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();
      expect(screen.getByText('4 unit')).toBeInTheDocument();
    });

    // Switch to Kas & Pembayaran Tab
    const payTab = screen.getByRole('tab', { name: /Kas & Pembayaran/i });
    fireEvent.keyDown(payTab, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Uang Tunai \(Laci Kasir\)/i)).toBeInTheDocument();
    });
  });
});
