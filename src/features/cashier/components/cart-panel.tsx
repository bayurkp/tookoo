import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  Percent,
  BookmarkPlus,
  X,
  AlertCircle,
} from 'lucide-react';
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
import { CustomerSelectorCombobox } from './customer-selector-combobox';
import { useCartStore } from '../stores/cart-store';
import { useMasterDiscounts } from '@/features/products/hooks/use-master-data';
import { CurrencyInput } from '@/components/ui/currency-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { useAppMode } from '@/hooks/use-app-mode';
import { getCurrencyConfig } from '@/utils/currency-config';
import { formatCurrency } from '@/utils/format-currency';
import type { MasterDiscount } from '@/types/master-data.types';

interface CartPanelProps {
  onProceedToPayment: () => void;
  onHoldSuccess?: (orderNumber: string) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onProceedToPayment, onHoldSuccess }) => {
  const { t } = useTranslation();
  const { isAdvanced } = useAppMode();
  const { settings } = useP2pSync();
  const currencyConfig = getCurrencyConfig(settings?.currency);

  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const customer = useCartStore((state) => state.customer);
  const customerName = useCartStore((state) => state.customerName);

  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const setDiscount = useCartStore((state) => state.setDiscount);
  const setCustomer = useCartStore((state) => state.setCustomer);
  const setCustomerName = useCartStore((state) => state.setCustomerName);
  const clearCart = useCartStore((state) => state.clearCart);

  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItemCount = useCartStore((state) => state.getItemCount);

  const { data: masterDiscounts = [] } = useMasterDiscounts();

  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();
  const itemCount = getItemCount();

  const activeMasterDiscounts = React.useMemo(() => {
    const now = Date.now();
    return masterDiscounts.filter((d) => {
      if (!d.isActive) return false;
      if (d.hasExpiry) {
        if (d.startDate && now < d.startDate) return false;
        if (d.endDate && now > d.endDate) return false;
      }
      return true;
    });
  }, [masterDiscounts]);

  const handleSelectMasterDiscount = (d: MasterDiscount) => {
    setDiscount({
      id: d.id,
      name: d.name,
      code: d.code,
      type: d.type,
      value: d.value,
      scope: d.scope,
      targetProductId: d.targetProductId,
      targetProductName: d.targetProductName,
      targetVariantId: d.targetVariantId,
      targetVariantName: d.targetVariantName,
      minPurchaseAmount: d.minPurchaseAmount,
      maxDiscountAmount: d.maxDiscountAmount,
    });
    setShowDiscountInput(false);
    setDiscountError(null);
  };

  const handleApplyDiscount = () => {
    setDiscountError(null);
    let val = Number(discountValue);

    if (isNaN(val) || val <= 0) {
      setDiscount(null);
      setShowDiscountInput(false);
      return;
    }

    if (discountType === 'PERCENTAGE') {
      if (val > 100) {
        setDiscountError('Diskon persentase maksimal 100%.');
        val = 100;
        setDiscountValue('100');
        return;
      }
      val = Math.min(100, Math.max(0, val));
      setDiscount({
        type: 'PERCENTAGE',
        value: val,
        name: `Diskon ${val}%`,
      });
    } else {
      if (val > subtotal) {
        setDiscountError(`Nominal diskon tidak boleh melebihi subtotal (${formatCurrency(subtotal, settings?.currency)}).`);
        val = subtotal;
        setDiscountValue(String(subtotal));
        return;
      }
      val = Math.min(subtotal, Math.max(0, val));
      setDiscount({
        type: 'FIXED',
        value: val,
        name: `Diskon ${formatCurrency(val, settings?.currency)}`,
      });
    }

    setShowDiscountInput(false);
    setDiscountValue('');
    setDiscountError(null);
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    setDiscountValue('');
    setDiscountError(null);
  };

  return (
    <Card className="flex flex-col h-full border-border/80 shadow-none">
      {/* Header */}
      <CardHeader className="p-3.5 pb-2.5 border-b flex flex-row items-center justify-between gap-2 space-y-0 overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          <ShoppingCart className="h-4 w-4 text-primary shrink-0" />
          <CardTitle className="text-sm font-bold truncate whitespace-nowrap shrink-0">
            {t('cashier.cart.title', 'Keranjang Belanja')}
          </CardTitle>
          {itemCount > 0 && (
            <Badge
              variant="secondary"
              className="text-[11px] px-1.5 py-0 font-bold font-mono shrink-0 truncate max-w-[75px]"
              title={`${itemCount} item`}
            >
              {itemCount > 999 ? '999+' : itemCount} item
            </Badge>
          )}
        </div>

        {items.length > 0 && (
          <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive shrink-0 whitespace-nowrap cursor-pointer"
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
              <p className="text-sm font-medium">
                {t('cashier.cart.empty', 'Keranjang masih kosong')}
              </p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {t(
                  'cashier.cart.emptySubtitle',
                  'Pilih produk di sebelah kiri untuk menambahkan ke pesanan.'
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 pr-1">
              {items.map((item) => {
                const maxStock = item.selectedVariant
                  ? item.selectedVariant.stock
                  : item.product.stock;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1.5 p-2.5 rounded-lg border bg-card/60 text-xs hover:border-primary/30 transition-colors"
                  >
                    {/* Line 1: Item Name & Variant (Left) + Line Total Price (Right) */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate leading-tight" title={item.product.name}>
                          {item.product.name}
                        </p>
                        {item.selectedVariant && (
                          <p className="text-[11px] text-primary font-medium truncate mt-0.5">
                            {item.selectedVariant.name}
                          </p>
                        )}
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            +{item.selectedModifiers.map((m) => m.name).join(', ')}
                          </p>
                        )}
                      </div>

                      <span className="font-bold text-foreground font-mono text-xs shrink-0 max-w-[120px] truncate text-right">
                        {formatCurrency(item.unitPrice * item.quantity, settings?.currency)}
                      </span>
                    </div>

                    {/* Line 2: Unit Price Breakdown (Left) + Stepper & Trash (Right) */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                      <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[105px]">
                        @ {formatCurrency(item.unitPrice, settings?.currency)}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Stepper with editable numeric input */}
                        <div className="flex items-center border rounded-md bg-background shadow-2xs">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label="Kurangi kuantitas"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0 hover:bg-muted cursor-pointer shrink-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <input
                            type="number"
                            min="1"
                            max={maxStock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                updateQuantity(item.id, val);
                              }
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) {
                                updateQuantity(item.id, 1);
                              }
                            }}
                            className="w-9 h-6 text-center font-mono font-bold text-xs bg-transparent border-x focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label="Tambah kuantitas"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                            className="h-6 w-6 p-0 hover:bg-muted cursor-pointer disabled:opacity-40 shrink-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0 ml-0.5"
                          onClick={() => removeItem(item.id)}
                          title="Hapus item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Cart Summary & Checkout Actions */}
      <CardFooter className="p-4 border-t flex flex-col gap-2.5 bg-muted/20">
        {/* Customer / Member / Guest Selector (Uniform h-8) */}
        {items.length > 0 && (
          <div className="w-full">
            <CustomerSelectorCombobox
              selectedCustomer={customer}
              customerName={customerName}
              onSelectCustomer={(cust) => {
                setCustomer(cust);
                if (cust?.discountPercentage && cust.discountPercentage > 0 && !discount) {
                  setDiscount({
                    name: `Diskon Member ${cust.name}`,
                    type: 'PERCENTAGE',
                    value: cust.discountPercentage,
                  });
                }
              }}
              onSetGuestName={(name) => setCustomerName(name)}
              onClear={() => {
                setCustomer(null);
                setCustomerName(null);
              }}
            />
          </div>
        )}

        {/* Discount Section (Uniform h-8 & Strict Validation) */}
        {items.length > 0 && (
          <div className="w-full space-y-2">
            {discount ? (
              <div className="flex items-center justify-between h-8 px-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs w-full">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium min-w-0">
                  <Tag className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate font-semibold max-w-[180px]">
                    {discount.name || 'Diskon'} (
                    {discount.type === 'PERCENTAGE'
                      ? `${discount.value}%`
                      : formatCurrency(discount.value, settings?.currency)}
                    )
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDiscount}
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer shrink-0"
                  title="Hapus diskon"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : showDiscountInput ? (
              <div className="space-y-2 p-2.5 rounded-xl border bg-card text-xs">
                {/* Active Master Discounts Presets */}
                {activeMasterDiscounts.length > 0 && (
                  <div className="space-y-1.5 pb-2 border-b">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Pilih Promo Master:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {activeMasterDiscounts.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelectMasterDiscount(d)}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-colors cursor-pointer text-left"
                        >
                          <span>{d.name}</span>
                          <span className="ml-1 opacity-80">
                            (
                            {d.type === 'PERCENTAGE'
                              ? `${d.value}%`
                              : formatCurrency(d.value, settings?.currency)}
                            )
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Custom Discount Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Atau Masukkan Manual:
                    </span>
                    {discountType === 'FIXED' && (
                      <span className="text-[10px] text-muted-foreground">
                        Maks: {formatCurrency(subtotal, settings?.currency)}
                      </span>
                    )}
                  </div>

                  {discountError && (
                    <div className="p-1.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-[11px] flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{discountError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* Unit Selector */}
                    <div className="flex h-8 rounded-md border overflow-hidden shrink-0 bg-muted/40">
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('PERCENTAGE');
                          setDiscountValue('');
                          setDiscountError(null);
                        }}
                        className={`px-2.5 h-full text-xs font-bold transition-colors cursor-pointer ${
                          discountType === 'PERCENTAGE'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Percent className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('FIXED');
                          setDiscountValue('');
                          setDiscountError(null);
                        }}
                        className={`px-2.5 h-full text-xs font-bold transition-colors cursor-pointer ${
                          discountType === 'FIXED'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {currencyConfig.symbol}
                      </button>
                    </div>

                    {/* Value Input */}
                    {discountType === 'FIXED' ? (
                      <CurrencyInput
                        value={Number(discountValue) || 0}
                        currencyCode={settings?.currency}
                        onValueChange={(val) => {
                          setDiscountValue(String(val));
                          setDiscountError(null);
                        }}
                        placeholder="0"
                        className="h-8 text-xs font-mono flex-1"
                      />
                    ) : (
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="10"
                          value={discountValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiscountValue(val);
                            setDiscountError(null);
                          }}
                          className="h-8 text-xs font-mono pr-7"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                          %
                        </span>
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={handleApplyDiscount}
                      className="h-8 px-2.5 text-xs font-bold cursor-pointer shrink-0"
                    >
                      {t('common.actions.apply', 'Pasang')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDiscountInput(false);
                        setDiscountError(null);
                      }}
                      className="h-8 px-2 text-xs cursor-pointer shrink-0"
                    >
                      {t('common.actions.cancel', 'Batal')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiscountInput(true)}
                className="w-full h-8 px-2.5 text-xs border-dashed justify-between font-normal text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{t('cashier.cart.addDiscount', 'Tambah Diskon / Promo')}</span>
                </div>
                <span className="text-[10px] text-muted-foreground/70 shrink-0">+ Diskon</span>
              </Button>
            )}
          </div>
        )}

        {/* Calculation Lines */}
        <div className="w-full space-y-1.5 text-xs pt-1 border-t">
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <span className="shrink-0">{t('cashier.cart.subtotal', 'Subtotal')}</span>
            <span className="font-mono truncate text-right max-w-[170px]">{formatCurrency(subtotal, settings?.currency)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="shrink-0">{t('cashier.cart.discount', 'Potongan Diskon')}</span>
              <span className="font-mono truncate text-right max-w-[170px]">
                -{formatCurrency(discountAmount, settings?.currency)}
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2 pt-1.5 border-t text-foreground">
            <span className="text-sm font-bold shrink-0">{t('cashier.cart.total', 'Total Bayar')}</span>
            <span className="text-primary font-mono text-base sm:text-lg font-black truncate text-right max-w-[180px]">
              {formatCurrency(total, settings?.currency)}
            </span>
          </div>
        </div>

        {/* Action Buttons: Hold Order & Pay Now */}
        <div className="w-full flex items-center gap-2 pt-1">
          {isAdvanced && (
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
          )}

          <Button
            className="flex-1 h-11 text-sm font-bold gap-2 cursor-pointer shadow-sm"
            disabled={items.length === 0}
            onClick={onProceedToPayment}
          >
            <span>{t('cashier.cart.pay', 'Bayar Sekarang')}</span>
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
