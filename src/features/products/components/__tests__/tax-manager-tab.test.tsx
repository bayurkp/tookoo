import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { TaxManagerTab } from '../tax-manager-tab';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TaxManagerTab', () => {
  beforeEach(async () => {
    await db.masterTaxes.clear();
  });

  it('renders tax manager tab and seed defaults', async () => {
    render(<TaxManagerTab />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Master Pajak & Biaya Layanan')).toBeInTheDocument();
      expect(screen.getByText('Tambah Pajak / Biaya')).toBeInTheDocument();
    });
  });

  it('opens create tax dialog with rate and calculation model fields', async () => {
    render(<TaxManagerTab />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tambah Pajak / Biaya')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Tambah Pajak \/ Biaya/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Tambah Pajak / Biaya Baru')).toBeInTheDocument();
      expect(screen.getByText(/Model Perhitungan Pajak/i)).toBeInTheDocument();
      expect(screen.getByText(/Otomatis Diterapkan di Setiap Transaksi/i)).toBeInTheDocument();
    });
  });
});
