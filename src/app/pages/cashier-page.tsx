import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookmarkCheck, ShoppingCart } from 'lucide-react';
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

  // Reactive state subscriptions to cart items & discount
  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const clearCart = useCartStore((state) => state.clearCart);
  const addItem = useCartStore((state) => state.addItem);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const cartTotal = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (!discount) return subtotal;
    if (discount.type === 'PERCENTAGE') {
      const disc = Math.round((subtotal * discount.value) / 100);
      return Math.max(0, subtotal - disc);
    }
    return Math.max(0, subtotal - discount.value);
  }, [items, discount]);

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
    <div className="h-full flex-1 flex flex-col min-h-0 space-y-4 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight truncate">
            {t('cashier.title', 'Terminal Kasir')}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm truncate">
            {isSimple
              ? t('cashier.simpleSubtitle', 'Klik produk untuk menambahkan ke pesanan.')
              : t(
                  'cashier.subtitle',
                  'Pilih menu untuk menambahkan ke keranjang belanja.'
                )}
          </p>
        </div>

        {/* Action Button: Pending Orders */}
        {(isAdvanced || pendingOrders.length > 0) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPendingOrdersOpen(true)}
            className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-bold text-xs h-8 px-2.5 cursor-pointer shrink-0"
          >
            <BookmarkCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{t('cashier.pendingOrders.button', 'Pesanan Tertunda')}</span>
            <span className="sm:hidden">Tertunda</span>
            {pendingOrders.length > 0 && (
              <Badge className="bg-amber-600 text-white font-extrabold text-[10px] px-1 py-0 h-4">
                {pendingOrders.length}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Main Cashier Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden">
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

      {/* Floating Bottom Cart Bar (Full Width of Terminal Kasir Section) */}
      <div className="absolute bottom-0 inset-x-0 z-30 lg:hidden pointer-events-none pb-0.5 sm:pb-1">
        <Button
          onClick={() => setIsMobileCartOpen(true)}
          size="default"
          className="pointer-events-auto w-full h-11 px-4 rounded-xl shadow-lg bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-between cursor-pointer border border-primary-foreground/15 active:scale-[0.98] transition-all"
        >
          {/* Left: Cart Icon & Count Badge */}
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span className="h-5.5 min-w-[22px] px-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground flex items-center justify-center font-mono font-semibold text-xs">
              {itemCount}
            </span>
          </div>

          {/* Right: Price */}
          <span className="font-mono font-bold text-xs sm:text-sm tracking-tight">
            {formatCurrency(cartTotal)}
          </span>
        </Button>
      </div>

      {/* Mobile Cart Sheet Drawer */}
      <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t('cashier.cart.title', 'Keranjang Belanja')}</SheetTitle>
            <SheetDescription>
              {t('cashier.cart.itemCount', { count: itemCount })}
            </SheetDescription>
          </SheetHeader>
          <CartPanel
            className="border-0 rounded-none h-full"
            onClose={() => setIsMobileCartOpen(false)}
            onProceedToPayment={() => {
              setIsMobileCartOpen(false);
              setPendingOrderToPay(null);
              setIsPaymentModalOpen(true);
            }}
          />
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
