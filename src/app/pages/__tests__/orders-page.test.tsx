import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { OrdersPage } from '../orders-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OrdersPage', () => {
  beforeEach(async () => {
    await db.orders.clear();
  });

  it('renders empty state when no orders exist', async () => {
    render(<OrdersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Belum ada riwayat transaksi/i)).toBeInTheDocument();
    });
  });

  it('renders orders list and opens receipt dialog on click', async () => {
    await db.orders.put({
      id: 'ord-100',
      orderNumber: 'TK-20260817-5555',
      items: [
        {
          productId: 'p-1',
          name: 'Iced Coffee',
          price: 18000,
          qty: 2,
          subtotal: 36000,
        },
      ],
      subtotal: 36000,
      discount: 0,
      totalAmount: 36000,
      paymentMethod: 'CASH',
      amountPaid: 40000,
      changeDue: 4000,
      cashierName: 'Kasir',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<OrdersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('TK-20260817-5555')).toBeInTheDocument();
    });

    // Click on the order item or "Lihat Struk"
    const orderBtn = screen.getByText('TK-20260817-5555');
    fireEvent.click(orderBtn);

    // Verify receipt dialog opens
    expect(screen.getByText('Rincian Struk Transaksi')).toBeInTheDocument();
  });
});
