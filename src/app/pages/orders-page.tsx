import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Receipt,
  ArrowUpDown,
  Eye,
  Lock,
  ShieldCheck,
  Clock,
  Building2,
} from 'lucide-react';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { useOutlets } from '@/features/outlets/hooks/use-outlets';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { useAuthStore } from '@/stores/auth-store';
import { DailySummaryCard } from '@/features/orders/components/daily-summary-card';
import { OrderReceiptDialog } from '@/features/orders/components/order-receipt-dialog';
import { PinModal } from '@/components/pin-modal';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { DatePickerWithRange, type DateRange } from '@/components/date-n-time';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading } = useOrders();
  const { data: outlets = [] } = useOutlets();
  const { settings } = useP2pSync();
  const { hasPermission } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const canViewRevenue = hasPermission('VIEW_REVENUE_REPORTS', Boolean(settings?.ownerPin));

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.cashierName.toLowerCase().includes(q) ||
        (order.customerName && order.customerName.toLowerCase().includes(q)) ||
        (order.tableNumber && order.tableNumber.toLowerCase().includes(q));

      const isOrderPending = order.status === 'PENDING';
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && isOrderPending) ||
        (statusFilter === 'PAID' && !isOrderPending);

      const matchesOutlet = selectedOutletId === 'ALL' || order.outletId === selectedOutletId;

      let matchesDate = true;
      if (dateRange?.from) {
        const orderTime = new Date(order.createdAt).setHours(0, 0, 0, 0);
        const fromTime = new Date(dateRange.from).setHours(0, 0, 0, 0);
        if (orderTime < fromTime) matchesDate = false;
        if (dateRange.to) {
          const toTime = new Date(dateRange.to).setHours(23, 59, 59, 999);
          if (orderTime > toTime) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesOutlet && matchesDate;
    });
  }, [orders, searchQuery, statusFilter, selectedOutletId, dateRange]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('orders.title', 'Riwayat Transaksi')}
        description={t(
          'orders.subtitle',
          'Laporan penjualan harian, riwayat pembayaran, dan cetak ulang struk.'
        )}
      />

      {/* Daily Summary Cards with RBAC Check */}
      {canViewRevenue ? (
        <DailySummaryCard orders={orders} />
      ) : (
        <Card className="border-border/80 bg-muted/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Ringkasan Omzet Terkunci</p>
              <p className="text-xs text-muted-foreground">
                Terminal sedang dalam Mode Kasir. Masukkan PIN Pemilik untuk melihat nominal omzet.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPinModalOpen(true)}
            className="text-xs gap-1.5 cursor-pointer shrink-0"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Buka Otorisasi PIN</span>
          </Button>
        </Card>
      )}

      {/* Recent Transactions Table Card */}
      <Card className="border-border/80 shadow-none">
        <CardHeader className="p-4 pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span>Daftar Transaksi Kasir</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Semua transaksi belanja yang tercatat di toko.
            </CardDescription>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {outlets.length > 1 && (
              <div className="w-full sm:w-48">
                <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
                  <SelectTrigger className="h-8 text-xs bg-background font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-primary mr-1.5 shrink-0" />
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ALL">Semua Cabang (Konsolidasi)</SelectItem>
                      {outlets.map((outlet) => (
                        <SelectItem key={outlet.id} value={outlet.id}>
                          {outlet.name} {outlet.isHQ ? '(HQ)' : ''}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="relative min-w-[200px] sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t('orders.searchPlaceholder', 'Cari nomor struk, meja, atau kasir...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5">
              <DatePickerWithRange
                date={dateRange}
                onSelect={setDateRange}
                placeholder="Pilih Rentang Tanggal"
                className="w-[210px]"
              />
              {dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange(undefined)}
                  className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Reset Filter Tanggal"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Badge
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                className="cursor-pointer px-2.5 py-1 text-[11px] font-semibold"
                onClick={() => setStatusFilter('ALL')}
              >
                {t('products.allCategories', 'Semua')} ({orders.length})
              </Badge>
              <Badge
                variant={statusFilter === 'PAID' ? 'default' : 'outline'}
                className="cursor-pointer px-2.5 py-1 text-[11px] font-semibold"
                onClick={() => setStatusFilter('PAID')}
              >
                Lunas ({orders.filter((o) => o.status !== 'PENDING').length})
              </Badge>
              <Badge
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                className="cursor-pointer px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border-amber-500/40"
                onClick={() => setStatusFilter('PENDING')}
              >
                <Clock className="h-3 w-3 mr-1" />
                Tertunda ({orders.filter((o) => o.status === 'PENDING').length})
              </Badge>
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
                {searchQuery || statusFilter !== 'ALL' || selectedOutletId !== 'ALL'
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
                    <TableHead className="text-xs font-semibold">Status / Metode</TableHead>
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
                  {filteredOrders.map((order) => {
                    const isPending = order.status === 'PENDING';

                    return (
                      <TableRow
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-mono font-bold text-xs">
                          <p>{order.orderNumber}</p>
                          {order.customerName && (
                            <p className="text-[11px] font-sans font-medium text-primary truncate max-w-[140px]">
                              {order.customerName}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px]">{order.cashierName}</span>
                              {order.outletName && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1 py-0 h-3.5 font-semibold bg-muted"
                                >
                                  {order.outletName}
                                </Badge>
                              )}
                            </div>
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
                          {isPending ? (
                            <Badge
                              variant="outline"
                              className="text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 text-[10px] font-bold py-0.5 px-2 gap-1"
                            >
                              <Clock className="h-2.5 w-2.5" />
                              <span>Tertunda</span>
                            </Badge>
                          ) : (
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
                          )}
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
                    );
                  })}
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

      {/* Owner PIN Verification Modal */}
      <PinModal
        open={isPinModalOpen}
        onOpenChange={setIsPinModalOpen}
        correctPin={settings?.ownerPin}
        title="Otorisasi Laporan Omzet"
        description="Masukkan PIN Pemilik Toko untuk membuka laporan pendapatan."
        onSuccess={() => {}}
      />
    </div>
  );
};

export default OrdersPage;
