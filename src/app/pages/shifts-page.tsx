import React, { useState } from 'react';
import { Clock, Plus, ArrowUpRight, ArrowDownLeft, Printer, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { db } from '@/lib/db';
import { formatCurrency } from '@/utils/format-currency';

export const ShiftsPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  const { data: todayOrders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const all = await db.orders.toArray();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return all.filter((o) => !o.deletedAt && o.createdAt >= startOfDay.getTime());
    },
  });

  const totalCashSalesToday = todayOrders
    .filter((o) => o.paymentMethod === 'CASH')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalNonCashSalesToday = todayOrders
    .filter((o) => o.paymentMethod !== 'CASH')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const [initialCash] = useState(200000);

  const cashierName = settings?.defaultCashier || t('auth.roles.cashier', 'Kasir 1');
  const terminalName =
    settings?.deviceName || t('settings.deviceProfile.deviceName', 'Terminal Utama');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span>{t('shifts.title', 'Shift & Uang Kas')}</span>
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {t(
              'shifts.subtitle',
              'Pencatatan kas modal awal, serah terima shift staf, dan rekonsiliasi uang fisik laci kasir.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
            <Printer className="h-4 w-4" />
            <span>{t('shifts.printXReport', 'Cetak Laporan X')}</span>
          </Button>
          <Button size="sm" className="gap-2 text-xs font-semibold">
            <Plus className="h-4 w-4" />
            <span>{t('shifts.closeShift', 'Tutup Shift Kasir')}</span>
          </Button>
        </div>
      </div>

      {/* Active Shift Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Shift Status & Cashier */}
        <Card className="rounded-xl shadow-none">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t('shifts.currentShift', 'Shift Saat Ini')}
              </span>
              <Badge
                variant="secondary"
                className="gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              >
                <CheckCircle2 className="size-3" />
                <span>{t('shifts.shiftActive', 'Shift 1 (Aktif)')}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="text-xl font-bold text-foreground">{cashierName}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{t('shifts.openedToday', 'Dibuka hari ini, 08:00 WIB')}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {t('shifts.terminal', 'Terminal')}:{' '}
              <span className="text-foreground font-medium">{terminalName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cash Drawer Float & Physical Cash Balance */}
        <Card className="rounded-xl shadow-none">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t('shifts.cashDrawer', 'Saldo Kas Fisik (Laci)')}
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(initialCash + totalCashSalesToday)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>{t('shifts.initialCash', 'Modal Kas Awal')}:</span>
              <span className="font-medium text-foreground">{formatCurrency(initialCash)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('shifts.cashSales', 'Penjualan Tunai')}:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(totalCashSalesToday)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Non-Cash & Order Statistics */}
        <Card className="rounded-xl shadow-none">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t('shifts.nonCashSales', 'Transaksi Non-Tunai')}
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalNonCashSalesToday)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>{t('shifts.shiftOrders', 'Total Transaksi Shift')}:</span>
              <span className="font-medium text-foreground">
                {t('shifts.ordersCount', '{{count}} Pesanan', { count: todayOrders.length })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('shifts.qrisAndTransfer', 'QRIS & Transfer')}:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(totalNonCashSalesToday)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Drawer Operational Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 rounded-xl shadow-none flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                {t('shifts.paidIn', 'Kas Masuk (Paid-In)')}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('shifts.paidInDesc', 'Tambah uang kembalian / modal tambahan ke laci kasir.')}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold shrink-0">
            <Plus className="h-3.5 w-3.5" />
            <span>{t('shifts.paidInBtn', 'Kas Masuk')}</span>
          </Button>
        </Card>

        <Card className="p-5 rounded-xl shadow-none flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                {t('shifts.paidOut', 'Kas Keluar (Paid-Out)')}
              </div>
              <div className="text-xs text-muted-foreground">
                {t(
                  'shifts.paidOutDesc',
                  'Ambil uang dari laci untuk kebutuhan mendesak / operasional toko.'
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold shrink-0">
            <Plus className="h-3.5 w-3.5" />
            <span>{t('shifts.paidOutBtn', 'Kas Keluar')}</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ShiftsPage;
