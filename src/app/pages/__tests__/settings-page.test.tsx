import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { SettingsPage } from '../settings-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('SettingsPage', () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it('renders all settings sections correctly', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Profil Toko & Kasir/i)).toBeInTheDocument();
      expect(screen.getByText(/Tema & Tampilan/i)).toBeInTheDocument();
      expect(screen.getByText(/Bahasa Aplikasi/i)).toBeInTheDocument();
      expect(screen.getByText(/Perangkat & Operasional Kasir/i)).toBeInTheDocument();
    });
  });

  it('updates store profile when submitted', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });

    const storeNameInput = screen.getByPlaceholderText(/Contoh: Toko Kopi Senja/i);
    fireEvent.change(storeNameInput, { target: { value: 'Warung Berkah' } });

    const form = screen.getByTestId('profile-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Pengaturan Berhasil Disimpan/i)).toBeInTheDocument();
    });
  });
});
