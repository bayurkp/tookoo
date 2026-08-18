import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, TrendingUp, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/stat-card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { useStockAdjustments } from '@/features/inventory/hooks/use-stock-adjustments';
import { StockAdjustmentDialog } from '@/features/inventory/components/stock-adjustment-dialog';
import type { StockAdjustmentReason } from '@/types/stock-adjustment.types';

const REASON_LABELS: Record<
  StockAdjustmentReason,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  RESTOCK: { label: 'Kulakan / Masuk', variant: 'secondary' },
  PHYSICAL_COUNT: { label: 'Koreksi Fisik', variant: 'outline' },
  DAMAGED: { label: 'Barang Rusak', variant: 'destructive' },
  EXPIRED: { label: 'Kadaluarsa', variant: 'destructive' },
  INTERNAL_USE: { label: 'Pakai Sendiri', variant: 'outline' },
  OTHER: { label: 'Lainnya', variant: 'outline' },
};

export const StockAdjustmentPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: adjustments = [], isLoading } = useStockAdjustments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAdjustments = adjustments.filter((adj) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      adj.adjustmentNumber.toLowerCase().includes(q) ||
      adj.adjustedBy.toLowerCase().includes(q) ||
      (adj.notes && adj.notes.toLowerCase().includes(q)) ||
      adj.items.some(
        (it) =>
          it.productName.toLowerCase().includes(q) ||
          (it.variantName && it.variantName.toLowerCase().includes(q))
      )
    );
  });

  // Calculate summary metrics
  const totalRestockCount = adjustments.reduce((sum, adj) => {
    return (
      sum +
      adj.items
        .filter((it) => it.reason === 'RESTOCK' && it.difference > 0)
        .reduce((s, it) => s + it.difference, 0)
    );
  }, 0);

  const totalDamagedCount = adjustments.reduce((sum, adj) => {
    return (
      sum +
      adj.items
        .filter((it) => ['DAMAGED', 'EXPIRED'].includes(it.reason))
        .reduce((s, it) => s + Math.abs(it.difference), 0)
    );
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('inventory.title', 'Stok Adjustment (Penyesuaian Stok)')}
        description={t(
          'inventory.subtitle',
          'Catat barang masuk (kulakan), barang rusak, kadaluarsa, dan koreksi hitung fisik toko.'
        )}
        actions={
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto gap-2 font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t('inventory.createAdjustment', 'Buat Penyesuaian Stok')}</span>
          </Button>
        }
      />

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Riwayat Penyesuaian"
          value={adjustments.length}
          icon={Layers}
          variant="default"
          subtitle="Dokumen tercatat di perangkat"
        />

        <StatCard
          title="Total Barang Masuk (Kulakan)"
          value={`+${totalRestockCount} unit`}
          icon={TrendingUp}
          variant="success"
          subtitle="Penambahan dari kulakan baru"
        />

        <StatCard
          title="Barang Rusak / Kadaluarsa"
          value={`-${totalDamagedCount} unit`}
          icon={AlertTriangle}
          variant="danger"
          subtitle="Kerusakan fisik atau kadaluarsa"
        />
      </div>

      {/* Search & History Table */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari no. dokumen, produk, atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-card rounded-xl border">
            <p className="text-xs text-muted-foreground animate-pulse">
              Memuat riwayat penyesuaian stok...
            </p>
          </div>
        ) : filteredAdjustments.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl bg-card">
            <Layers className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              Belum ada catatan penyesuaian stok
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs mx-auto">
              Gunakan tombol "Buat Penyesuaian Stok" untuk mencatat kulakan barang baru atau barang
              rusak.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
                  <TableHead className="text-xs font-bold">WAKTU & DOKUMEN</TableHead>
                  <TableHead className="text-xs font-bold">PRODUK & VARIAN</TableHead>
                  <TableHead className="text-xs font-bold">ALASAN</TableHead>
                  <TableHead className="text-xs font-bold text-center">SEBELUM</TableHead>
                  <TableHead className="text-xs font-bold text-center">SESUDAH</TableHead>
                  <TableHead className="text-xs font-bold text-right">SELISIH</TableHead>
                  <TableHead className="text-xs font-bold">PETUGAS / CATATAN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map((adj, index) => {
                  const dateStr = new Date(adj.createdAt).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <React.Fragment key={adj.id}>
                      {adj.items.map((item, itemIdx) => {
                        const reasonInfo = REASON_LABELS[item.reason] || {
                          label: item.reason,
                          variant: 'outline',
                        };

                        return (
                          <TableRow key={`${adj.id}-${itemIdx}`} className="hover:bg-muted/30">
                            <TableCell className="text-center text-xs text-muted-foreground font-mono">
                              {index + 1}
                            </TableCell>

                            <TableCell>
                              <p className="font-mono text-xs font-bold text-foreground">
                                {adj.adjustmentNumber}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{dateStr}</p>
                            </TableCell>

                            <TableCell>
                              <p className="font-semibold text-xs text-foreground">
                                {item.productName}
                              </p>
                              {item.variantName && (
                                <p className="text-[10px] text-primary font-medium">
                                  Varian: {item.variantName}
                                </p>
                              )}
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={reasonInfo.variant}
                                className="text-[10px] px-2 py-0 font-semibold"
                              >
                                {reasonInfo.label}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center text-xs text-muted-foreground">
                              {item.previousStock}
                            </TableCell>

                            <TableCell className="text-center text-xs font-bold text-foreground">
                              {item.adjustedStock}
                            </TableCell>

                            <TableCell className="text-right">
                              <span
                                className={`text-xs font-extrabold ${
                                  item.difference > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : item.difference < 0
                                      ? 'text-destructive'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                {item.difference > 0 ? `+${item.difference}` : `${item.difference}`}
                              </span>
                            </TableCell>

                            <TableCell>
                              <p className="text-xs font-medium text-foreground">
                                {adj.adjustedBy}
                              </p>
                              {(item.notes || adj.notes) && (
                                <p className="text-[10px] text-muted-foreground italic truncate max-w-xs">
                                  "{item.notes || adj.notes}"
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};

export default StockAdjustmentPage;
