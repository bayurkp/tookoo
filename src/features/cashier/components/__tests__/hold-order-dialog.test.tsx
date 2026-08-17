import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { HoldOrderDialog } from '../hold-order-dialog';
import { useCartStore } from '../../stores/cart-store';
import { db } from '@/lib/db';
import type { Product } from '@/types/product.types';

const mockProduct: Product = {
  id: 'p-1',
  name: 'Kopi Susu Gula Aren',
  category: 'Minuman',
  unit: 'cup',
  price: 20000,
  stock: 10,
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

describe('HoldOrderDialog', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
    await db.products.put(mockProduct);
    useCartStore.getState().clearCart();
  });

  it('renders table inputs and quick suggestions', () => {
    useCartStore.getState().addItem(mockProduct, 2);

    render(
      <HoldOrderDialog open={true} onOpenChange={() => {}} onHoldSuccess={() => {}} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Tunda Bayar \/ Simpan Pesanan/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contoh: Meja 04 \/ Take Away/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Meja 1' })).toBeInTheDocument();
  });

  it('submits a pending order and clears the cart', async () => {
    useCartStore.getState().addItem(mockProduct, 2);
    const handleSuccess = vi.fn();

    render(
      <HoldOrderDialog open={true} onOpenChange={() => {}} onHoldSuccess={handleSuccess} />,
      { wrapper: createWrapper() }
    );

    const meja1Btn = screen.getByRole('button', { name: 'Meja 1' });
    fireEvent.click(meja1Btn);

    const submitBtn = screen.getByRole('button', { name: /Simpan & Buka Antrean Baru/i });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
      expect(useCartStore.getState().items.length).toBe(0);
    });
  });
});
