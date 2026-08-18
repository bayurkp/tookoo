import React from 'react';
import { TaxManagerTab } from '@/features/products/components/tax-manager-tab';
import { Receipt } from 'lucide-react';

export const TaxesPage: React.FC = () => {
  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Pajak & Biaya Layanan
          </h1>
        </div>
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
