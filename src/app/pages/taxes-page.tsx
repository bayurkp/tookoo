import React from 'react';
import { TaxManagerTab } from '@/features/products/components/tax-manager-tab';

export const TaxesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <span>Pajak & Biaya Layanan</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Atur tarif Pajak Restoran (PB1), PPN, Service Charge, dan biaya bungkus (Takeaway Fee)
          yang otomatis dihitung kasir.
        </p>
      </div>

      {/* Tax Manager Tab Content */}
      <TaxManagerTab />
    </div>
  );
};

export default TaxesPage;
