import React from 'react';
import { ReceiptSettingsSection } from '@/features/settings/components/receipt-settings-section';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import type { ReceiptSettings } from '@/types/store.types';
import { Printer } from 'lucide-react';

export const ReceiptPage: React.FC = () => {
  const { settings, updateSettings } = useP2pSync();

  const handleSaveReceiptSettings = async (receiptSettings: ReceiptSettings) => {
    await updateSettings({
      receiptSettings,
    });
  };

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Printer className="h-6 w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Desain Nota & Struk Kasir
          </h1>
        </div>
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
