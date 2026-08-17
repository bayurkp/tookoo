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
    expect(screen.getByText('Manajemen & Jaringan')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Kasir/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Riwayat/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Produk/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Stok Adjustment/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sinkronisasi/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pengaturan/i })).toBeInTheDocument();
  });
});
