import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { useOrders, useOrder } from '../use-orders';
import type { Order } from '@/types/order.types';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockOrder: Order = {
  id: 'ord-123',
  orderNumber: 'TK-20260817-1001',
  items: [
    {
      productId: 'p-1',
      name: 'Matcha Latte',
      price: 22000,
      qty: 1,
      subtotal: 22000,
    },
  ],
  subtotal: 22000,
  discount: 0,
  totalAmount: 22000,
  paymentMethod: 'QRIS',
  amountPaid: 22000,
  changeDue: 0,
  cashierName: 'Kasir',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('useOrders Hooks', () => {
  beforeEach(async () => {
    await db.orders.clear();
  });

  it('fetches all active orders', async () => {
    await db.orders.put(mockOrder);

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].orderNumber).toBe('TK-20260817-1001');
  });

  it('fetches single order by id', async () => {
    await db.orders.put(mockOrder);

    const { result } = renderHook(() => useOrder('ord-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.totalAmount).toBe(22000);
  });
});
