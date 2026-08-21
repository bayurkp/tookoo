import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AppSidebar } from '../app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { db } from '@/lib/db';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SidebarProvider>{children}</SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AppSidebar', () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it('renders simple mode navigation links by default', async () => {
    render(<AppSidebar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText('Kasir')[0]).toBeInTheDocument();
      expect(screen.getByText('Riwayat Transaksi')).toBeInTheDocument();
      expect(screen.getByText('Katalog Produk & Menu')).toBeInTheDocument();
      expect(screen.getByText('Pelanggan & Member')).toBeInTheDocument();
      expect(screen.getByText('Pengeluaran Kas')).toBeInTheDocument();
      expect(screen.getByText('Pengaturan')).toBeInTheDocument();
    });
  });

  it('renders advanced mode grouped sections when appMode is ADVANCED', async () => {
    await db.settings.put({
      id: 'settings-1',
      storeName: 'Tookoo POS',
      passphrase: '',
      storeSecretKey: 'key-1',
      currency: 'IDR',
      appMode: 'ADVANCED',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<AppSidebar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Penjualan')).toBeInTheDocument();
      expect(screen.getByText('Data Toko')).toBeInTheDocument();
      expect(screen.getByText('Laporan & Analitik')).toBeInTheDocument();
    });
  });
});
