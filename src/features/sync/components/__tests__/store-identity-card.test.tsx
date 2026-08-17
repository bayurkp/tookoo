import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreIdentityCard } from '../store-identity-card';
import type { StoreSettings } from '@/types/store.types';

const mockSettings: StoreSettings = {
  id: 'store-123',
  storeName: 'Tookoo Coffee Shop',
  deviceName: 'Kasir Utama',
  passphrase: 'ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber',
  storeSecretKey: 'secret-key-123',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('StoreIdentityCard', () => {
  it('renders store details and triggers name update', () => {
    const handleUpdateName = vi.fn();
    const handleUpdateDeviceName = vi.fn();
    const handleRegen = vi.fn();

    render(
      <StoreIdentityCard
        settings={mockSettings}
        onUpdateStoreName={handleUpdateName}
        onUpdateDeviceName={handleUpdateDeviceName}
        onRegeneratePassphrase={handleRegen}
      />
    );

    expect(screen.getByDisplayValue('Tookoo Coffee Shop')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kasir Utama')).toBeInTheDocument();
    expect(screen.getByText(/ocean forest monkey/i)).toBeInTheDocument();

    const saveNameBtn = screen.getByRole('button', { name: /Simpan Nama Toko/i });
    fireEvent.click(saveNameBtn);
    expect(handleUpdateName).toHaveBeenCalledWith('Tookoo Coffee Shop');

    const saveDeviceBtn = screen.getByRole('button', { name: /Simpan Nama Perangkat/i });
    fireEvent.click(saveDeviceBtn);
    expect(handleUpdateDeviceName).toHaveBeenCalledWith('Kasir Utama');
  });

  it('opens confirmation modal before regenerating passphrase', () => {
    const handleRegen = vi.fn();

    render(
      <StoreIdentityCard
        settings={mockSettings}
        onUpdateStoreName={vi.fn()}
        onUpdateDeviceName={vi.fn()}
        onRegeneratePassphrase={handleRegen}
      />
    );

    const regenBtn = screen.getByRole('button', { name: /Ganti Kunci Baru/i });
    fireEvent.click(regenBtn);

    expect(screen.getByText(/Ganti Kunci Keamanan Toko\?/i)).toBeInTheDocument();
    expect(screen.getByText(/memutuskan sambungan seluruh perangkat kasir lain/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Ya, Ganti Kunci Baru/i });
    fireEvent.click(confirmBtn);

    expect(handleRegen).toHaveBeenCalledTimes(1);
  });
});
