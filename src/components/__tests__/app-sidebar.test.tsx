import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AppSidebar } from '../app-sidebar';
import { db } from '@/lib/db';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AppSidebar', () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it('renders sidebar grouped sections and navigation links', () => {
    render(<AppSidebar />, { wrapper: createWrapper() });

    expect(screen.getByText('Operasional Kasir')).toBeInTheDocument();
    expect(screen.getByText('Katalog & Stok')).toBeInTheDocument();
    expect(screen.getByText('Laporan & Finansial')).toBeInTheDocument();
    expect(screen.getByText('Manajemen & Jaringan')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kasir/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Riwayat/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Semua Produk/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kategori Produk/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Daftar Varian/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Modifier & Topping/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Stok Adjustment/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Laba Rugi & Penjualan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Performa Produk/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kas & Pembayaran/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ekspor & Cetak/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sinkronisasi/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pengaturan/i })).toBeInTheDocument();
  });
});
