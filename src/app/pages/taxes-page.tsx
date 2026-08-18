import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { TaxManagerTab } from '@/features/products/components/tax-manager-tab';

export const TaxesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('taxes.title', 'Pajak & Biaya Layanan')}
        description={t(
          'taxes.subtitle',
          'Atur tarif Pajak Restoran (PB1), PPN, Service Charge, dan biaya bungkus (Takeaway Fee) yang otomatis dihitung kasir.'
        )}
      />

      {/* Tax Manager Tab Content */}
      <TaxManagerTab />
    </div>
  );
};

export default TaxesPage;
