import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { db } from '@/lib/db';
import { SettingsPage } from '../settings-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('SettingsPage', () => {
  beforeEach(async () => {
    await db.settings.clear();
  });

  it('renders all settings tabs and switches between them', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Profil & Sistem')).toBeInTheDocument();
      expect(screen.getByText('Format Nota & Struk')).toBeInTheDocument();
      expect(screen.getByText('Tampilan & Suara')).toBeInTheDocument();
      expect(screen.getByText('Keamanan & PIN')).toBeInTheDocument();
    });

    // Switch to Format Nota tab
    const receiptTab = screen.getByRole('tab', { name: /Format Nota & Struk/i });
    fireEvent.click(receiptTab);

    await waitFor(() => {
      expect(screen.getByText(/Ukuran Kertas & Tipografi/i)).toBeInTheDocument();
      expect(screen.getByText(/Pratinjau Nota Langsung/i)).toBeInTheDocument();
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
