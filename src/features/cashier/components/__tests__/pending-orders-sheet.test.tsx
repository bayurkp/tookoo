import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { PendingOrdersSheet } from '../pending-orders-sheet';
import { db } from '@/lib/db';
import type { Order } from '@/types/order.types';

const mockPendingOrder: Order = {
  id: 'order-p1',
  orderNumber: 'TK-20260818-001',
  status: 'PENDING',
  customerName: 'Meja 04 - Pak Budi',
  items: [
    {
      productId: 'p-1',
      name: 'Nasi Goreng Spesial',
      unit: 'porsi',
      price: 25000,
      qty: 2,
      subtotal: 50000,
    },
  ],
  subtotal: 50000,
  discount: 0,
  totalAmount: 50000,
  paymentMethod: 'CASH',
  amountPaid: 0,
  changeDue: 0,
  cashierName: 'Kasir',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PendingOrdersSheet', () => {
  beforeEach(async () => {
    await db.orders.clear();
  });

  it('renders empty state when there are no pending orders', () => {
    render(
      <PendingOrdersSheet
        open={true}
        onOpenChange={() => {}}
        onPayOrder={() => {}}
        onEditOrder={() => {}}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Tidak Ada Pesanan Tertunda/i)).toBeInTheDocument();
  });

  it('renders pending order and triggers pay/edit actions', async () => {
    await db.orders.put(mockPendingOrder);
    const handlePay = vi.fn();
    const handleEdit = vi.fn();

    render(
      <PendingOrdersSheet
        open={true}
        onOpenChange={() => {}}
        onPayOrder={handlePay}
        onEditOrder={handleEdit}
      />,
      { wrapper: createWrapper() }
    );

    expect(await screen.findByText('Meja 04 - Pak Budi')).toBeInTheDocument();
    expect(screen.getByText('TK-20260818-001')).toBeInTheDocument();

    const payBtn = screen.getByRole('button', { name: /Bayar/i });
    fireEvent.click(payBtn);
    expect(handlePay).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-p1' }));

    const editBtn = screen.getByRole('button', { name: /Buka \/ Edit/i });
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-p1' }));
  });
});
