import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import React from 'react';
import { db } from '@/lib/db';
import { SyncPage } from '../sync-page';

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

describe('SyncPage', () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it('renders store identity, connect store, peers, role security, and backup cards in single column layout', async () => {
    render(<SyncPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Informasi Toko & Kunci Keamanan/i)).toBeInTheDocument();
      expect(screen.getByText(/Sambungkan ke Toko Lain/i)).toBeInTheDocument();
      expect(screen.getByText(/Perangkat Kasir Terhubung/i)).toBeInTheDocument();
      expect(screen.getByText(/Peran Terminal & Keamanan PIN/i)).toBeInTheDocument();
      expect(screen.getByText(/Cadangkan & Pemulihan Data/i)).toBeInTheDocument();
    });

    // Verify tabs in ConnectedPeersCard
    expect(screen.getByRole('button', { name: /Tepercaya/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Diblokir/i })).toBeInTheDocument();

    // Open scanner modal from ConnectStoreCard
    const scanBtn = screen.getByRole('button', {
      name: /Buka Kamera Pindai QR/i,
    });
    fireEvent.click(scanBtn);

    expect(screen.getByText(/Sambungkan Perangkat Kasir/i)).toBeInTheDocument();
  });
});
