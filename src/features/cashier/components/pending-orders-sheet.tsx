import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  UtensilsCrossed,
  CreditCard,
  Edit,
  Trash2,
  BookmarkCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useOrders, useUpsertOrder } from '@/features/orders/hooks/use-orders';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

interface PendingOrdersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

export const PendingOrdersSheet: React.FC<PendingOrdersSheetProps> = ({
  open,
  onOpenChange,
  onPayOrder,
  onEditOrder,
}) => {
  const { t } = useTranslation();
  const { data: orders = [] } = useOrders();
  const upsertMutation = useUpsertOrder();

  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Filter only pending (unpaid / hold) orders
  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING' && o.deletedAt === null
  );

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    try {
      await upsertMutation.mutateAsync({
        ...orderToCancel,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
      setOrderToCancel(null);
    } catch (err) {
      console.error('Failed to cancel pending order:', err);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
          <SheetHeader className="p-5 pb-3 border-b bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BookmarkCheck className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold">
                    {t('cashier.pendingOrders.title', 'Pesanan Tertunda (Open Bills)')}
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    {t(
                      'cashier.pendingOrders.desc',
                      'Daftar pesanan meja / dine-in yang belum dilunasi.'
                    )}
                  </SheetDescription>
                </div>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-bold px-2 py-0.5">
                {pendingOrders.length} Pesanan
              </Badge>
            </div>
          </SheetHeader>

          {/* List of Pending Orders */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2 py-16">
                <div className="p-4 bg-muted rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-foreground">Tidak Ada Pesanan Tertunda</p>
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  Semua transaksi meja dan tagihan kasir telah lunas terselesaikan.
                </p>
              </div>
            ) : (
              pendingOrders.map((order) => {
                const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-card rounded-xl border border-border/80 space-y-3 shadow-xs hover:border-foreground/30 transition-colors"
                  >
                    {/* Header: Table Name & Time */}
                    <div className="flex items-start justify-between gap-2 border-b pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">
                            {order.customerName || order.tableNumber || 'Pesanan Tertunda'}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {order.orderNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    {/* Items List Summary */}
                    <div className="space-y-1 bg-muted/30 p-2.5 rounded-lg text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-muted-foreground">
                          <span className="truncate flex-1 pr-2">
                            {item.qty}x {item.name}
                            {item.variantName && ` (${item.variantName})`}
                          </span>
                          <span className="font-mono text-foreground shrink-0">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                      {order.notes && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 italic pt-1 border-t border-border/40">
                          Catatan: &ldquo;{order.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Total & Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Total Tagihan</p>
                        <p className="text-base font-extrabold text-primary tracking-tight font-mono">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onEditOrder(order);
                          }}
                          className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                          title="Buka kembali untuk menambah pesanan"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Buka / Edit</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onPayOrder(order);
                          }}
                          className="h-8 px-3 text-xs gap-1.5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Bayar</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setOrderToCancel(order)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Batalkan pesanan ini"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for cancelling a pending order */}
      <AlertDialog
        open={Boolean(orderToCancel)}
        onOpenChange={(open) => {
          if (!open) setOrderToCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Pesanan Tertunda?</AlertDialogTitle>
            <AlertDialogDescription>
              Pesanan untuk <strong>{orderToCancel?.customerName || orderToCancel?.orderNumber}</strong> sebesar{' '}
              <strong>{formatCurrency(orderToCancel?.totalAmount || 0)}</strong> akan dibatalkan dan dihapus dari daftar meja aktif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToCancel(null)}>
              Tutup
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Ya, Batalkan Pesanan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PendingOrdersSheet;
