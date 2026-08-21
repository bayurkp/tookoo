import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { CloudBackupCard } from '../cloud-backup-card';

describe('CloudBackupCard', () => {
  it('renders cloud backup title and tabs', async () => {
    renderWithProviders(<CloudBackupCard />);

    await waitFor(() => {
      expect(
        screen.getByText('Cadangan Awan & Pemulihan Google Drive')
      ).toBeInTheDocument();
      expect(screen.getByText('Google Drive Cloud')).toBeInTheDocument();
      expect(screen.getByText('Jadwal Otomatis')).toBeInTheDocument();
    });
  });

  it('renders OAuth connect description and button', async () => {
    renderWithProviders(<CloudBackupCard />);

    await waitFor(() => {
      expect(screen.getByText(/Otorisasi Akun Google/i)).toBeInTheDocument();
      expect(screen.getByText('Hubungkan Akun Google')).toBeInTheDocument();
    });
  });
});
