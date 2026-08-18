import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Download,
  Printer,
  Layers,
  CreditCard,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  useReportsAnalytics,
  type TimeRangeFilter,
} from '@/features/reports/hooks/use-reports-analytics';
import { formatCurrency } from '@/utils/format-currency';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'pnl';
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('THIS_MONTH');
  const [productSearch, setProductSearch] = useState('');

  const { analytics } = useReportsAnalytics(timeRange);

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  const handleExportCSV = () => {
    const rows = [
      [
        'No',
        'Nama Produk',
        'Kategori',
        'Qty Terjual',
        'Total Omzet (Rp)',
        'Total HPP (Rp)',
        'Laba Bersih (Rp)',
        'Margin (%)',
      ],
      ...analytics.productsPerformance.map((p, idx) => [
        idx + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category.replace(/"/g, '""')}"`,
        p.quantitySold,
        p.grossRevenue,
        p.totalCost,
        p.grossProfit,
        `${p.profitMargin}%`,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_Tookoo_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProductPerformance = analytics.productsPerformance.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('reports.title', 'Laporan & Analisis Finansial')}
        description={t(
          'reports.subtitle',
          'Evaluasi laba kotor, performa produk terlaris, rekap kas kasir, dan pembukuan toko.'
        )}
        actions={
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
            {(
              [
                { id: 'TODAY', label: 'Hari Ini' },
                { id: 'LAST_7_DAYS', label: '7 Hari' },
                { id: 'THIS_MONTH', label: 'Bulan Ini' },
                { id: 'ALL_TIME', label: 'Semua' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTimeRange(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  timeRange === item.id
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        defaultValue="pnl"
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <div className="border-b pb-1 flex items-center justify-between overflow-x-auto scrollbar-none">
          <TabsList className="h-10 p-1 bg-muted/60">
            <TabsTrigger value="pnl" className="gap-2 text-xs font-bold px-3 py-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Laba Rugi & Penjualan</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 text-xs font-bold px-3 py-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Performa Produk ({analytics.productsPerformance.length})</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 text-xs font-bold px-3 py-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Kas & Pembayaran</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2 text-xs font-bold px-3 py-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Ekspor & Cetak</span>
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-bold cursor-pointer hidden sm:flex shrink-0"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ekspor Excel/CSV</span>
          </Button>
        </div>

        {/* TAB 1: LABA RUGI & PENJUALAN */}
        <TabsContent value="pnl" className="space-y-5 m-0">
          {/* 4 Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Omzet Bersih */}
            <Card className="border bg-card rounded-xl shadow-none">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Omzet Bersih
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-extrabold text-primary">
                  {formatCurrency(analytics.netSales)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Omzet kotor {formatCurrency(analytics.grossSales)}
                  {analytics.totalDiscounts > 0 &&
                    ` (-Diskon ${formatCurrency(analytics.totalDiscounts)})`}
                </p>
              </CardContent>
            </Card>

            {/* Total Modal HPP */}
            <Card className="border bg-card rounded-xl shadow-none">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Modal Barang (HPP)
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-extrabold text-muted-foreground">
                  {formatCurrency(analytics.totalCost)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Total biaya beli/modal produk terjual
                </p>
              </CardContent>
            </Card>

            {/* Laba Kotor */}
            <Card className="border bg-card rounded-xl shadow-none">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Laba Kotor
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(analytics.grossProfit)}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Margin Laba: {analytics.profitMargin}%
                </p>
              </CardContent>
            </Card>

            {/* Rata-rata Belanja & Transaksi */}
            <Card className="border bg-card rounded-xl shadow-none">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Rata-rata Transaksi (AOV)
                </CardTitle>
                <Receipt className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-extrabold text-foreground">
                  {formatCurrency(analytics.averageOrderValue)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dari total {analytics.orderCount} transaksi struk
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trend Overview Table / Chart */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold text-foreground">
                Tren Pendapatan & Laba Harian
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {analytics.dailyTrends.length} Hari Aktif
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              {analytics.dailyTrends.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-xl bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    Tidak ada transaksi pada periode ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.dailyTrends.map((d) => {
                    const maxRev = Math.max(...analytics.dailyTrends.map((t) => t.revenue), 1);
                    const widthPct = Math.round((d.revenue / maxRev) * 100);

                    return (
                      <div key={d.dateKey} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{d.dateLabel}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-muted-foreground">
                              {d.orderCount} struk
                            </span>
                            <span className="font-bold text-primary">
                              {formatCurrency(d.revenue)}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              (Laba: {formatCurrency(d.profit)})
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PERFORMA PRODUK */}
        <TabsContent value="products" className="space-y-4 m-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari performa produk atau kategori..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
              Total {filteredProductPerformance.length} Produk Terjual
            </Badge>
          </div>

          {filteredProductPerformance.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-xl bg-card">
              <p className="text-sm font-semibold text-foreground">Tidak ada penjualan produk</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Produk yang terjual pada rentang waktu ini akan ditampilkan di sini.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
                    <TableHead className="text-xs font-bold">NAMA PRODUK</TableHead>
                    <TableHead className="text-xs font-bold">KATEGORI</TableHead>
                    <TableHead className="text-xs font-bold text-center">QTY TERJUAL</TableHead>
                    <TableHead className="text-xs font-bold text-right">TOTAL OMZET</TableHead>
                    <TableHead className="text-xs font-bold text-right">TOTAL MODAL</TableHead>
                    <TableHead className="text-xs font-bold text-right">LABA KOTOR</TableHead>
                    <TableHead className="text-xs font-bold text-center">MARGIN</TableHead>
                    <TableHead className="text-xs font-bold text-center">PORSI OMZET</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductPerformance.map((p, idx) => (
                    <TableRow key={p.productId} className="hover:bg-muted/30">
                      <TableCell className="text-center text-xs text-muted-foreground font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-xs text-foreground line-clamp-1">
                          {p.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{p.category}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-xs text-foreground">
                          {p.quantitySold} unit
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-xs text-primary">
                          {formatCurrency(p.grossRevenue)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {p.totalCost > 0 ? formatCurrency(p.totalCost) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.grossProfit)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {p.profitMargin}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {p.revenueShare}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: KAS & METODE PEMBAYARAN */}
        <TabsContent value="payments" className="space-y-4 m-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analytics.paymentBreakdown.map((pay) => (
              <Card key={pay.method} className="border bg-card rounded-xl shadow-none">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4.5 w-4.5 text-primary" />
                    <CardTitle className="text-sm font-bold text-foreground">
                      {pay.method === 'CASH' ? 'Uang Tunai (Laci Kasir)' : pay.method}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {pay.percentage}%
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-1">
                  <p className="text-2xl font-extrabold text-primary">
                    {formatCurrency(pay.totalAmount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Diterima dari {pay.count} transaksi struk
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: EKSPOR & CETAK RINGKASAN */}
        <TabsContent value="export" className="space-y-4 m-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CSV Card */}
            <Card className="border bg-card rounded-xl shadow-none p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">
                  Ekspor Laporan Penjualan (CSV / Excel)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Unduh seluruh rincian penjualan produk, total modal HPP, margin laba, dan
                  transaksi dalam format CSV yang kompatibel dengan Microsoft Excel dan Google
                  Sheets.
                </p>
              </div>
              <Button
                onClick={handleExportCSV}
                className="mt-4 gap-2 font-bold cursor-pointer text-xs"
              >
                <Download className="h-4 w-4" />
                <span>Unduh File CSV ({timeRange})</span>
              </Button>
            </Card>

            {/* Print Slip Card */}
            <Card className="border bg-card rounded-xl shadow-none p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Printer className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Cetak Rekap Penjualan Kasir</h3>
                <p className="text-xs text-muted-foreground">
                  Cetak ringkasan penutupan kas dan total pendapatan ke printer thermal kasir atau
                  cetak PDF langsung dari browser.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="mt-4 gap-2 font-bold cursor-pointer text-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Rekap Laporan</span>
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
