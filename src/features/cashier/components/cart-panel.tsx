import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, Percent, BookmarkPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { HoldOrderDialog } from './hold-order-dialog';
import { useCartStore } from '../stores/cart-store';
import { CurrencyInput } from '@/components/ui/currency-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { getCurrencyConfig } from '@/utils/currency-config';
import { formatCurrency } from '@/utils/format-currency';

interface CartPanelProps {
  onProceedToPayment: () => void;
  onHoldSuccess?: (orderNumber: string) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onProceedToPayment, onHoldSuccess }) => {
  const { t } = useTranslation();
  const { settings } = useP2pSync();
  const currencyConfig = getCurrencyConfig(settings?.currency);

  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const setDiscount = useCartStore((state) => state.setDiscount);
  const clearCart = useCartStore((state) => state.clearCart);

  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItemCount = useCartStore((state) => state.getItemCount);

  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();
  const itemCount = getItemCount();

  const handleApplyDiscount = () => {
    const val = Number(discountValue);
    if (val > 0) {
      setDiscount({ type: discountType, value: val });
    } else {
      setDiscount(null);
    }
    setShowDiscountInput(false);
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    setDiscountValue('');
  };

  return (
    <Card className="flex flex-col h-full border-border/80 shadow-none">
      {/* Header */}
      <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-bold">
            {t('cashier.cart.title', 'Keranjang Belanja')}
          </CardTitle>
          {itemCount > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0">
              {t('cashier.cart.itemCount', { count: itemCount })}
            </Badge>
          )}
        </div>

        {items.length > 0 && (
          <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {t('cashier.cart.clear', 'Kosongkan')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kosongkan Keranjang?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua item dan pesanan di keranjang saat ini akan dihapus.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsClearDialogOpen(false)}>
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearCart();
                    setIsClearDialogOpen(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                >
                  Ya, Kosongkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>

      {/* Cart Items List */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full w-full p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2 py-10">
              <div className="p-3 bg-muted rounded-full">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">{t('cashier.cart.empty', 'Keranjang masih kosong')}</p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {t('cashier.cart.emptySubtitle', 'Pilih produk di sebelah kiri untuk menambahkan ke pesanan.')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {items.map((item) => {
                const maxStock = item.selectedVariant ? item.selectedVariant.stock : item.product.stock;
                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-lg border bg-card/60 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="text-[11px] text-primary font-medium truncate">
                          {item.selectedVariant.name}
                        </p>
                      )}
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          +{item.selectedModifiers.map((m) => m.name).join(', ')}
                        </p>
                      )}
                      <p className="text-muted-foreground font-mono mt-0.5">
                        {item.quantity} {item.selectedVariant ? 'unit' : (item.product.unit || 'pcs')} @ {formatCurrency(item.unitPrice, settings?.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <p className="font-bold text-foreground font-mono mr-1">
                        {formatCurrency(item.totalPrice, settings?.currency)}
                      </p>

                      <div className="flex items-center border rounded-md bg-background">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Kurangi kuantitas"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0 hover:bg-muted cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Tambah kuantitas"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= maxStock}
                          className="h-6 w-6 p-0 hover:bg-muted cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Cart Summary & Checkout Actions */}
      <CardFooter className="p-4 border-t flex flex-col gap-3 bg-muted/20">
        {/* Discount Section */}
        {items.length > 0 && (
          <div className="w-full space-y-2">
            {discount ? (
              <div className="flex items-center justify-between p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Tag className="h-3.5 w-3.5" />
                  <span>
                    Diskon{' '}
                    {discount.type === 'PERCENTAGE'
                      ? `${discount.value}%`
                      : formatCurrency(discount.value, settings?.currency)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDiscount}
                  className="h-5 px-1.5 text-xs text-destructive hover:bg-transparent cursor-pointer"
                >
                  {t('common.actions.delete', 'Hapus')}
                </Button>
              </div>
            ) : showDiscountInput ? (
              <div className="flex items-center gap-2 p-2 rounded-md border bg-card">
                <div className="flex rounded-md border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENTAGE')}
                    className={`px-2 py-1 text-xs ${
                      discountType === 'PERCENTAGE'
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted'
                    }`}
                  >
                    <Percent className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FIXED')}
                    className={`px-2 py-1 text-xs font-semibold ${
                      discountType === 'FIXED'
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted'
                    }`}
                  >
                    {currencyConfig.symbol}
                  </button>
                </div>
                {discountType === 'FIXED' ? (
                  <CurrencyInput
                    value={Number(discountValue) || 0}
                    currencyCode={settings?.currency}
                    onValueChange={(val) => setDiscountValue(String(val))}
                    placeholder="0"
                    className="h-7 text-xs flex-1"
                  />
                ) : (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10%"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-7 text-xs flex-1"
                  />
                )}
                <Button size="sm" onClick={handleApplyDiscount} className="h-7 px-2.5 text-xs">
                  {t('common.actions.apply', 'Pasang')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDiscountInput(false)}
                  className="h-7 px-1 text-xs"
                >
                  {t('common.actions.cancel', 'Batal')}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiscountInput(true)}
                className="w-full text-xs h-7 border-dashed gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Tag className="h-3 w-3" />
                <span>{t('cashier.cart.addDiscount', 'Tambah Diskon / Potongan')}</span>
              </Button>
            )}
          </div>
        )}

        {/* Calculation Lines */}
        <div className="w-full space-y-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>{t('cashier.cart.subtotal', 'Subtotal')}</span>
            <span className="font-mono">{formatCurrency(subtotal, settings?.currency)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>{t('cashier.cart.discount', 'Potongan')}</span>
              <span className="font-mono">-{formatCurrency(discountAmount, settings?.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold pt-2 border-t text-foreground">
            <span>{t('cashier.cart.total', 'Total')}</span>
            <span className="text-primary font-mono text-lg">{formatCurrency(total, settings?.currency)}</span>
          </div>
        </div>

        {/* Action Buttons: Hold Order & Pay Now */}
        <div className="w-full flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={items.length === 0}
            onClick={() => setIsHoldDialogOpen(true)}
            className="h-11 px-3 border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs gap-1.5 cursor-pointer shrink-0"
            title="Simpan pesanan untuk dibayar nanti"
          >
            <BookmarkPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Tunda Bayar</span>
          </Button>

          <Button
            className="flex-1 h-11 text-sm font-bold gap-2 cursor-pointer shadow-sm"
            disabled={items.length === 0}
            onClick={onProceedToPayment}
          >
            <span>{t('cashier.cart.pay', 'Bayar Sekarang')}</span>
            <span className="font-mono">({formatCurrency(total, settings?.currency)})</span>
          </Button>
        </div>
      </CardFooter>

      {/* Hold Order Dialog */}
      <HoldOrderDialog
        open={isHoldDialogOpen}
        onOpenChange={setIsHoldDialogOpen}
        onHoldSuccess={(orderNum) => {
          onHoldSuccess?.(orderNum);
        }}
      />
    </Card>
  );
};

export default CartPanel;
