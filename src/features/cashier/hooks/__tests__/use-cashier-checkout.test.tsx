import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { useCashierCheckout } from '../use-cashier-checkout';
import { useCartStore } from '../../stores/cart-store';
import { upsertProduct } from '@/features/products/api/upsert-product';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCashierCheckout', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
    useCartStore.getState().clearCart();
  });

  it('completes checkout, saves order, and clears cart store', async () => {
    const product = await upsertProduct({
      name: 'Americano Ice',
      price: 18000,
      stock: 10,
      category: 'Kopi',
    });

    useCartStore.getState().addItem(product, 2);
    expect(useCartStore.getState().items).toHaveLength(1);

    const { result } = renderHook(() => useCashierCheckout(), {
      wrapper: createWrapper(),
    });

    let completedOrder: any;
    await act(async () => {
      completedOrder = await result.current.mutateAsync({
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: 2,
            subtotal: 36000,
          },
        ],
        subtotal: 36000,
        discount: 0,
        totalAmount: 36000,
        paymentMethod: 'CASH',
        amountPaid: 50000,
        changeDue: 14000,
        cashierName: 'Kasir Utama',
      });
    });

    expect(completedOrder.id).toBeDefined();
    expect(completedOrder.changeDue).toBe(14000);

    // Verify cart was cleared
    expect(useCartStore.getState().items).toEqual([]);

    // Verify stock decremented
    const updatedProduct = await db.products.get(product.id);
    expect(updatedProduct?.stock).toBe(8);
  });
});
