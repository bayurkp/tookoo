import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { Order } from '@/types/order.types';
import type { Product } from '@/types/product.types';

export type TimeRangeFilter = 'TODAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'ALL_TIME';

export interface ProductPerformance {
  productId: string;
  name: string;
  category: string;
  quantitySold: number;
  grossRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  revenueShare: number; // percentage of total revenue
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface DailyTrendItem {
  dateLabel: string;
  dateKey: string;
  revenue: number;
  profit: number;
  orderCount: number;
}

export interface ReportsAnalytics {
  grossSales: number;
  totalDiscounts: number;
  netSales: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  orderCount: number;
  averageOrderValue: number;
  productsPerformance: ProductPerformance[];
  paymentBreakdown: PaymentMethodBreakdown[];
  dailyTrends: DailyTrendItem[];
}

export const useReportsAnalytics = (timeRange: TimeRangeFilter, selectedOutletId?: string) => {
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const list = await db.orders.toArray();
      return list.filter((o) => o.deletedAt === null).sort((a, b) => b.createdAt - a.createdAt);
    },
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const list = await db.products.toArray();
      return list.filter((p) => p.deletedAt === null);
    },
  });

  const analytics: ReportsAnalytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startTime = 0;
    if (timeRange === 'TODAY') {
      startTime = today.getTime();
    } else if (timeRange === 'LAST_7_DAYS') {
      startTime = today.getTime() - 6 * 24 * 60 * 60 * 1000;
    } else if (timeRange === 'THIS_MONTH') {
      startTime = today.getTime() - 29 * 24 * 60 * 60 * 1000;
    }

    // Filter completed orders by time range and optional outlet
    const completedOrders = orders.filter((o) => {
      const isNotPending = o.status !== 'PENDING';
      const matchOutlet =
        !selectedOutletId || selectedOutletId === 'ALL' || o.outletId === selectedOutletId;
      return isNotPending && matchOutlet;
    });
    const filteredOrders = completedOrders.filter((o) => o.createdAt >= startTime);

    // Map products for fast HPP / costPrice lookup
    const productCostMap = new Map<string, number>();
    const productCategoryMap = new Map<string, string>();
    products.forEach((p) => {
      productCostMap.set(p.id, p.costPrice || 0);
      productCategoryMap.set(p.id, p.category || 'Umum');
    });

    let grossSales = 0;
    let totalDiscounts = 0;
    let netSales = 0;
    let totalCost = 0;

    const productMap = new Map<
      string,
      { name: string; category: string; qty: number; revenue: number; cost: number }
    >();

    const paymentMap = new Map<string, { count: number; totalAmount: number }>();
    const dailyMap = new Map<string, { revenue: number; profit: number; orderCount: number }>();

    filteredOrders.forEach((order) => {
      grossSales += order.subtotal;
      totalDiscounts += order.discount;
      netSales += order.totalAmount;

      // Payment method grouping
      const pMethod = order.paymentMethod || 'TUNAI';
      const existingPay = paymentMap.get(pMethod) || { count: 0, totalAmount: 0 };
      existingPay.count += 1;
      existingPay.totalAmount += order.totalAmount;
      paymentMap.set(pMethod, existingPay);

      // Daily trend grouping (Key format: YYYY-MM-DD)
      const orderDate = new Date(order.createdAt);
      const dateKey = orderDate.toISOString().slice(0, 10);
      const existingDaily = dailyMap.get(dateKey) || { revenue: 0, profit: 0, orderCount: 0 };
      existingDaily.revenue += order.totalAmount;
      existingDaily.orderCount += 1;

      // Products item calculation
      let orderItemCost = 0;
      order.items.forEach((item) => {
        const costPerUnit = productCostMap.get(item.productId) || 0;
        const itemTotalCost = costPerUnit * item.qty;
        totalCost += itemTotalCost;
        orderItemCost += itemTotalCost;

        const existingProd = productMap.get(item.productId) || {
          name: item.name,
          category: productCategoryMap.get(item.productId) || 'Umum',
          qty: 0,
          revenue: 0,
          cost: 0,
        };

        existingProd.qty += item.qty;
        existingProd.revenue += item.subtotal;
        existingProd.cost += itemTotalCost;
        productMap.set(item.productId, existingProd);
      });

      existingDaily.profit += order.totalAmount - orderItemCost;
      dailyMap.set(dateKey, existingDaily);
    });

    const grossProfit = netSales - totalCost;
    const profitMargin = netSales > 0 ? Number(((grossProfit / netSales) * 100).toFixed(1)) : 0;
    const orderCount = filteredOrders.length;
    const averageOrderValue = orderCount > 0 ? Math.round(netSales / orderCount) : 0;

    // Build Product Performance List
    const productsPerformance: ProductPerformance[] = Array.from(productMap.entries())
      .map(([productId, data]) => {
        const itemProfit = data.revenue - data.cost;
        const itemMargin =
          data.revenue > 0 ? Number(((itemProfit / data.revenue) * 100).toFixed(1)) : 0;
        const share = netSales > 0 ? Number(((data.revenue / netSales) * 100).toFixed(1)) : 0;

        return {
          productId,
          name: data.name,
          category: data.category,
          quantitySold: data.qty,
          grossRevenue: data.revenue,
          totalCost: data.cost,
          grossProfit: itemProfit,
          profitMargin: itemMargin,
          revenueShare: share,
        };
      })
      .sort((a, b) => b.grossRevenue - a.grossRevenue);

    // Build Payment Breakdown
    const paymentBreakdown: PaymentMethodBreakdown[] = Array.from(paymentMap.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        totalAmount: data.totalAmount,
        percentage: netSales > 0 ? Number(((data.totalAmount / netSales) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Build Daily Trends
    const dailyTrends: DailyTrendItem[] = Array.from(dailyMap.entries())
      .map(([dateKey, data]) => {
        const d = new Date(dateKey);
        const dateLabel = d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        });
        return {
          dateKey,
          dateLabel,
          revenue: data.revenue,
          profit: data.profit,
          orderCount: data.orderCount,
        };
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    return {
      grossSales,
      totalDiscounts,
      netSales,
      totalCost,
      grossProfit,
      profitMargin,
      orderCount,
      averageOrderValue,
      productsPerformance,
      paymentBreakdown,
      dailyTrends,
    };
  }, [orders, products, timeRange, selectedOutletId]);

  return {
    analytics,
    orders,
    isLoading: isLoadingOrders || isLoadingProducts,
  };
};
