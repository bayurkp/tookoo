import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, BookmarkCheck } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/use-products';
import { useOrders, useUpsertOrder } from '@/features/orders/hooks/use-orders';
import { useAppMode } from '@/hooks/use-app-mode';
import { ProductGrid } from '@/features/cashier/components/product-grid';
import { CartPanel } from '@/features/cashier/components/cart-panel';
import { PaymentModal } from '@/features/cashier/components/payment-modal';
import { PendingOrdersSheet } from '@/features/cashier/components/pending-orders-sheet';
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
import type { Product } from '@/types/product.types';

export const CashierPage: React.FC = () => {
  const { t } = useTranslation();
  const { isSimple, isAdvanced } = useAppMode();
  const { data: products = [], isLoading } = useProducts();
  const { data: orders = [] } = useOrders();
  const upsertOrderMutation = useUpsertOrder();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPendingOrdersOpen, setIsPendingOrdersOpen] = useState(false);
  const [pendingOrderToPay, setPendingOrderToPay] = useState<Order | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const getItemCount = useCartStore((state) => state.getItemCount);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const addItem = useCartStore((state) => state.addItem);

  const itemCount = getItemCount();
  const cartTotal = getTotal();

  const pendingOrders = orders.filter((o) => o.status === 'PENDING' && o.deletedAt === null);

  const handlePaymentSuccess = (order: Order) => {
    setIsMobileCartOpen(false);
    setPendingOrderToPay(null);
    setCompletedOrder(order);
  };

  const handleNewTransaction = () => {
    setCompletedOrder(null);
    setPendingOrderToPay(null);
  };

  const handlePayPendingOrder = (order: Order) => {
    setPendingOrderToPay(order);
    setIsPaymentModalOpen(true);
  };

  const handleEditPendingOrder = async (order: Order) => {
    clearCart();

    // Reconstruct cart items from the pending order
    order.items.forEach((item) => {
      const existingProduct = products.find((p) => p.id === item.productId);
      const productObj: Product = existingProduct || {
        id: item.productId,
        name: item.name,
        category: 'Umum',
        unit: item.unit || 'pcs',
        price: item.price,
        stock: 9999,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null,
      };

      const matchedVariant = existingProduct?.variants?.find((v) => v.name === item.variantName);

      addItem(productObj, item.qty, matchedVariant);
    });

    // Soft delete previous pending order so it doesn't duplicate
    await upsertOrderMutation.mutateAsync({
      ...order,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('cashier.title', 'Terminal Kasir')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSimple
              ? t('cashier.simpleSubtitle', 'Klik produk untuk menambahkan ke keranjang belanja.')
              : t(
                  'cashier.subtitle',
                  'Pilih menu untuk menambahkan ke keranjang belanja pelanggan.'
                )}
          </p>
        </div>

        {/* Pending Orders (Open Bills) Quick Button */}
        {(isAdvanced || pendingOrders.length > 0) && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPendingOrdersOpen(true)}
            className="gap-2 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-bold text-xs h-9 cursor-pointer"
          >
            <BookmarkCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{t('cashier.pendingOrders.button', 'Pesanan Tertunda')}</span>
            {pendingOrders.length > 0 && (
              <Badge className="bg-amber-600 text-white font-extrabold text-[11px] px-1.5 py-0 h-5">
                {pendingOrders.length}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Main Cashier Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left: Product Catalog Grid */}
        <div className="lg:col-span-7 xl:col-span-8 h-full flex flex-col overflow-hidden">
          <ProductGrid products={products} isLoading={isLoading} />
        </div>

        {/* Right: Desktop Cart Panel */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 h-full flex-col overflow-hidden">
          <CartPanel
            onProceedToPayment={() => {
              setPendingOrderToPay(null);
              setIsPaymentModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Floating Cart Button for Mobile Screens (lg:hidden) */}
      {itemCount > 0 && (
        <div className="fixed bottom-20 right-4 z-40 lg:hidden">
          <Button
            onClick={() => setIsMobileCartOpen(true)}
            size="lg"
            className="h-14 px-5 rounded-full border-2 border-background gap-3 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
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
                setPendingOrderToPay(null);
                setIsPaymentModalOpen(true);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Pending Orders (Open Bills) Sheet */}
      <PendingOrdersSheet
        open={isPendingOrdersOpen}
        onOpenChange={setIsPendingOrdersOpen}
        onPayOrder={handlePayPendingOrder}
        onEditOrder={handleEditPendingOrder}
      />

      {/* Payment Processing Modal */}
      <PaymentModal
        open={isPaymentModalOpen}
        pendingOrder={pendingOrderToPay}
        onOpenChange={(open) => {
          setIsPaymentModalOpen(open);
          if (!open) setPendingOrderToPay(null);
        }}
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
