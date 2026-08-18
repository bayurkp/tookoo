import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Printer,
  Receipt,
  Calendar,
  CreditCard,
  User,
  UtensilsCrossed,
  Clock,
  QrCode,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { formatCurrency } from '@/utils/format-currency';
import { DEFAULT_RECEIPT_SETTINGS } from '@/types/store.types';
import type { Order } from '@/types/order.types';

interface OrderReceiptDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderReceiptDialog: React.FC<OrderReceiptDialogProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const { settings } = useP2pSync();
  const receiptConfig = settings?.receiptSettings || DEFAULT_RECEIPT_SETTINGS;

  if (!order) return null;

  const isPending = order.status === 'PENDING';

  const handlePrint = () => {
    window.print();
  };

  const getFontFamilyClass = () => {
    if (receiptConfig.fontFamily === 'monospace') return 'font-mono';
    if (receiptConfig.fontFamily === 'serif') return 'font-serif';
    return 'font-sans';
  };

  const getFontSizeClass = () => {
    if (receiptConfig.fontSize === 'small') return 'text-[11px]';
    if (receiptConfig.fontSize === 'large') return 'text-[13px]';
    return 'text-xs';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] h-[85vh] max-h-[640px] min-h-[500px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card flex flex-row items-center gap-2 space-y-0">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              isPending
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-primary/10 text-primary'
            }`}
          >
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">
              {isPending
                ? t('orders.receipt.billTitle', 'Tagihan Sementara (Open Bill)')
                : t('orders.receipt.title', 'Rincian Struk Transaksi')}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-foreground font-semibold">
              {order.orderNumber}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Receipt Body */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 p-5 space-y-3.5 bg-card ${getFontFamilyClass()} ${getFontSizeClass()}`}
        >
          {/* Header Store Branding */}
          <div className="text-center pb-2 border-b border-dashed border-border/80">
            {receiptConfig.showLogo && receiptConfig.logoUrl && (
              <div className="flex justify-center mb-1.5">
                <img src={receiptConfig.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
              </div>
            )}
            <h3 className="font-extrabold text-sm tracking-tight uppercase">
              {receiptConfig.headerTitle || settings?.storeName || 'Tookoo Store'}
            </h3>
            {receiptConfig.headerSubtitle && (
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {receiptConfig.headerSubtitle}
              </p>
            )}
            {(receiptConfig.storeAddress || settings?.storeAddress) && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {receiptConfig.storeAddress || settings?.storeAddress}
              </p>
            )}
            {receiptConfig.storePhone && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Telp: {receiptConfig.storePhone}
              </p>
            )}
          </div>

          {/* Customer / Table Banner if present */}
          {order.customerName && receiptConfig.showCustomerName !== false && (
            <div className="p-2 rounded-lg bg-muted/60 border flex items-center justify-between text-xs font-bold text-foreground">
              <div className="flex items-center gap-1.5 truncate">
                <UtensilsCrossed className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{order.customerName}</span>
              </div>
              <Badge variant="outline" className="text-[10px] py-0 shrink-0">
                Meja / Pelanggan
              </Badge>
            </div>
          )}

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/70">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              <Badge variant="outline" className="text-[10px] py-0">
                {isPending ? 'BELUM BAYAR' : order.paymentMethod}
              </Badge>
            </div>
            {receiptConfig.showCashierName !== false && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3 w-3" />
                <span>
                  {t('orders.receipt.cashier', 'Kasir')}: {order.cashierName}
                </span>
              </div>
            )}
            <div className="flex items-center justify-end">
              {isPending ? (
                <Badge
                  variant="outline"
                  className="text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 text-[10px] py-0 font-bold"
                >
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  TUNDA BAYAR
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] py-0 font-semibold"
                >
                  {t('orders.receipt.completed', 'LUNAS')}
                </Badge>
              )}
            </div>
          </div>

          {/* Itemized List */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('orders.receipt.items', 'Daftar Menu')} ({order.items.length})
            </p>
            <div className="divide-y divide-border/60 border rounded-lg overflow-hidden bg-card">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2 flex justify-between items-start">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    {item.variantName && (
                      <p className="text-[10px] text-primary font-medium">
                        Varian: {item.variantName}
                      </p>
                    )}
                    {receiptConfig.showModifiers !== false && item.modifiersDescription && (
                      <p className="text-[10px] text-muted-foreground">
                        + {item.modifiersDescription}
                      </p>
                    )}
                    <p className="text-muted-foreground text-[10px]">
                      {item.qty} {item.unit || 'pcs'} @ {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-foreground shrink-0">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-2.5 bg-muted/30 rounded-lg border space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>{t('cashier.cart.subtotal', 'Subtotal')}</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>{t('cashier.cart.discount', 'Diskon')}</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
              <span>{t('orders.receipt.total', 'Total Tagihan')}</span>
              <span className="text-primary font-black">{formatCurrency(order.totalAmount)}</span>
            </div>
            {!isPending &&
              order.paymentMethod === 'CASH' &&
              receiptConfig.showPaymentDetails !== false && (
                <>
                  <div className="flex justify-between text-muted-foreground pt-1 text-[11px]">
                    <span>{t('cashier.payment.amountReceived', 'Uang Diterima')}</span>
                    <span className="font-mono">{formatCurrency(order.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    <span>{t('cashier.payment.changeDue', 'Kembalian')}</span>
                    <span className="font-mono">{formatCurrency(order.changeDue)}</span>
                  </div>
                </>
              )}
          </div>

          {/* Footer & QR Code Section */}
          <div className="text-center pt-2 space-y-1 border-t border-dashed border-border/80">
            {receiptConfig.showBarcodeQr !== false && (
              <div className="flex flex-col items-center justify-center pb-1">
                <div className="p-1 bg-white border rounded">
                  <QrCode className="h-10 w-10 text-black" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                  {order.orderNumber}
                </span>
              </div>
            )}

            <p className="font-bold text-[11px] text-foreground">
              {receiptConfig.footerMessage || 'Terima kasih atas kunjungan Anda!'}
            </p>
            {receiptConfig.footerSocialMedia && (
              <p className="text-[10px] text-muted-foreground">{receiptConfig.footerSocialMedia}</p>
            )}
            {receiptConfig.footerPolicy && (
              <p className="text-[9px] text-muted-foreground italic">
                {receiptConfig.footerPolicy}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            {t('common.actions.close', 'Tutup')}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="gap-1.5 font-bold cursor-pointer text-xs"
          >
            <Printer className="h-4 w-4" />
            <span>
              {isPending
                ? t('orders.receipt.printBill', 'Cetak Tagihan Sementara')
                : t('orders.receipt.reprint', 'Cetak Ulang Struk')}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceiptDialog;
