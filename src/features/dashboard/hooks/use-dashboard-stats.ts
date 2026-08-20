import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { Order } from '@/types/order.types';
import type { Product } from '@/types/product.types';

export interface TopProductStat {
  productId: string;
  name: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

export interface DashboardStats {
  todayRevenue: number;
  todayProfit: number;
  todayOrderCount: number;
  todayAov: number; // Average Order Value
  topProducts: TopProductStat[];
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export const useDashboardStats = (selectedOutletId?: string) => {
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

  const stats: DashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    // Map products for fast HPP / costPrice lookup
    const productCostMap = new Map<string, number>();
    products.forEach((p) => {
      productCostMap.set(p.id, p.costPrice || 0);
    });

    // 1. Filter today's completed orders (and filter by outlet if selected)
    const completedOrders = orders.filter((o) => {
      const isNotPending = o.status !== 'PENDING';
      const matchOutlet =
        !selectedOutletId || selectedOutletId === 'ALL' || o.outletId === selectedOutletId;
      return isNotPending && matchOutlet;
    });
    const todayOrders = completedOrders.filter((o) => o.createdAt >= todayStart);
    const todayOrderCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayAov = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0;

    // 2. Compute today's profit and top products
    let todayCost = 0;
    const productSoldMap = new Map<
      string,
      { name: string; category: string; qty: number; revenue: number; cost: number }
    >();

    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const itemCost = (productCostMap.get(item.productId) || 0) * item.qty;
        todayCost += itemCost;

        const existing = productSoldMap.get(item.productId) || {
          name: item.name,
          category: 'Umum',
          qty: 0,
          revenue: 0,
          cost: 0,
        };

        existing.qty += item.qty;
        existing.revenue += item.subtotal;
        existing.cost += itemCost;

        // Try to fetch accurate category from products
        const pObj = products.find((p) => p.id === item.productId);
        if (pObj?.category) existing.category = pObj.category;

        productSoldMap.set(item.productId, existing);
      });
    });

    const todayProfit = todayRevenue - todayCost;

    // 3. Top 5 Best-Selling Products Today
    const topProducts: TopProductStat[] = Array.from(productSoldMap.entries())
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        category: data.category,
        quantitySold: data.qty,
        totalRevenue: data.revenue,
        totalCost: data.cost,
        profit: data.revenue - data.cost,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // 4. Low stock products (stock <= minStock or stock === 0)
    const lowStockProducts = products
      .filter((p) => p.productType !== 'SERVICE' && p.stock <= (p.minStock ?? 5))
      .sort((a, b) => a.stock - b.stock);

    // 5. Recent 5 orders
    const recentOrders = orders.slice(0, 5);

    return {
      todayRevenue,
      todayProfit,
      todayOrderCount,
      todayAov,
      topProducts,
      lowStockProducts,
      recentOrders,
    };
  }, [orders, products, selectedOutletId]);

  return {
    stats,
    isLoading: isLoadingOrders || isLoadingProducts,
  };
};
