import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QrScannerModal } from '../qr-scanner-modal';

describe('QrScannerModal', () => {
  it('renders modal with camera and 12-words tabs', () => {
    render(<QrScannerModal open={true} onOpenChange={vi.fn()} onPairSuccess={vi.fn()} />);

    expect(screen.getByText(/Sambungkan Perangkat Kasir|Pairing Terminal Kasir/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pindai Kamera/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /12 Kata Kunci/i })).toBeInTheDocument();
  });

  it('validates 12 words passphrase on manual pairing', () => {
    const onPairSuccess = vi.fn();
    render(<QrScannerModal open={true} onOpenChange={vi.fn()} onPairSuccess={onPairSuccess} />);

    // Switch to manual tab
    const manualTab = screen.getByRole('tab', { name: /12 Kata Kunci/i });
    fireEvent.keyDown(manualTab, { key: 'Enter' });

    const textarea = screen.getByPlaceholderText(/ocean forest monkey/i);
    fireEvent.change(textarea, { target: { value: 'only three words' } });

    fireEvent.click(screen.getByText(/Hubungkan Toko|Sambungkan ke Toko/i));

    expect(screen.getByText(/harus terdiri dari tepat 12 kata/i)).toBeInTheDocument();
    expect(onPairSuccess).not.toHaveBeenCalled();
  });

  it('calls onPairSuccess when valid 12-words passphrase is submitted', () => {
    const onPairSuccess = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <QrScannerModal open={true} onOpenChange={onOpenChange} onPairSuccess={onPairSuccess} />
    );

    const manualTab = screen.getByRole('tab', { name: /12 Kata Kunci/i });
    fireEvent.keyDown(manualTab, { key: 'Enter' });

    const textarea = screen.getByPlaceholderText(/ocean forest monkey/i);
    fireEvent.change(textarea, {
      target: {
        value: 'ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber',
      },
    });

    fireEvent.click(screen.getByText(/Hubungkan Toko|Sambungkan ke Toko/i));

    expect(onPairSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        passphrase:
          'ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber',
      })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
