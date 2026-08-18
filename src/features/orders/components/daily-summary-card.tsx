import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Sparkles, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

interface DailySummaryCardProps {
  orders: Order[];
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ orders }) => {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    const endOfToday = startOfToday + 86400000;
    const startOfYesterday = startOfToday - 86400000;

    const completedOrders = orders.filter((o) => o.status !== 'PENDING' && o.deletedAt === null);

    const todayOrders = completedOrders.filter(
      (order) => order.createdAt >= startOfToday && order.createdAt < endOfToday
    );
    const yesterdayOrders = completedOrders.filter(
      (order) => order.createdAt >= startOfYesterday && order.createdAt < startOfToday
    );

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueGrowth =
      yesterdayRevenue === 0
        ? todayRevenue > 0
          ? 100
          : 0
        : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    const todayCount = todayOrders.length;
    const yesterdayCount = yesterdayOrders.length;
    const countGrowth =
      yesterdayCount === 0
        ? todayCount > 0
          ? 100
          : 0
        : ((todayCount - yesterdayCount) / yesterdayCount) * 100;

    const todayAverage = todayCount > 0 ? todayRevenue / todayCount : 0;
    const yesterdayAverage = yesterdayCount > 0 ? yesterdayRevenue / yesterdayCount : 0;
    const averageGrowth =
      yesterdayAverage === 0
        ? todayAverage > 0
          ? 100
          : 0
        : ((todayAverage - yesterdayAverage) / yesterdayAverage) * 100;

    const nonCashRevenue = todayOrders
      .filter((o) => o.paymentMethod !== 'CASH')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const nonCashPercentage =
      todayRevenue > 0 ? Math.round((nonCashRevenue / todayRevenue) * 100) : 0;

    return {
      todayRevenue,
      revenueGrowth,
      todayCount,
      countGrowth,
      todayAverage,
      averageGrowth,
      nonCashRevenue,
      nonCashPercentage,
    };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Revenue */}
      <StatCard
        title={t('orders.todayRevenue', 'Total Omzet')}
        value={formatCurrency(metrics.todayRevenue)}
        icon={DollarSign}
        variant="primary"
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-semibold px-1.5 py-0 rounded-md border-border/80 bg-muted/40 gap-0.5"
          >
            {metrics.revenueGrowth >= 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>+{metrics.revenueGrowth.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-rose-500" />
                <span>{metrics.revenueGrowth.toFixed(1)}%</span>
              </>
            )}
          </Badge>
        }
        subtitle="Akumulasi penjualan kasir hari ini"
      />

      {/* 2. Total Orders / Transactions */}
      <StatCard
        title={t('orders.totalOrders', 'Total Transaksi')}
        value={
          <>
            {metrics.todayCount.toLocaleString('id-ID')}{' '}
            <span className="text-sm font-normal text-muted-foreground">struk</span>
          </>
        }
        icon={Receipt}
        variant="default"
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-semibold px-1.5 py-0 rounded-md border-border/80 bg-muted/40 gap-0.5"
          >
            {metrics.countGrowth >= 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>+{metrics.countGrowth.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-rose-500" />
                <span>{metrics.countGrowth.toFixed(1)}%</span>
              </>
            )}
          </Badge>
        }
        subtitle="Struk belanja tercatat di terminal"
      />

      {/* 3. Average Order Value */}
      <StatCard
        title={t('orders.averageReceipt', 'Rata-rata Struk')}
        value={formatCurrency(metrics.todayAverage)}
        icon={Sparkles}
        variant="info"
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-semibold px-1.5 py-0 rounded-md border-border/80 bg-muted/40 gap-0.5"
          >
            {metrics.averageGrowth >= 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>+{metrics.averageGrowth.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-rose-500" />
                <span>{metrics.averageGrowth.toFixed(1)}%</span>
              </>
            )}
          </Badge>
        }
        subtitle="Rata-rata belanja per pembeli"
      />

      {/* 4. Non-Cash & Growth Ratio */}
      <StatCard
        title={t('orders.nonCashRevenue', 'Porsi Non-Tunai')}
        value={formatCurrency(metrics.nonCashRevenue)}
        icon={QrCode}
        variant="success"
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-semibold px-1.5 py-0 rounded-md border-border/80 bg-muted/40 gap-0.5"
          >
            <span>{metrics.nonCashPercentage}% Digital</span>
          </Badge>
        }
        subtitle="Total penerimaan QRIS & transfer"
      />
    </div>
  );
};

export default DailySummaryCard;
