import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { StockAdjustmentPage } from '../stock-adjustment-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('StockAdjustmentPage', () => {
  beforeEach(async () => {
    await db.stockAdjustments.clear();
    await db.products.clear();
  });

  it('renders empty state when no adjustments exist and opens dialog', async () => {
    render(<StockAdjustmentPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Stok Adjustment \(Penyesuaian Stok\)/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Belum ada catatan penyesuaian stok/i)).toBeInTheDocument();
    });

    const openBtn = screen.getByRole('button', { name: /Buat Penyesuaian Stok/i });
    fireEvent.click(openBtn);

    expect(screen.getByText(/Penyesuaian Stok \(Adjustment\)/i)).toBeInTheDocument();
  });

  it('renders adjustments list and summary metrics', async () => {
    await db.stockAdjustments.put({
      id: 'adj-1',
      adjustmentNumber: 'ADJ-20260818-1001',
      items: [
        {
          productId: 'prod-1',
          productName: 'Kopi Arabika',
          previousStock: 5,
          adjustedStock: 25,
          difference: 20,
          reason: 'RESTOCK',
          notes: 'Beli dari grosir',
        },
      ],
      adjustedBy: 'Pemilik Toko',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<StockAdjustmentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('ADJ-20260818-1001')).toBeInTheDocument();
      expect(screen.getByText('Kopi Arabika')).toBeInTheDocument();
      expect(screen.getByText('+20 unit')).toBeInTheDocument();
    });
  });
});
