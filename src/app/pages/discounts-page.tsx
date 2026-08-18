import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { DiscountManagerTab } from '@/features/products/components/discount-manager-tab';

export const DiscountsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('discounts.title', 'Diskon & Promosi')}
        description={t(
          'discounts.subtitle',
          'Atur kode voucher promo, diskon otomatis pesanan, dan potongan harga bertingkat untuk kasir.'
        )}
      />

      {/* Main Discount Content */}
      <DiscountManagerTab />
    </div>
  );
};

export default DiscountsPage;
