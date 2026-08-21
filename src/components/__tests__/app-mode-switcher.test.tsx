import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { AppModeSwitcher } from '../app-mode-switcher';
import { db } from '@/lib/db';

describe('AppModeSwitcher', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.settings.put({
      id: 'settings-1',
      storeName: 'Test Store',
      passphrase: 'test test test test test test test test test test test test',
      storeSecretKey: 'secret-1',
      currency: 'IDR',
      appMode: 'SIMPLE',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });
  });

  it('renders inline variant with both Simple and Advanced cards', async () => {
    renderWithProviders(<AppModeSwitcher variant="inline" />);

    await waitFor(() => {
      expect(screen.getByText('Mode Sederhana')).toBeInTheDocument();
      expect(screen.getByText('Mode Lanjutan')).toBeInTheDocument();
      expect(screen.getByText('Mode Sederhana Sedang Aktif')).toBeInTheDocument();
    });
  });

  it('renders header dropdown variant and shows active mode', async () => {
    renderWithProviders(<AppModeSwitcher variant="header" />);

    await waitFor(() => {
      expect(screen.getByText('Mode Sederhana')).toBeInTheDocument();
    });
  });

  it('switches mode to ADVANCED on card click in inline variant', async () => {
    renderWithProviders(<AppModeSwitcher variant="inline" />);

    await waitFor(() => {
      expect(screen.getByText('Mode Lanjutan')).toBeInTheDocument();
    });

    const proCard = screen.getByText('Mode Lanjutan').closest('div');
    if (proCard) {
      fireEvent.click(proCard);
    }

    await waitFor(async () => {
      const updated = await db.settings.get('settings-1');
      expect(updated?.appMode).toBe('ADVANCED');
    });
  });
});
