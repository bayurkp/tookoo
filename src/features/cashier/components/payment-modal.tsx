import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '../stores/cart-store';
import { useCashierCheckout } from '../hooks/use-cashier-checkout';
import { formatCurrency } from '@/utils/format-currency';
import { sounds } from '@/utils/audio';
import type { PaymentMethod } from '../types/cart.types';
import type { Order } from '@/types/order.types';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  onPaymentSuccess,
}) => {
  const { t } = useTranslation();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const getTotal = useCartStore((state) => state.getTotal);

  const checkoutMutation = useCashierCheckout();

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCashTendered(String(total));
      setPaymentMethod('CASH');
      setErrorMessage(null);
    }
  }, [open, total]);

  const numericCashTendered = Number(cashTendered) || 0;
  const changeDue = Math.max(0, numericCashTendered - total);
  const isCashInsufficient = paymentMethod === 'CASH' && numericCashTendered < total;

  const quickCashOptions = [
    { label: 'Uang Pas', value: total },
    { label: '10.000', value: 10000 },
    { label: '20.000', value: 20000 },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 10000 },
    { label: '200.000', value: 200000 },
  ].filter((opt) => opt.value >= total || opt.label === 'Uang Pas');

  const handleProcessPayment = async () => {
    if (items.length === 0) return;

    if (paymentMethod === 'CASH' && numericCashTendered < total) {
      setErrorMessage('Nominal uang diterima kurang dari total tagihan.');
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const finalAmountPaid = paymentMethod === 'CASH' ? numericCashTendered : total;
      const finalChangeDue = paymentMethod === 'CASH' ? changeDue : 0;

      const order = await checkoutMutation.mutateAsync({
        items: orderItems,
        subtotal,
        discount: discountAmount,
        totalAmount: total,
        paymentMethod,
        amountPaid: finalAmountPaid,
        changeDue: finalChangeDue,
        cashierName: 'Kasir',
      });

      sounds.playSuccess();
      onOpenChange(false);
      onPaymentSuccess(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses pembayaran.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('cashier.payment.title', 'Pembayaran')}</DialogTitle>
          <DialogDescription>
            {t(
              'cashier.payment.description',
              'Pilih metode pembayaran dan konfirmasi nominal transaksi.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Total Highlight */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {t('cashier.payment.totalBill', 'Total Tagihan')}
            </p>
            <p className="text-2xl font-black text-primary tracking-tight">
              {formatCurrency(total)}
            </p>
          </div>
          <Badge variant="outline" className="bg-background text-xs">
            {t('cashier.payment.itemTypes', { count: items.length })}
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
            <div className="space-y-1">
              <label htmlFor="cashTendered" className="text-xs font-semibold text-foreground">
                {t('cashier.payment.amountReceivedLabel', 'Uang Diterima (Rp) *')}
              </label>
              <Input
                id="cashTendered"
                type="number"
                value={cashTendered}
                onChange={(e) => {
                  setCashTendered(e.target.value);
                  setErrorMessage(null);
                }}
                className="text-lg font-bold"
                placeholder="0"
              />
            </div>

            {/* Quick Cash Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {quickCashOptions.map((opt) => (
                <Button
                  key={opt.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCashTendered(String(opt.value))}
                  className="text-xs h-7 px-2"
                >
                  {opt.label === 'Uang Pas'
                    ? t('cashier.payment.exactAmount', 'Uang Pas')
                    : formatCurrency(opt.value)}
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
                  isCashInsufficient ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isCashInsufficient
                  ? t('cashier.payment.insufficientCash', 'Uang Kurang')
                  : formatCurrency(changeDue)}
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
                  amount: formatCurrency(total),
                  defaultValue: `Pastikan pelanggan telah memindai QRIS dan saldo terpotong sebesar ${formatCurrency(total)}.`,
                })}
              </p>
              <Badge variant="success" className="gap-1 mt-2">
                <CheckCircle2 className="h-3 w-3" />
                {t('cashier.payment.readyToProcess', 'Siap Diproses')}
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
                  amount: formatCurrency(total),
                  defaultValue: `Verifikasi mutasi rekening masuk sebesar ${formatCurrency(total)} sebelum menyelesaikan transaksi.`,
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

        <DialogFooter>
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
