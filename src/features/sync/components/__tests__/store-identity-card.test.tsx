import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreIdentityCard } from '../store-identity-card';
import type { StoreSettings } from '@/types/store.types';

const mockSettings: StoreSettings = {
  id: 'store-123',
  storeName: 'Tookoo Coffee Shop',
  passphrase: 'ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber',
  storeSecretKey: 'secret-key-123',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('StoreIdentityCard', () => {
  it('renders store details and triggers name update', () => {
    const handleUpdateName = vi.fn();
    const handleRegen = vi.fn();

    render(
      <StoreIdentityCard
        settings={mockSettings}
        onUpdateStoreName={handleUpdateName}
        onRegeneratePassphrase={handleRegen}
      />
    );

    expect(screen.getByDisplayValue('Tookoo Coffee Shop')).toBeInTheDocument();
    expect(screen.getByText(/ocean forest monkey/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Simpan/i });
    fireEvent.click(saveBtn);
    expect(handleUpdateName).toHaveBeenCalledWith('Tookoo Coffee Shop');
  });
});
