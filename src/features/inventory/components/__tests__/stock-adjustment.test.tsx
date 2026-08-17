import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { StockAdjustmentDialog } from '../stock-adjustment-dialog';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('StockAdjustmentDialog', () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.stockAdjustments.clear();

    await db.products.put({
      id: 'prod-10',
      name: 'Kopi Susu Aren',
      category: 'Minuman',
      price: 18000,
      stock: 20,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });
  });

  it('renders dialog and submits a stock adjustment', async () => {
    const handleOpenChange = vi.fn();

    render(<StockAdjustmentDialog open={true} onOpenChange={handleOpenChange} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Penyesuaian Stok \(Adjustment\)/i)).toBeInTheDocument();

    // Wait for products to load from Dexie into select
    await waitFor(() => {
      expect(screen.getByText(/Kopi Susu Aren/i)).toBeInTheDocument();
    });

    // Select the product
    const selectProduct = screen.getByRole('combobox');
    fireEvent.change(selectProduct, { target: { value: 'prod-10' } });

    // Wait for current stock banner to display
    await waitFor(() => {
      expect(screen.getByText('20 unit')).toBeInTheDocument();
    });

    // Set new stock value input
    const inputVal = screen.getByRole('spinbutton');
    fireEvent.change(inputVal, { target: { value: '35' } });

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Simpan Penyesuaian/i });
    fireEvent.click(submitBtn);

    await waitFor(async () => {
      const updatedProduct = await db.products.get('prod-10');
      expect(updatedProduct?.stock).toBe(35);

      const adjustments = await db.stockAdjustments.toArray();
      expect(adjustments.length).toBe(1);
      expect(adjustments[0].items[0].difference).toBe(15);
    });
  });
});
