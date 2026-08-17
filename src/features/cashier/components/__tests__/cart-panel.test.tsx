import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CartPanel } from '../cart-panel';
import { useCartStore } from '../../stores/cart-store';
import type { Product } from '@/types/product.types';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Es Kopi Susu',
  category: 'Kopi',
  price: 18000,
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

describe('CartPanel', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('renders empty cart state initially', () => {
    render(<CartPanel onProceedToPayment={() => {}} />, { wrapper: createWrapper() });
    expect(screen.getByText(/Keranjang masih kosong/i)).toBeInTheDocument();
  });

  it('renders cart items and adjusts quantity', () => {
    useCartStore.getState().addItem(mockProduct, 1);

    render(<CartPanel onProceedToPayment={() => {}} />, { wrapper: createWrapper() });
    expect(screen.getByText('Es Kopi Susu')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // quantity

    const incrementBtn = screen.getByRole('button', { name: /Tambah kuantitas/i });
    fireEvent.click(incrementBtn);

    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('triggers onProceedToPayment when clicking pay button', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    const handlePay = vi.fn();

    render(<CartPanel onProceedToPayment={handlePay} />, { wrapper: createWrapper() });

    const payBtn = screen.getByRole('button', { name: /Bayar Sekarang/i });
    fireEvent.click(payBtn);

    expect(handlePay).toHaveBeenCalledTimes(1);
  });

  it('opens Tunda Bayar modal when clicking Tunda Bayar button', () => {
    useCartStore.getState().addItem(mockProduct, 1);

    render(<CartPanel onProceedToPayment={() => {}} />, { wrapper: createWrapper() });

    const holdBtn = screen.getByRole('button', { name: /Tunda Bayar/i });
    fireEvent.click(holdBtn);

    expect(screen.getByText(/Tunda Bayar \/ Simpan Pesanan/i)).toBeInTheDocument();
  });
});
