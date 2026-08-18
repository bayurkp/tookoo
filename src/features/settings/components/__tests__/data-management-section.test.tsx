import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { DataManagementSection } from '../data-management-section';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('DataManagementSection', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
    await db.tables.clear();
  });

  it('renders data management summary and action cards', async () => {
    render(<DataManagementSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Pembersihan & Reset Basis Data Lokal')).toBeInTheDocument();
      expect(screen.getByText('Hapus Riwayat Transaksi & Struk')).toBeInTheDocument();
      expect(screen.getByText('Hapus Katalog Produk & Stok')).toBeInTheDocument();
      expect(screen.getByText('Zona Bahaya (Danger Zone)')).toBeInTheDocument();
      expect(screen.getByText('Reset Total Toko')).toBeInTheDocument();
    });
  });

  it('opens confirmation modal and validates keyword input before proceeding', async () => {
    await db.orders.put({
      id: 'ord-1',
      orderNumber: 'TK-001',
      items: [],
      subtotal: 10000,
      discount: 0,
      totalAmount: 10000,
      paymentMethod: 'CASH',
      amountPaid: 10000,
      changeDue: 0,
      cashierName: 'Kasir',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<DataManagementSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Hapus Transaksi')).toBeInTheDocument();
    });

    const clearOrdersBtn = screen.getByText('Hapus Transaksi');
    fireEvent.click(clearOrdersBtn);

    await waitFor(() => {
      expect(screen.getByText('Hapus Semua Riwayat Transaksi')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByText('Konfirmasi & Hapus Data');
    expect(confirmBtn).toBeDisabled();

    // Type invalid keyword
    const input = screen.getByPlaceholderText('Ketik "HAPUS"');
    fireEvent.change(input, { target: { value: 'SALAH' } });
    expect(confirmBtn).toBeDisabled();

    // Type valid keyword
    fireEvent.change(input, { target: { value: 'HAPUS' } });
    expect(confirmBtn).not.toBeDisabled();
  });
});
