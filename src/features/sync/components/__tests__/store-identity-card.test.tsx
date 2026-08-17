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

    const saveNameBtn = screen.getByRole('button', { name: /Simpan Nama/i });
    fireEvent.click(saveNameBtn);
    expect(handleUpdateName).toHaveBeenCalledWith('Tookoo Coffee Shop');
  });
});
