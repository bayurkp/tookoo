import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { CashierPage } from '../cashier-page';
import { useCartStore } from '@/features/cashier/stores/cart-store';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CashierPage', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.orders.clear();
    useCartStore.getState().clearCart();
  });

  it('renders products and allows adding to cart', async () => {
    await db.products.put({
      id: 'p-1',
      name: 'Cappuccino Cold',
      category: 'Kopi',
      price: 20000,
      stock: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<CashierPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Cappuccino Cold')).toBeInTheDocument();
    });

    // Click product to add to cart
    const productCard = screen.getByText('Cappuccino Cold');
    fireEvent.click(productCard);

    // Verify item is now in cart panel
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(screen.getByText(/Total Bayar/i)).toBeInTheDocument();
  });
});
