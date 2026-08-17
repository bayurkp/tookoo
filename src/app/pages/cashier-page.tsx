import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '@/features/products/hooks/use-products';
import { ProductGrid } from '@/features/cashier/components/product-grid';
import { CartPanel } from '@/features/cashier/components/cart-panel';
import { PaymentModal } from '@/features/cashier/components/payment-modal';
import { OrderSuccessDialog } from '@/features/cashier/components/order-success-dialog';
import type { Order } from '@/types/order.types';

export const CashierPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useProducts();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handlePaymentSuccess = (order: Order) => {
    setCompletedOrder(order);
  };

  const handleNewTransaction = () => {
    setCompletedOrder(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('cashier.title', 'Terminal Kasir')}
          </h2>
          <p className="text-muted-foreground text-sm">
            Pilih menu untuk menambahkan ke keranjang transaksi pelanggan.
          </p>
        </div>
      </div>

      {/* Main Cashier Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left: Product Catalog Grid */}
        <div className="lg:col-span-7 xl:col-span-8 h-full flex flex-col overflow-hidden">
          <ProductGrid products={products} isLoading={isLoading} />
        </div>

        {/* Right: Cart Panel */}
        <div className="lg:col-span-5 xl:col-span-4 h-full flex flex-col overflow-hidden">
          <CartPanel onProceedToPayment={() => setIsPaymentModalOpen(true)} />
        </div>
      </div>

      {/* Payment Processing Modal */}
      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Order Success & Receipt Dialog */}
      <OrderSuccessDialog
        order={completedOrder}
        open={Boolean(completedOrder)}
        onOpenChange={(open) => {
          if (!open) setCompletedOrder(null);
        }}
        onNewTransaction={handleNewTransaction}
      />
    </div>
  );
};

export default CashierPage;
