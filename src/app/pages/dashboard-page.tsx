import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats';
import { formatCurrency } from '@/utils/format-currency';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useDashboardStats();

  const todayDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Toko</h2>
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2 py-0.5 bg-primary/5 text-primary border-primary/20"
            >
              Live Hari Ini
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            {todayDateStr} • Ringkasan performa penjualan dan operasional tokomu.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto gap-2 font-bold cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Buka Kasir</span>
          </Button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Omzet Hari Ini */}
        <Card className="border bg-card rounded-xl shadow-none">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Omzet Penjualan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-extrabold text-primary">
              {formatCurrency(stats.todayRevenue)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Total kotor dari transaksi hari ini
            </p>
          </CardContent>
        </Card>

        {/* 2. Estimasi Laba Bersih */}
        <Card className="border bg-card rounded-xl shadow-none">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Estimasi Laba Kotor
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.todayProfit)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Omzet dikurangi modal HPP barang
            </p>
          </CardContent>
        </Card>

        {/* 3. Jumlah Transaksi */}
        <Card className="border bg-card rounded-xl shadow-none">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Transaksi
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-extrabold text-foreground">
              {stats.todayOrderCount}{' '}
              <span className="text-sm font-normal text-muted-foreground">struk</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Struk berhasil terbit hari ini
            </p>
          </CardContent>
        </Card>

        {/* 4. Rata-rata Belanja (AOV) */}
        <Card className="border bg-card rounded-xl shadow-none">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Rata-rata Belanja
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-extrabold text-foreground">
              {formatCurrency(stats.todayAov)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Rata-rata pengeluaran per pelanggan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Left (Insights) & Right (Operations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Span 2): Top Products & Recent Live Orders */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top 5 Products Card */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">
                  Top 5 Produk Terlaris Hari Ini
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reports?tab=products')}
                className="text-xs text-primary font-semibold hover:bg-primary/10 h-7 px-2 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse py-4 text-center">
                  Memuat data penjualan...
                </p>
              ) : stats.topProducts.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-xl bg-muted/20">
                  <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">
                    Belum ada transaksi hari ini
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Produk yang terjual di kasir hari ini akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.topProducts.map((p, index) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            index === 0
                              ? 'bg-amber-500 text-white shadow-xs'
                              : index === 1
                                ? 'bg-slate-300 dark:bg-slate-700 text-foreground font-bold'
                                : index === 2
                                  ? 'bg-amber-700 text-white font-bold'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {p.category} • Terjual {p.quantitySold} unit
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-primary">
                          {formatCurrency(p.totalRevenue)}
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          +Laba {formatCurrency(p.profit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Live Sales Feed */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Receipt className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">
                  Transaksi Kasir Terakhir
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/orders')}
                className="text-xs text-primary font-semibold hover:bg-primary/10 h-7 px-2 cursor-pointer"
              >
                <span>Riwayat Struk</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {stats.recentOrders.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    Belum ada transaksi struk tercatat.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.recentOrders.map((order) => {
                    const timeStr = new Date(order.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={order.id}
                        onClick={() => navigate('/orders')}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {order.orderNumber}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {order.paymentMethod}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {timeStr} • {order.items.length} item • {order.cashierName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xs text-primary">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Low Stock Alerts & Quick Actions */}
        <div className="space-y-5">
          {/* Low Stock Urgent Alert Card */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                <CardTitle className="text-sm font-bold text-foreground">
                  Perlu Kulakan Stok ({stats.lowStockProducts.length})
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/stock-adjustment')}
                className="text-xs text-primary font-semibold hover:bg-primary/10 h-7 px-2 cursor-pointer"
              >
                <span>Stok Adjustment</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {stats.lowStockProducts.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl bg-emerald-500/5 border-emerald-500/20 space-y-1">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Stok Semua Produk Aman</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Tidak ada barang yang habis atau di bawah batas minimum.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.lowStockProducts.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">Kategori: {p.category}</p>
                      </div>
                      <Badge
                        variant={p.stock === 0 ? 'destructive' : 'outline'}
                        className={`text-[10px] shrink-0 font-bold ${
                          p.stock > 0
                            ? 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
                            : ''
                        }`}
                      >
                        {p.stock === 0 ? 'Habis (0)' : `Sisa ${p.stock}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Pintasan Cepat Operasional
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/products')}
                className="w-full justify-start text-xs font-semibold gap-2 h-9 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Tambah & Kelola Produk</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/stock-adjustment')}
                className="w-full justify-start text-xs font-semibold gap-2 h-9 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <span>Catat Kulakan / Penyesuaian Stok</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports')}
                className="w-full justify-start text-xs font-semibold gap-2 h-9 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                <span>Buka Laporan & Analitik Keuangan</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/sync')}
                className="w-full justify-start text-xs font-semibold gap-2 h-9 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                <span>Sinkronisasi Antar Perangkat</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
