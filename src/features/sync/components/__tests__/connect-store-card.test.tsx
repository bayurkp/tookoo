import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConnectStoreCard } from '../connect-store-card';

describe('ConnectStoreCard', () => {
  it('renders direct 12-words input and camera button', () => {
    const handlePairSuccess = vi.fn();
    const handleOpenScanner = vi.fn();

    render(
      <ConnectStoreCard
        onPairSuccess={handlePairSuccess}
        onOpenScanner={handleOpenScanner}
      />
    );

    expect(screen.getByText(/Sambungkan ke Toko Lain/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apple banana cherry/i)).toBeInTheDocument();

    const scanBtn = screen.getByRole('button', { name: /Buka Kamera Pindai QR/i });
    fireEvent.click(scanBtn);
    expect(handleOpenScanner).toHaveBeenCalledTimes(1);
  });

  it('submits valid 12-word passphrase and triggers onPairSuccess', () => {
    const handlePairSuccess = vi.fn();
    const handleOpenScanner = vi.fn();

    render(
      <ConnectStoreCard
        onPairSuccess={handlePairSuccess}
        onOpenScanner={handleOpenScanner}
      />
    );

    const textarea = screen.getByPlaceholderText(/apple banana cherry/i);
    fireEvent.change(textarea, {
      target: {
        value: 'ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber',
      },
    });

    const submitBtn = screen.getByRole('button', { name: /Hubungkan ke Toko/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    expect(handlePairSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        passphrase: 'ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber',
      })
    );
  });
});
