import React, { useMemo } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format-currency';
import type { Order } from '@/types/order.types';

interface DailySummaryCardProps {
  orders: Order[];
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ orders }) => {
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

    const cashRevenue = todayOrders
      .filter((o) => o.paymentMethod === 'CASH')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const qrisRevenue = todayOrders
      .filter((o) => o.paymentMethod === 'QRIS')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const transferRevenue = todayOrders
      .filter((o) => o.paymentMethod === 'TRANSFER')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      cashRevenue,
      qrisRevenue,
      transferRevenue,
    };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Omzet Hari Ini</p>
            <p className="text-xl font-black tracking-tight text-primary">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Total Transaksi</p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {summary.totalOrders} Transaksi
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Average Transaction Value */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Rata-rata Transaksi</p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {formatCurrency(summary.averageTicket)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Payment Distribution */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">QRIS / Non-Tunai</p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {formatCurrency(summary.qrisRevenue + summary.transferRevenue)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
