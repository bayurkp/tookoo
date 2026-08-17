import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('CartPanel', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('renders empty cart state initially', () => {
    render(<CartPanel onProceedToPayment={() => {}} />);
    expect(screen.getByText(/Keranjang masih kosong/i)).toBeInTheDocument();
  });

  it('renders cart items and adjusts quantity', () => {
    useCartStore.getState().addItem(mockProduct, 1);

    render(<CartPanel onProceedToPayment={() => {}} />);
    expect(screen.getByText('Es Kopi Susu')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // quantity

    const incrementBtn = screen.getByRole('button', { name: /Tambah kuantitas/i });
    fireEvent.click(incrementBtn);

    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('triggers onProceedToPayment when clicking pay button', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    const handlePay = vi.fn();

    render(<CartPanel onProceedToPayment={handlePay} />);

    const payBtn = screen.getByRole('button', { name: /Bayar Sekarang/i });
    fireEvent.click(payBtn);

    expect(handlePay).toHaveBeenCalledTimes(1);
  });
});
