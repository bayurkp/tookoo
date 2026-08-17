import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Receipt, ChevronRight } from 'lucide-react';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { DailySummaryCard } from '@/features/orders/components/daily-summary-card';
import { OrderReceiptDialog } from '@/features/orders/components/order-receipt-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      const matchesPayment =
        paymentFilter === 'ALL' || order.paymentMethod === paymentFilter;
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
          Laporan omzet penjualan harian, riwayat pembayaran, dan pencetakan ulang
          struk.
        </p>
      </div>

      {/* Daily Summary Cards */}
      <DailySummaryCard orders={orders} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor struk atau kasir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Payment Method Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'CASH', 'QRIS', 'TRANSFER'].map((method) => (
            <Badge
              key={method}
              variant={paymentFilter === method ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 text-xs font-semibold"
              onClick={() => setPaymentFilter(method)}
            >
              {method === 'ALL'
                ? `Semua (${orders.length})`
                : method === 'CASH'
                  ? 'Tunai'
                  : method}
            </Badge>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card">
            <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-semibold text-sm">
              {searchQuery || paymentFilter !== 'ALL'
                ? 'Tidak ada transaksi yang cocok dengan filter.'
                : 'Belum ada riwayat transaksi.'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi yang selesai di kasir akan muncul di sini secara otomatis.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/30 hover:border-primary/40 transition-all cursor-pointer shadow-xs gap-3"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-sm">{order.orderNumber}</p>
                    <Badge variant="outline" className="text-xs py-0">
                      {order.paymentMethod}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • {order.items.reduce((s, it) => s + it.qty, 0)} item (
                    {order.items
                      .map((it) => it.name)
                      .slice(0, 2)
                      .join(', ')}
                    {order.items.length > 2 ? '...' : ''})
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                <div className="text-left sm:text-right">
                  <p className="font-bold text-base text-primary">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                  <span>Lihat</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

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
