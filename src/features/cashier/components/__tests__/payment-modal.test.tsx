import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { PaymentModal } from '../payment-modal';
import { useCartStore } from '../../stores/cart-store';
import { db } from '@/lib/db';
import type { Product } from '@/types/product.types';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockProduct: Product = {
  id: 'p-1',
  name: 'Ice Lemon Tea',
  category: 'Minuman',
  price: 15000,
  stock: 10,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('PaymentModal', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
    await db.products.put(mockProduct);
    useCartStore.getState().clearCart();
  });

  it('renders payment options and defaults to exact cash total', () => {
    useCartStore.getState().addItem(mockProduct, 2); // 30,000

    render(
      <PaymentModal
        open={true}
        onOpenChange={() => {}}
        onPaymentSuccess={() => {}}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Pembayaran')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30000')).toBeInTheDocument();
  });
});
