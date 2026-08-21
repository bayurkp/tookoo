import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, QrCode, Building, CheckCircle2, ArrowRight } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[425px] h-[85vh] max-h-[600px] min-h-[480px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
          <DialogTitle>{t('cashier.payment.title', 'Pembayaran')}</DialogTitle>
          <DialogDescription>
            {t(
              'cashier.payment.description',
              'Pilih metode pembayaran dan konfirmasi nominal transaksi.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
          {/* Total Highlight */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {t('cashier.payment.totalBill', 'Total Tagihan')}
              </p>
              <p className="text-2xl font-black text-primary tracking-tight">
                {formatCurrency(total, settings?.currency)}
              </p>
            </div>
            <Badge variant="outline" className="bg-background text-xs">
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
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="CASH" className="gap-1.5">
                <Banknote className="h-4 w-4" />
                <span>{t('cashier.payment.cash', 'Tunai')}</span>
              </TabsTrigger>
              <TabsTrigger value="QRIS" className="gap-1.5">
                <QrCode className="h-4 w-4" />
                <span>{t('cashier.payment.qris', 'QRIS')}</span>
              </TabsTrigger>
              <TabsTrigger value="TRANSFER" className="gap-1.5">
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
                  {t('cashier.payment.amountReceivedLabel', 'Uang Diterima *')}
                </FieldLabel>
                <CurrencyInput
                  id="cashTendered"
                  value={cashTendered}
                  currencyCode={settings?.currency}
                  onValueChange={(val) => {
                    setCashTendered(val);
                    setErrorMessage(null);
                  }}
                  className="text-lg font-bold"
                  placeholder="0"
                />
              </Field>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt) => (
                  <Button
                    key={opt.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCashTendered(opt.value)}
                    className="text-xs h-7 px-2"
                  >
                    {opt.label === 'Uang Pas'
                      ? t('cashier.payment.exactAmount', 'Uang Pas')
                      : opt.label}
                  </Button>
                ))}
              </div>

              {/* Change Due Box */}
              <div className="p-3 rounded-lg bg-muted/50 border flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('cashier.payment.changeDueLabel', 'Uang Kembalian:')}
                </span>
                <span
                  className={`text-lg font-bold ${
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
              <div className="p-6 rounded-xl border-2 border-dashed border-primary/40 bg-card flex flex-col items-center justify-center text-center space-y-2">
                <QrCode className="h-12 w-12 text-primary" />
                <p className="font-semibold text-sm">
                  {t('cashier.payment.qrisTitle', 'Scan QRIS Dinamis Toko')}
                </p>
                <p className="text-xs text-muted-foreground">
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
              <div className="p-6 rounded-xl border-2 border-dashed border-primary/40 bg-card flex flex-col items-center justify-center text-center space-y-2">
                <Building className="h-12 w-12 text-primary" />
                <p className="font-semibold text-sm">
                  {t('cashier.payment.transferTitle', 'Transfer Bank Manual')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('cashier.payment.transferDesc', {
                    amount: formatCurrency(total, settings?.currency),
                    defaultValue: `Verifikasi mutasi rekening masuk sebesar ${formatCurrency(total, settings?.currency)} sebelum menyelesaikan transaksi.`,
                  })}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {errorMessage && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md font-medium">
              {errorMessage}
            </p>
          )}
        </div>

        <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={checkoutMutation.isPending}
          >
            {t('common.actions.cancel', 'Batal')}
          </Button>
          <Button
            type="button"
            onClick={handleProcessPayment}
            disabled={checkoutMutation.isPending || isCashInsufficient}
            className="gap-2 font-bold"
          >
            {checkoutMutation.isPending ? (
              t('cashier.payment.processing', 'Memproses Transaksi...')
            ) : (
              <>
                <span>{t('cashier.payment.confirm', 'Konfirmasi Pembayaran')}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
