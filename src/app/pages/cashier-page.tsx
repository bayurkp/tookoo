import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/use-products';
import { ProductGrid } from '@/features/cashier/components/product-grid';
import { CartPanel } from '@/features/cashier/components/cart-panel';
import { PaymentModal } from '@/features/cashier/components/payment-modal';
import { OrderSuccessDialog } from '@/features/cashier/components/order-success-dialog';
import { useCartStore } from '@/features/cashier/stores/cart-store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

export const CashierPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useProducts();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const itemCount = useCartStore((state) => state.getItemCount());
  const cartTotal = useCartStore((state) => state.getTotal());

  const handlePaymentSuccess = (order: Order) => {
    setIsMobileCartOpen(false);
    setCompletedOrder(order);
  };

  const handleNewTransaction = () => {
    setCompletedOrder(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('cashier.title', 'Terminal Kasir')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('cashier.subtitle', 'Pilih menu untuk menambahkan ke keranjang belanja pelanggan.')}
          </p>
        </div>
      </div>

      {/* Main Cashier Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left: Product Catalog Grid */}
        <div className="lg:col-span-7 xl:col-span-8 h-full flex flex-col overflow-hidden">
          <ProductGrid products={products} isLoading={isLoading} />
        </div>

        {/* Right: Desktop Cart Panel */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 h-full flex-col overflow-hidden">
          <CartPanel onProceedToPayment={() => setIsPaymentModalOpen(true)} />
        </div>
      </div>

      {/* Floating Cart Button for Mobile Screens (lg:hidden) */}
      {itemCount > 0 && (
        <div className="fixed bottom-20 right-4 z-40 lg:hidden">
          <Button
            onClick={() => setIsMobileCartOpen(true)}
            size="lg"
            className="h-14 px-5 rounded-full shadow-xl gap-3 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-background"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-2.5 -right-3 h-5 min-w-[20px] px-1 text-[10px] font-extrabold flex items-center justify-center rounded-full"
              >
                {itemCount}
              </Badge>
            </div>
            <span>{t('cashier.cart.title', 'Keranjang')}</span>
            <span>•</span>
            <span>{formatCurrency(cartTotal)}</span>
          </Button>
        </div>
      )}

      {/* Mobile Cart Sheet Drawer */}
      <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span>{t('cashier.cart.title', 'Keranjang Belanja')}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {t('cashier.cart.itemCount', { count: itemCount })}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-hidden p-2">
            <CartPanel
              onProceedToPayment={() => {
                setIsMobileCartOpen(false);
                setIsPaymentModalOpen(true);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

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
