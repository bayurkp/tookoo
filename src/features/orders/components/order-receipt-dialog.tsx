import React from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Receipt, Calendar, CreditCard, User } from 'lucide-react';
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">
              {t('orders.receipt.title', 'Rincian Struk Transaksi')}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-foreground font-semibold">
              {order.orderNumber}
            </DialogDescription>
          </div>
        </DialogHeader>

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
              {order.paymentMethod}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>
              {t('orders.receipt.cashier', 'Kasir')}: {order.cashierName}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <Badge variant="success" className="text-xs py-0">
              {t('orders.receipt.completed', 'SELESAI')}
            </Badge>
          </div>
        </div>

        {/* Itemized List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <p className="text-xs font-bold text-foreground">
            {t('orders.receipt.items', 'Menu Terjual')} ({order.items.length})
          </p>
          <div className="divide-y divide-border/60 border rounded-lg overflow-hidden bg-card text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">
                    {item.qty}x @ {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-bold text-foreground">{formatCurrency(item.subtotal)}</p>
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
          {order.paymentMethod === 'CASH' && (
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto cursor-pointer"
          >
            {t('common.actions.close', 'Tutup')}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto gap-1.5 font-bold cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{t('orders.receipt.reprint', 'Cetak Ulang Struk')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
