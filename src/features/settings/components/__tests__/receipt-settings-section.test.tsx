import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReceiptSettingsSection } from '../receipt-settings-section';
import { DEFAULT_RECEIPT_SETTINGS } from '@/types/store.types';
import type { StoreSettings } from '@/types/store.types';

const mockSettings: StoreSettings = {
  id: 'store-1',
  storeName: 'Kedai Kopi Mantap',
  storeAddress: 'Jl. Melati No. 10',
  defaultCashier: 'Budi Kasir',
  receiptSettings: {
    ...DEFAULT_RECEIPT_SETTINGS,
    headerTitle: 'Kedai Kopi Mantap',
    paperWidth: '58mm',
    fontFamily: 'monospace',
    showQueueNumber: true,
  },
  passphrase: 'apple banana cherry dog elephant fox grape horse igloo jaguar kangaroo lion',
  storeSecretKey: 'secret-key-123',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('ReceiptSettingsSection', () => {
  it('renders receipt settings form and live thermal preview', () => {
    const onSave = vi.fn();
    render(<ReceiptSettingsSection settings={mockSettings} onSave={onSave} />);

    expect(screen.getByText('Ukuran Kertas & Tipografi')).toBeInTheDocument();
    expect(screen.getByText('Identitas & Header Nota')).toBeInTheDocument();
    expect(screen.getByText('Visibilitas Konten & Rincian Struk')).toBeInTheDocument();
    expect(screen.getByText('Pratinjau Nota Langsung (Live Preview)')).toBeInTheDocument();

    // Check Live preview reflects store name
    expect(screen.getByText('KEDAI KOPI MANTAP')).toBeInTheDocument();
    expect(screen.getByText('#A-042')).toBeInTheDocument();
  });

  it('submits updated receipt settings when form is submitted', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ReceiptSettingsSection settings={mockSettings} onSave={onSave} />);

    const taglineInput = screen.getByPlaceholderText(/Contoh: Coffee & Eatery/i);
    fireEvent.change(taglineInput, { target: { value: 'Kopi Nikmat Setiap Hari' } });

    const submitBtn = screen.getByRole('button', { name: /Simpan Format Nota/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          headerSubtitle: 'Kopi Nikmat Setiap Hari',
          paperWidth: '58mm',
        })
      );
    });
  });
});
