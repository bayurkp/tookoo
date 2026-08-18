import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { TablesPage } from '../tables-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TablesPage', () => {
  beforeEach(async () => {
    await db.tables.clear();
  });

  it('renders table summary cards and canvas', async () => {
    render(<TablesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Denah & Tata Letak Meja')).toBeInTheDocument();
      expect(screen.getByText('Total Meja')).toBeInTheDocument();
      expect(screen.getByText('Kosong (Tersedia)')).toBeInTheDocument();
      expect(screen.getByText('Terisi / Ada Bill')).toBeInTheDocument();
    });
  });

  it('opens add table modal dialog', async () => {
    render(<TablesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tambah Meja')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Tambah Meja/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Tambah Meja Baru')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Contoh: Meja 01/i)).toBeInTheDocument();
    });
  });
});
