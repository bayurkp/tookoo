import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { ReceiptSettingsSection } from '@/features/settings/components/receipt-settings-section';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import type { ReceiptSettings } from '@/types/store.types';

export const ReceiptPage: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useP2pSync();

  const handleSaveReceiptSettings = async (receiptSettings: ReceiptSettings) => {
    await updateSettings({
      receiptSettings,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('receipt.title', 'Desain Nota & Struk Kasir')}
        description={t(
          'receipt.subtitle',
          'Kustomisasi format cetak nota struk, logo toko, catatan kaki struk, ukuran kertas (58mm/80mm), dan opsi cetak otomatis.'
        )}
      />

      {/* Main Receipt Designer Component */}
      <ReceiptSettingsSection settings={settings || null} onSave={handleSaveReceiptSettings} />
    </div>
  );
};

export default ReceiptPage;
