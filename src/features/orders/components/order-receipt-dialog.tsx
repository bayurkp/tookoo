import React from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Receipt, Calendar, CreditCard, User, UtensilsCrossed, Clock } from 'lucide-react';
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
import { formatCurrency } from '@/utils/format-currency';
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

  if (!order) return null;

  const isPending = order.status === 'PENDING';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-[85vh] max-h-[620px] min-h-[480px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card flex flex-row items-center gap-2 space-y-0">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              isPending ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'
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

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
          {/* Customer / Table Banner if present */}
          {order.customerName && (
            <div className="p-2.5 rounded-lg bg-muted/60 border flex items-center gap-2 text-xs font-bold text-foreground">
              <UtensilsCrossed className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{order.customerName}</span>
            </div>
          )}

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-lg border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <Badge variant="outline" className="text-xs py-0">
                {isPending ? 'BELUM BAYAR' : order.paymentMethod}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>
                {t('orders.receipt.cashier', 'Kasir')}: {order.cashierName}
              </span>
            </div>
            <div className="flex items-center justify-end">
              {isPending ? (
                <Badge
                  variant="outline"
                  className="text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 text-xs py-0 font-bold"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  TUNDA BAYAR
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs py-0 font-semibold"
                >
                  {t('orders.receipt.completed', 'LUNAS / SELESAI')}
                </Badge>
              )}
            </div>
          </div>

          {/* Itemized List */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground">
              {t('orders.receipt.items', 'Menu Terjual')} ({order.items.length})
            </p>
            <div className="divide-y divide-border/60 border rounded-lg overflow-hidden bg-card text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex justify-between items-start">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    {item.variantName && (
                      <p className="text-[10px] text-primary font-medium">
                        Varian: {item.variantName}
                      </p>
                    )}
                    {item.modifiersDescription && (
                      <p className="text-[10px] text-muted-foreground">
                        + {item.modifiersDescription}
                      </p>
                    )}
                    <p className="text-muted-foreground text-[11px]">
                      {item.qty} {item.unit || 'pcs'} @ {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-foreground shrink-0">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-3 bg-muted/30 rounded-lg border space-y-1.5 text-xs">
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
            {!isPending && order.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between text-muted-foreground pt-1">
                  <span>{t('cashier.payment.amountReceived', 'Uang Diterima')}</span>
                  <span>{formatCurrency(order.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{t('cashier.payment.changeDue', 'Kembalian')}</span>
                  <span>{formatCurrency(order.changeDue)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            {t('common.actions.close', 'Tutup')}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="gap-1.5 font-bold cursor-pointer"
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
