import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Scale,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Pemasukan / Omzet */}
      <Card className="border bg-card rounded-xl shadow-none p-3.5 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Pemasukan (Omzet)
          </p>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
            <span>Dari pesanan kasir selesai</span>
          </p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <TrendingUp className="h-5 w-5" />
        </div>
      </Card>

      {/* 2. Total Pengeluaran Operasional */}
      <Card className="border bg-card rounded-xl shadow-none p-3.5 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Biaya Operasional
          </p>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {expenseCount} transaksi pengeluaran
          </p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
          <TrendingDown className="h-5 w-5" />
        </div>
      </Card>

      {/* 3. Pembelian Stok / Kulakan */}
      <Card className="border bg-card rounded-xl shadow-none p-3.5 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Pembelian Stok (Kulakan)
          </p>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {formatCurrency(totalPurchases)}
          </p>
          <p className="text-[10px] text-muted-foreground">Investasi persediaan barang</p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
          <Wallet className="h-5 w-5" />
        </div>
      </Card>

      {/* 4. Arus Kas Bersih (Net Cash Flow) */}
      <Card
        className={`border rounded-xl shadow-none p-3.5 flex items-center justify-between ${
          isSurplus
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-destructive/5 border-destructive/30'
        }`}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Arus Kas Bersih (Laba)
            </p>
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
          </div>
          <p
            className={`text-xl font-black font-mono ${
              isSurplus
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-destructive'
            }`}
          >
            {isSurplus ? '+' : ''}
            {formatCurrency(netCashFlow)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isSurplus ? 'Kas toko positif' : 'Pengeluaran melebihi omzet'}
          </p>
        </div>
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold ${
            isSurplus
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          <Scale className="h-5 w-5" />
        </div>
      </Card>
    </div>
  );
};

export default CashFlowSummaryCard;
