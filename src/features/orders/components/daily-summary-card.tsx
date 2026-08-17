import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShoppingBag, CreditCard, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

interface DailySummaryCardProps {
  orders: Order[];
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ orders }) => {
  const { t } = useTranslation();

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();
    const endOfDay = startOfDay + 86400000;

    const todayOrders = orders.filter(
      (order) => order.createdAt >= startOfDay && order.createdAt < endOfDay
    );

    const totalRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = todayOrders.length;
    const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const nonCashRevenue = todayOrders
      .filter((o) => o.paymentMethod === 'QRIS' || o.paymentMethod === 'TRANSFER')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      nonCashRevenue,
    };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Omzet */}
      <Card className="bg-card border-border/80 shadow-none">
        <CardHeader className="p-4 pb-2 relative">
          <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('orders.todayRevenue', 'Omzet Hari Ini')}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrency(summary.totalRevenue)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 text-muted-foreground"
            >
              <DollarSign className="h-3 w-3" />
              <span>Hari Ini</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Total pemasukan kasir hari ini</span>
        </CardFooter>
      </Card>

      {/* 2. Total Transaksi */}
      <Card className="bg-card border-border/80 shadow-none">
        <CardHeader className="p-4 pb-2 relative">
          <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('orders.totalOrders', 'Total Transaksi')}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {summary.totalOrders}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 text-muted-foreground"
            >
              <ShoppingBag className="h-3 w-3" />
              <span>{t('orders.transactionsUnit', 'Transaksi')}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Struk belanja tercatat</span>
        </CardFooter>
      </Card>

      {/* 3. Rata-rata Struk */}
      <Card className="bg-card border-border/80 shadow-none">
        <CardHeader className="p-4 pb-2 relative">
          <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('orders.averageReceipt', 'Rata-rata Struk')}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrency(summary.averageTicket)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 text-muted-foreground"
            >
              <TrendingUp className="h-3 w-3" />
              <span>Per Struk</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Rata-rata nilai belanja per pembeli</span>
        </CardFooter>
      </Card>

      {/* 4. Non-Tunai / QRIS */}
      <Card className="bg-card border-border/80 shadow-none">
        <CardHeader className="p-4 pb-2 relative">
          <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('orders.nonCashRevenue', 'QRIS / Transfer')}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrency(summary.nonCashRevenue)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2 text-muted-foreground"
            >
              <CreditCard className="h-3 w-3" />
              <span>Non-Tunai</span>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Total transaksi digital tanpa uang tunai</span>
        </CardFooter>
      </Card>
    </div>
  );
};
