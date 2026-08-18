import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/utils/format-currency';

interface CashFlowSummaryCardProps {
  totalRevenue: number; // Omzet Penjualan
  totalExpenses: number; // Pengeluaran Operasional
  totalPurchases: number; // Pembelian Stok
  expenseCount: number;
}

export const CashFlowSummaryCard: React.FC<CashFlowSummaryCardProps> = ({
  totalRevenue,
  totalExpenses,
  totalPurchases,
  expenseCount,
}) => {
  const allCosts = totalExpenses + totalPurchases;
  const netCashFlow = totalRevenue - allCosts;
  const isSurplus = netCashFlow >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pemasukan / Omzet */}
      <StatCard
        title="Total Pemasukan (Omzet)"
        value={formatCurrency(totalRevenue)}
        variant="success"
        icon={TrendingUp}
        subtitle={
          <>
            <ArrowUpRight className="h-3 w-3 text-emerald-500 shrink-0" />
            <span>Dari pesanan kasir selesai</span>
          </>
        }
      />

      {/* 2. Total Pengeluaran Operasional */}
      <StatCard
        title="Total Biaya Operasional"
        value={formatCurrency(totalExpenses)}
        variant="danger"
        icon={TrendingDown}
        subtitle={`${expenseCount} transaksi pengeluaran`}
      />

      {/* 3. Pembelian Stok / Kulakan */}
      <StatCard
        title="Pembelian Stok (Kulakan)"
        value={formatCurrency(totalPurchases)}
        variant="info"
        icon={Wallet}
        subtitle="Investasi persediaan barang"
      />

      {/* 4. Arus Kas Bersih (Net Cash Flow) */}
      <StatCard
        title="Arus Kas Bersih (Laba)"
        value={`${isSurplus ? '+' : ''}${formatCurrency(netCashFlow)}`}
        variant={isSurplus ? 'success' : 'danger'}
        icon={Scale}
        badge={
          <Badge
            variant="outline"
            className={`text-[9px] px-1 py-0 font-bold ${
              isSurplus
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-destructive/10 text-destructive border-destructive/30'
            }`}
          >
            {isSurplus ? 'Surplus' : 'Defisit'}
          </Badge>
        }
        subtitle={isSurplus ? 'Kas toko positif' : 'Pengeluaran melebihi omzet'}
      />
    </div>
  );
};

export default CashFlowSummaryCard;
