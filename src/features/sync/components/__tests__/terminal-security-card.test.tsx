import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TerminalSecurityCard } from '../terminal-security-card';
import { useAuthStore } from '@/stores/auth-store';
import type { StoreSettings } from '@/types/store.types';

const mockSettings: StoreSettings = {
  id: 'store-1',
  storeName: 'Test Store',
  deviceName: 'Terminal 1',
  passphrase: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
  storeSecretKey: 'secret-1',
  ownerPin: '1234',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('TerminalSecurityCard', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentRole: 'OWNER' });
  });

  it('allows owner to switch to manager or cashier directly', () => {
    const handleUpdateRole = vi.fn();
    render(
      <TerminalSecurityCard settings={mockSettings} onUpdateRole={handleUpdateRole} />
    );

    const managerBtn = screen.getByRole('button', { name: /manajer/i });
    fireEvent.click(managerBtn);
    expect(handleUpdateRole).toHaveBeenCalledWith('MANAGER');

    const cashierBtn = screen.getByRole('button', { name: /kasir/i });
    fireEvent.click(cashierBtn);
    expect(handleUpdateRole).toHaveBeenCalledWith('CASHIER');
  });

  it('prompts PIN modal when cashier tries to switch to manager or owner', () => {
    useAuthStore.setState({ currentRole: 'CASHIER' });
    const handleUpdateRole = vi.fn();

    render(
      <TerminalSecurityCard settings={mockSettings} onUpdateRole={handleUpdateRole} />
    );

    const ownerBtn = screen.getByTitle(/Perlu PIN Pemilik untuk beralih ke peran Pemilik/i);
    fireEvent.click(ownerBtn);

    // PIN modal should appear
    expect(screen.getByText(/Otorisasi PIN Pemilik/i)).toBeInTheDocument();
    expect(handleUpdateRole).not.toHaveBeenCalled();

    // Enter correct PIN
    const pinInput = screen.getByPlaceholderText(/• • • • • •/i);
    fireEvent.change(pinInput, { target: { value: '1234' } });

    const unlockBtn = screen.getByRole('button', { name: /Buka Akses/i });
    fireEvent.click(unlockBtn);

    expect(handleUpdateRole).toHaveBeenCalledWith('OWNER');
  });

  it('allows manager to switch to cashier without PIN, but requires PIN to become owner', () => {
    useAuthStore.setState({ currentRole: 'MANAGER' });
    const handleUpdateRole = vi.fn();

    render(
      <TerminalSecurityCard settings={mockSettings} onUpdateRole={handleUpdateRole} />
    );

    // Manager -> Cashier (demotion) -> No PIN
    const cashierBtn = screen.getByRole('button', { name: /kasir/i });
    fireEvent.click(cashierBtn);
    expect(handleUpdateRole).toHaveBeenCalledWith('CASHIER');

    // Manager -> Owner (promotion) -> Requires PIN
    const ownerBtn = screen.getByTitle(/Perlu PIN Pemilik untuk beralih ke peran Pemilik/i);
    fireEvent.click(ownerBtn);
    expect(screen.getByText(/Otorisasi PIN Pemilik/i)).toBeInTheDocument();
  });
});
