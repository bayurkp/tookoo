import React from 'react';
import { DiscountManagerTab } from '@/features/products/components/discount-manager-tab';
import { Tag } from 'lucide-react';

export const DiscountsPage: React.FC = () => {
  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Diskon & Voucher Promosi
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Atur kode voucher promo, diskon otomatis pesanan, dan potongan harga bertingkat untuk
          kasir.
        </p>
      </div>

      {/* Main Discount Content */}
      <DiscountManagerTab />
    </div>
  );
};

export default DiscountsPage;
