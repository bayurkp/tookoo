import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { DiscountManagerTab } from '../discount-manager-tab';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('DiscountManagerTab', () => {
  beforeEach(async () => {
    await db.masterDiscounts.clear();
  });

  it('renders discount manager tab with actions and default seeds', async () => {
    render(<DiscountManagerTab />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Master Diskon & Promo')).toBeInTheDocument();
      expect(screen.getByText('Tambah Diskon Baru')).toBeInTheDocument();
    });
  });

  it('opens create discount dialog and displays scope options', async () => {
    render(<DiscountManagerTab />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tambah Diskon Baru')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Tambah Diskon Baru/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Tambah Promo Diskon Baru')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Contoh: Diskon Pelajar 10%/i)).toBeInTheDocument();
      expect(screen.getByText(/Cakupan Berlakunya Diskon/i)).toBeInTheDocument();
      expect(screen.getByText(/Tentukan Batas Waktu/i)).toBeInTheDocument();
    });
  });
});
