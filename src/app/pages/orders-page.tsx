import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Receipt, ArrowUpDown, Eye } from 'lucide-react';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { DailySummaryCard } from '@/features/orders/components/daily-summary-card';
import { OrderReceiptDialog } from '@/features/orders/components/order-receipt-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.cashierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPayment = paymentFilter === 'ALL' || order.paymentMethod === paymentFilter;
      return matchesSearch && matchesPayment;
    });
  }, [orders, searchQuery, paymentFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('orders.title', 'Riwayat Transaksi')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'orders.subtitle',
            'Laporan penjualan harian, riwayat pembayaran, dan cetak ulang struk.'
          )}
        </p>
      </div>

      {/* Daily Summary Cards (dashboard-01 style) */}
      <DailySummaryCard orders={orders} />

      {/* Recent Transactions Table Card */}
      <Card className="border-border/80 shadow-none">
        <CardHeader className="p-4 pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span>Daftar Transaksi Kasir</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Semua transaksi belanja yang telah selesai diproses di toko.
            </CardDescription>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <div className="relative min-w-[200px] sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t('orders.searchPlaceholder', 'Cari nomor struk atau kasir...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>

            {/* Payment Method Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['ALL', 'CASH', 'QRIS', 'TRANSFER'].map((method) => (
                <Badge
                  key={method}
                  variant={paymentFilter === method ? 'default' : 'outline'}
                  className="cursor-pointer px-2.5 py-1 text-[11px] font-semibold"
                  onClick={() => setPaymentFilter(method)}
                >
                  {method === 'ALL'
                    ? `${t('products.allCategories', 'Semua')} (${orders.length})`
                    : method === 'CASH'
                      ? t('cashier.payment.cash', 'Tunai')
                      : method}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-semibold text-sm text-foreground">
                {searchQuery || paymentFilter !== 'ALL'
                  ? t('orders.emptyFilter', 'Tidak ada transaksi yang cocok dengan filter.')
                  : t('orders.empty', 'Belum ada transaksi hari ini.')}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t(
                  'orders.emptyHint',
                  'Transaksi yang selesai di kasir akan otomatis muncul di sini.'
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/30">
                    <TableHead className="w-[180px] text-xs font-semibold">No. Struk</TableHead>
                    <TableHead className="text-xs font-semibold">Waktu & Kasir</TableHead>
                    <TableHead className="text-xs font-semibold">Item Belanja</TableHead>
                    <TableHead className="text-xs font-semibold">Metode</TableHead>
                    <TableHead className="text-right text-xs font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        <span>Total Tagihan</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[80px] text-center text-xs font-semibold">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-mono font-bold text-xs">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground">
                            {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-[11px]">{order.cashierName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium text-foreground">
                          {order.items.reduce((s, it) => s + it.qty, 0)} item
                        </span>
                        <span className="text-muted-foreground text-[11px] ml-1.5 block sm:inline">
                          (
                          {order.items
                            .map((it) => it.name)
                            .slice(0, 2)
                            .join(', ')}
                          {order.items.length > 2 ? '...' : ''})
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.paymentMethod === 'CASH'
                              ? 'secondary'
                              : order.paymentMethod === 'QRIS'
                                ? 'default'
                                : 'outline'
                          }
                          className="text-[11px] font-semibold py-0 px-2"
                        >
                          {order.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-primary tabular-nums">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="h-7 w-7 p-0 rounded-md hover:bg-primary/10 hover:text-primary cursor-pointer"
                          title="Lihat Struk"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Details Modal */}
      <OrderReceiptDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrdersPage;
