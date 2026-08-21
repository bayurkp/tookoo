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
      expect(screen.getByText('Tampilan & Suara')).toBeInTheDocument();
      expect(screen.getByText('Keamanan & PIN')).toBeInTheDocument();
      expect(screen.getByText('Cadangkan & Reset Data')).toBeInTheDocument();
    });

    // Switch to Keamanan & PIN tab
    const securityTab = screen.getByRole('tab', { name: /Keamanan & PIN/i });
    fireEvent.keyDown(securityTab, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/PIN Pemilik Toko/i)).toBeInTheDocument();
    });

    // Switch to Cadangkan & Reset Data tab
    const dataTab = screen.getByRole('tab', { name: /Cadangkan & Reset Data/i });
    fireEvent.keyDown(dataTab, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Pembersihan & Reset Basis Data Lokal/i)).toBeInTheDocument();
    });
  });

  it('allows toggling theme modes', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Tema & Tampilan/i)).toBeInTheDocument();
    });

    const lightButton = screen.getByRole('button', { name: /Terang/i });
    expect(lightButton).toBeInTheDocument();
    fireEvent.click(lightButton);
  });
});
