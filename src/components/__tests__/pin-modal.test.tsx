import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PinModal } from '../pin-modal';

describe('PinModal', () => {
  it('calls onSuccess when correct PIN is entered', () => {
    const handleSuccess = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <PinModal
        open={true}
        onOpenChange={handleOpenChange}
        correctPin="123456"
        onSuccess={handleSuccess}
      />
    );

    const input = screen.getByPlaceholderText('• • • • • •');
    fireEvent.change(input, { target: { value: '123456' } });

    const unlockBtn = screen.getByRole('button', { name: /Buka Akses/i });
    fireEvent.click(unlockBtn);

    expect(handleSuccess).toHaveBeenCalled();
  });

  it('shows error when wrong PIN is entered', () => {
    const handleSuccess = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <PinModal
        open={true}
        onOpenChange={handleOpenChange}
        correctPin="123456"
        onSuccess={handleSuccess}
      />
    );

    const input = screen.getByPlaceholderText('• • • • • •');
    fireEvent.change(input, { target: { value: '999999' } });

    const unlockBtn = screen.getByRole('button', { name: /Buka Akses/i });
    fireEvent.click(unlockBtn);

    expect(handleSuccess).not.toHaveBeenCalled();
    expect(screen.getByText(/PIN yang Anda masukkan salah/i)).toBeInTheDocument();
  });
});
