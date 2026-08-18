import React from 'react';
import { ReceiptSettingsSection } from '@/features/settings/components/receipt-settings-section';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import type { ReceiptSettings } from '@/types/store.types';

export const ReceiptPage: React.FC = () => {
  const { settings, updateSettings } = useP2pSync();

  const handleSaveReceiptSettings = async (receiptSettings: ReceiptSettings) => {
    await updateSettings({
      receiptSettings,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <span>Desain Nota & Struk Kasir</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Kustomisasi format cetak nota struk, logo toko, catatan kaki struk, ukuran kertas
          (58mm/80mm), dan opsi cetak otomatis.
        </p>
      </div>

      {/* Main Receipt Designer Component */}
      <ReceiptSettingsSection settings={settings || null} onSave={handleSaveReceiptSettings} />
    </div>
  );
};

export default ReceiptPage;
