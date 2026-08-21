import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, QrCode, Building, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '../stores/cart-store';
import { useCashierCheckout } from '../hooks/use-cashier-checkout';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { getCurrencyConfig } from '@/utils/currency-config';
import { formatCurrency } from '@/utils/format-currency';
import { sounds } from '@/utils/audio';
import type { PaymentMethod } from '../types/cart.types';
import type { Order } from '@/types/order.types';

import { useUpsertOrder } from '@/features/orders/hooks/use-orders';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: (order: Order) => void;
  pendingOrder?: Order | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  onPaymentSuccess,
  pendingOrder,
}) => {
  const { t } = useTranslation();
  const { settings } = useP2pSync();
  const items = useCartStore((state) => state.items);
  const customer = useCartStore((state) => state.customer);
  const customerName = useCartStore((state) => state.customerName);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const getTotal = useCartStore((state) => state.getTotal);

  const checkoutMutation = useCashierCheckout();
  const upsertOrderMutation = useUpsertOrder();

  const subtotal = pendingOrder ? pendingOrder.subtotal : getSubtotal();
  const discountAmount = pendingOrder ? pendingOrder.discount : getDiscountAmount();
  const total = pendingOrder ? pendingOrder.totalAmount : getTotal();
  const itemCount = pendingOrder ? pendingOrder.items.length : items.length;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currencyConfig = getCurrencyConfig(settings?.currency);

  useEffect(() => {
    if (open) {
      setCashTendered(total);
      setPaymentMethod('CASH');
      setErrorMessage(null);
    }
  }, [open, total]);

  const changeDue = Math.max(0, cashTendered - total);
  const isCashInsufficient = paymentMethod === 'CASH' && cashTendered < total;

  // Dynamic quick nominal cash suggestions
  const quickCashOptions = useMemo(() => {
    const list: { label: string; value: number }[] = [{ label: 'Uang Pas', value: total }];

    currencyConfig.quickNominals.forEach((nom) => {
      if (nom >= total && !list.some((item) => item.value === nom)) {
        list.push({ label: formatCurrency(nom, settings?.currency), value: nom });
      }
    });

    // If total exceeds max quick nominal, suggest rounded nearest step
    if (list.length === 1 && total > 0) {
      const step = currencyConfig.decimalDigits === 0 ? 50000 : 50;
      const nextRound = Math.ceil(total / step) * step;
      if (nextRound > total) {
        list.push({ label: formatCurrency(nextRound, settings?.currency), value: nextRound });
      }
    }

    return list;
  }, [total, currencyConfig, settings?.currency]);

  const handleProcessPayment = async () => {
    if (!pendingOrder && items.length === 0) return;

    if (paymentMethod === 'CASH' && cashTendered < total) {
      setErrorMessage('Nominal uang diterima kurang dari total tagihan.');
      return;
    }

    try {
      const finalAmountPaid = paymentMethod === 'CASH' ? cashTendered : total;
      const finalChangeDue = paymentMethod === 'CASH' ? changeDue : 0;

      let order: Order;

      if (pendingOrder) {
        order = {
          ...pendingOrder,
          status: 'PAID',
          paymentMethod,
          amountPaid: finalAmountPaid,
          changeDue: finalChangeDue,
          updatedAt: Date.now(),
        };
        await upsertOrderMutation.mutateAsync(order);
      } else {
        const orderItems = items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          unit: item.product.unit || 'pcs',
          variantName: item.selectedVariant ? item.selectedVariant.name : undefined,
          modifiersDescription:
            item.selectedModifiers && item.selectedModifiers.length > 0
              ? item.selectedModifiers.map((m) => m.name).join(', ')
              : undefined,
          price: item.unitPrice,
          qty: item.quantity,
          subtotal: item.unitPrice * item.quantity,
        }));

        order = await checkoutMutation.mutateAsync({
          items: orderItems,
          subtotal,
          discount: discountAmount,
          totalAmount: total,
          paymentMethod,
          amountPaid: finalAmountPaid,
          changeDue: finalChangeDue,
          cashierName: 'Kasir',
          customerName: customer?.name || customerName || undefined,
          status: 'PAID',
        });
      }

      sounds.playSuccess();
      onOpenChange(false);
      onPaymentSuccess(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses pembayaran.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] sm:max-w-[440px] p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 pb-3 pr-10 border-b bg-card shrink-0 text-left">
          <DialogTitle className="text-base font-bold text-foreground">
            {t('cashier.payment.title', 'Pembayaran')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {t(
              'cashier.payment.description',
              'Pilih metode pembayaran dan masukkan nominal uang pelanggan.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Total Tagihan Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">
                {t('cashier.payment.totalBill', 'Total Tagihan')}
              </span>
              <span
                className="text-xl sm:text-2xl font-black text-primary font-mono tracking-tight block mt-0.5"
                title={formatCurrency(total, settings?.currency)}
              >
                {formatCurrency(total, settings?.currency)}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 shrink-0">
              {t('cashier.payment.itemTypes', { count: itemCount })}
            </Badge>
          </div>

          {/* Payment Methods Tabs */}
          <Tabs
            value={paymentMethod}
            onValueChange={(val) => {
              setPaymentMethod(val as PaymentMethod);
              setErrorMessage(null);
            }}
          >
            <TabsList className="grid grid-cols-3 w-full h-10 p-1 bg-muted rounded-lg">
              <TabsTrigger value="CASH" className="gap-1.5 text-xs font-semibold h-8">
                <Banknote className="h-4 w-4" />
                <span>{t('cashier.payment.cash', 'Tunai')}</span>
              </TabsTrigger>
              <TabsTrigger value="QRIS" className="gap-1.5 text-xs font-semibold h-8">
                <QrCode className="h-4 w-4" />
                <span>{t('cashier.payment.qris', 'QRIS')}</span>
              </TabsTrigger>
              <TabsTrigger value="TRANSFER" className="gap-1.5 text-xs font-semibold h-8">
                <Building className="h-4 w-4" />
                <span>{t('cashier.payment.transfer', 'Transfer')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Cash Tab Content */}
            <TabsContent value="CASH" className="space-y-3 pt-2">
              <Field
                data-invalid={Boolean(errorMessage || (cashTendered > 0 && cashTendered < total))}
              >
                <FieldLabel htmlFor="cashTendered">
                  {t('cashier.payment.amountReceivedLabel', 'Uang Diterima (Rp) *')}
                </FieldLabel>
                <CurrencyInput
                  id="cashTendered"
                  value={cashTendered}
                  currencyCode={settings?.currency}
                  onValueChange={(val) => {
                    setCashTendered(val);
                    setErrorMessage(null);
                  }}
                  className="text-base font-bold h-10"
                  placeholder="0"
                />
              </Field>

              {/* Quick Cash Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {quickCashOptions.map((opt) => (
                  <Button
                    key={opt.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCashTendered(opt.value)}
                    className="text-xs h-8 px-2 font-mono font-medium truncate cursor-pointer rounded-lg hover:bg-muted"
                  >
                    {opt.label === 'Uang Pas'
                      ? t('cashier.payment.exactAmount', 'Uang Pas')
                      : opt.label}
                  </Button>
                ))}
              </div>

              {/* Change Due Box */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {t('cashier.payment.changeDueLabel', 'Uang Kembalian:')}
                </span>
                <span
                  className={`text-base font-bold font-mono truncate text-right ${
                    isCashInsufficient
                      ? 'text-destructive'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isCashInsufficient
                    ? t('cashier.payment.insufficientCash', 'Uang Kurang')
                    : formatCurrency(changeDue, settings?.currency)}
                </span>
              </div>
            </TabsContent>

            {/* QRIS Tab Content */}
            <TabsContent value="QRIS" className="pt-2">
              <div className="p-6 rounded-xl border border-dashed border-primary/40 bg-card flex flex-col items-center justify-center text-center space-y-2">
                <QrCode className="h-10 w-10 text-primary" />
                <p className="font-semibold text-sm">
                  {t('cashier.payment.qrisTitle', 'Scan QRIS Dinamis Toko')}
                </p>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  {t('cashier.payment.qrisDesc', {
                    amount: formatCurrency(total, settings?.currency),
                    defaultValue: `Pastikan pelanggan telah memindai QRIS dan saldo terpotong sebesar ${formatCurrency(total, settings?.currency)}.`,
                  })}
                </p>
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 gap-1 mt-2 font-medium"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t('cashier.payment.ready', 'Siap Transaksi')}</span>
                </Badge>
              </div>
            </TabsContent>

            {/* Transfer Tab Content */}
            <TabsContent value="TRANSFER" className="pt-2">
              <div className="p-6 rounded-xl border border-dashed border-primary/40 bg-card flex flex-col items-center justify-center text-center space-y-2">
                <Building className="h-10 w-10 text-primary" />
                <p className="font-semibold text-sm">
                  {t('cashier.payment.transferTitle', 'Transfer Bank Manual')}
                </p>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  {t('cashier.payment.transferDesc', {
                    amount: formatCurrency(total, settings?.currency),
                    defaultValue: `Verifikasi mutasi rekening masuk sebesar ${formatCurrency(total, settings?.currency)} sebelum menyelesaikan transaksi.`,
                  })}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {errorMessage && (
            <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg font-medium">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Standard shadcn DialogFooter */}
        <DialogFooter className="p-3.5 sm:p-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2 shrink-0 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => onOpenChange(false)}
            disabled={checkoutMutation.isPending}
            className="w-1/3 h-10 text-xs font-semibold cursor-pointer rounded-lg"
          >
            {t('common.actions.cancel', 'Batal')}
          </Button>
          <Button
            type="button"
            size="default"
            onClick={handleProcessPayment}
            disabled={checkoutMutation.isPending || isCashInsufficient}
            className="flex-1 h-10 text-xs font-bold gap-1.5 shadow-sm cursor-pointer rounded-lg"
          >
            {checkoutMutation.isPending ? (
              t('cashier.payment.processing', 'Memproses Transaksi...')
            ) : (
              <span>{t('cashier.payment.confirm', 'Konfirmasi Pembayaran')}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
