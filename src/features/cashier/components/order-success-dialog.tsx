import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Printer, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

interface OrderSuccessDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewTransaction: () => void;
}

export const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  order,
  open,
  onOpenChange,
  onNewTransaction,
}) => {
  const { t } = useTranslation();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-xl font-bold">
              {t('cashier.payment.successTitle', 'Pembayaran Berhasil')}
            </DialogTitle>
            <DialogDescription>Transaksi tercatat ke memori lokal kasir.</DialogDescription>
          </DialogHeader>
        </div>

        {/* Change Due Highlight */}
        {order.paymentMethod === 'CASH' && order.changeDue > 0 && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-0.5">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              UANG KEMBALIAN
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(order.changeDue)}
            </p>
          </div>
        )}

        {/* Receipt Details Box */}
        <div className="p-3.5 rounded-xl bg-muted/40 border text-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground pb-1.5 border-b border-border/60">
            <span>No. Struk:</span>
            <span className="font-mono font-bold text-foreground">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span>Metode Bayar:</span>
            <Badge variant="outline" className="text-xs py-0">
              {order.paymentMethod}
            </Badge>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span>Waktu Transaksi:</span>
            <span className="text-foreground">
              {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          {/* Purchased Items List */}
          <div className="pt-2 border-t border-border/60 space-y-1">
            <p className="font-semibold text-foreground">Daftar Menu ({order.items.length}):</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-muted-foreground">
                <span>
                  {item.qty}x {item.name}
                </span>
                <span className="font-medium text-foreground">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1 border-t border-border/40">
              <span>Diskon:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border/80">
            <span>Total Transaksi:</span>
            <span className="text-primary font-black">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="w-full sm:w-auto gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Struk</span>
          </Button>
          <Button
            type="button"
            onClick={onNewTransaction}
            className="w-full sm:w-auto gap-1.5 font-bold"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Transaksi Baru</span>
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
