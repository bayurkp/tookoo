import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { CloudBackupCard } from '../cloud-backup-card';

describe('CloudBackupCard', () => {
  it('renders cloud backup title and tabs', async () => {
    renderWithProviders(<CloudBackupCard />);

    await waitFor(() => {
      expect(
        screen.getByText('Cadangan Awan & Pemulihan')
      ).toBeInTheDocument();
      expect(screen.getByText('Jadwal Otomatis')).toBeInTheDocument();
      expect(screen.getByText('Google Drive')).toBeInTheDocument();
      expect(screen.getByText('Telegram Bot')).toBeInTheDocument();
      expect(screen.getByText('Discord Webhook')).toBeInTheDocument();
    });
  });

  it('renders auto-backup schedule options', async () => {
    renderWithProviders(<CloudBackupCard />);

    await waitFor(() => {
      expect(screen.getByText('Frekuensi Cadangan Otomatis')).toBeInTheDocument();
      expect(screen.getByText('Target Otomatis Cloud')).toBeInTheDocument();
    });
  });
});
