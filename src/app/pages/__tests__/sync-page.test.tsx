import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { SyncPage } from '../sync-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('SyncPage', () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it('renders store identity, qr card, peers, and backup cards', async () => {
    render(<SyncPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByText('Identitas Toko & Kunci Rahasia')
      ).toBeInTheDocument();
      expect(screen.getByText('QR Code Pairing Toko')).toBeInTheDocument();
      expect(screen.getByText('Terminal Terhubung')).toBeInTheDocument();
      expect(
        screen.getByText(/Cadangan & Pemulihan Data/i)
      ).toBeInTheDocument();
    });

    // Open scanner modal
    const scanBtn = screen.getByRole('button', {
      name: /Pindai QR Perangkat Lain/i,
    });
    fireEvent.click(scanBtn);

    expect(screen.getByText('Pairing Terminal Kasir')).toBeInTheDocument();
  });
});
