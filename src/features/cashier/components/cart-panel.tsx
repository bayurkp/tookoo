import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, Percent } from 'lucide-react';
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
import { useCartStore } from '../stores/cart-store';
import { formatCurrency } from '@/utils/format-currency';

interface CartPanelProps {
  onProceedToPayment: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onProceedToPayment }) => {
  const { t } = useTranslation();
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
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-sm">
              {t('cashier.cart.empty', 'Keranjang masih kosong')}
            </p>
            <p className="text-xs text-muted-foreground/80 max-w-xs mt-1">
              {t(
                'cashier.cart.emptyHint',
                'Pilih produk dari katalog untuk memulai transaksi kasir.'
              )}
            </p>
          </div>
        ) : (
          items.map((item) => {
            const maxStock = item.selectedVariant ? item.selectedVariant.stock : item.product.stock;

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" title={item.product.name}>
                    {item.product.name}
                  </p>

                  {/* Selected Variant */}
                  {item.selectedVariant && (
                    <p className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5">
                      <span className="bg-primary/10 px-1.5 py-0.2 rounded text-[10px]">
                        {item.selectedVariant.name}
                      </span>
                    </p>
                  )}

                  {/* Selected Modifiers */}
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      + {item.selectedModifiers.map((m) => m.name).join(', ')}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatCurrency(item.unitPrice)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-muted/60 rounded-md p-0.5 border border-border/40 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-6 w-6 p-0 rounded-sm hover:bg-background"
                    aria-label="Kurangi kuantitas"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= maxStock}
                    className="h-6 w-6 p-0 rounded-sm hover:bg-background disabled:opacity-30"
                    aria-label="Tambah kuantitas"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Item Subtotal & Delete */}
                <div className="text-right min-w-[70px] shrink-0">
                  <p className="font-bold text-sm">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  aria-label={`Hapus ${item.product.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Footer / Summary Area */}
      {items.length > 0 && (
        <CardFooter className="flex flex-col p-4 pt-3 border-t bg-muted/20 space-y-3">
          {/* Discount Section */}
          <div className="w-full">
            {discount ? (
              <div className="flex items-center justify-between p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Tag className="h-3.5 w-3.5" />
                  <span>
                    Diskon{' '}
                    {discount.type === 'PERCENTAGE'
                      ? `${discount.value}%`
                      : formatCurrency(discount.value)}
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
                    Rp
                  </button>
                </div>
                <Input
                  type="number"
                  placeholder={discountType === 'PERCENTAGE' ? '10%' : '5000'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="h-7 text-xs flex-1"
                />
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
                variant="ghost"
                size="sm"
                onClick={() => setShowDiscountInput(true)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
              >
                <Tag className="h-3.5 w-3.5" />
                {t('cashier.cart.addDiscount', 'Tambah Diskon Transaksi')}
              </Button>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="w-full space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{t('cashier.cart.subtotal', 'Subtotal')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                <span>{t('cashier.cart.discount', 'Diskon')}</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline font-bold text-base pt-1 border-t border-border/60">
              <span>{t('cashier.cart.total', 'Total Bayar')}</span>
              <span className="text-xl text-primary font-extrabold tracking-tight">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <Button
            onClick={onProceedToPayment}
            disabled={items.length === 0}
            className="w-full h-11 text-base font-bold gap-2 cursor-pointer"
          >
            <span>{t('common.actions.pay', 'Bayar Sekarang')}</span>
            <span>•</span>
            <span>{formatCurrency(total)}</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CartPanel;
