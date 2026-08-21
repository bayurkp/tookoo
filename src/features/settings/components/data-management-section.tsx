import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Database,
  Receipt,
  Package,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PinModal } from '@/components/pin-modal';
import {
  useDataSummary,
  useClearOrders,
  useClearProductsAndStock,
  useClearTables,
  useClearDiscountsAndTaxes,
  useResetMasterDataToDefaults,
  useResetFullDatabase,
} from '../hooks/use-data-management';
import { useQueryClient } from '@tanstack/react-query';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { sounds } from '@/utils/audio';
import { loadProfessionalDemoData } from '../data/demo-data';

type ClearActionType =
  | 'CLEAR_ORDERS'
  | 'CLEAR_PRODUCTS'
  | 'CLEAR_TABLES'
  | 'CLEAR_PROMOS'
  | 'RESET_MASTER'
  | 'RESET_ALL'
  | 'LOAD_DEMO';

export const DataManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { settings, exportBackup } = useP2pSync();
  const { data: summary, isLoading: isSummaryLoading } = useDataSummary();

  const clearOrdersMutation = useClearOrders();
  const clearProductsMutation = useClearProductsAndStock();
  const clearTablesMutation = useClearTables();
  const clearPromosMutation = useClearDiscountsAndTaxes();
  const resetMasterMutation = useResetMasterDataToDefaults();
  const resetFullMutation = useResetFullDatabase();

  const [activeAction, setActiveAction] = useState<ClearActionType | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getActionDetails = (action: ClearActionType | null) => {
    switch (action) {
      case 'CLEAR_ORDERS':
        return {
          title: 'Hapus Semua Riwayat Transaksi',
          description:
            'Tindakan ini akan menghapus semua data pesanan, riwayat pembayaran kasir, dan laporan penjualan. Katalog produk dan pengaturan toko tetap aman.',
          requiredKeyword: 'HAPUS',
          badgeText: `${summary?.ordersCount ?? 0} Transaksi`,
          warning:
            'Data transaksi yang dihapus tidak dapat dipulihkan kecuali ada berkas cadangan.',
        };
      case 'CLEAR_PRODUCTS':
        return {
          title: 'Hapus Semua Produk & Riwayat Stok',
          description:
            'Tindakan ini akan menghapus seluruh katalog produk, varian harga, modifier, dan riwayat penyesuaian stok. Riwayat transaksi tetap aman.',
          requiredKeyword: 'HAPUS',
          badgeText: `${summary?.productsCount ?? 0} Produk`,
          warning: 'Pastikan Anda mengekspor data cadangan sebelum menghapus seluruh produk.',
        };
      case 'CLEAR_TABLES':
        return {
          title: 'Hapus Denah & Meja Toko',
          description:
            'Tindakan ini akan mengosongkan seluruh daftar meja dan tata letak denah toko.',
          requiredKeyword: 'HAPUS',
          badgeText: `${summary?.tablesCount ?? 0} Meja`,
          warning: 'Denah meja akan dihapus dari sistem kasir.',
        };
      case 'CLEAR_PROMOS':
        return {
          title: 'Hapus Master Diskon & Pajak',
          description:
            'Tindakan ini akan menghapus semua master diskon promo dan konfigurasi pajak kustom.',
          requiredKeyword: 'HAPUS',
          badgeText: `${(summary?.discountsCount ?? 0) + (summary?.taxesCount ?? 0)} Diskon & Pajak`,
          warning: 'Promo yang sedang aktif di kasir akan terhapus.',
        };
      case 'RESET_MASTER':
        return {
          title: 'Reset Master Data ke Standar',
          description:
            'Mengembalikan kategori, satuan, varian, modifier, promo diskon, pajak, dan meja ke template default.',
          requiredKeyword: 'RESET',
          badgeText: 'Template Standar',
          warning: 'Data master kustom Anda akan ditimpa dengan data standar Tookoo.',
        };
      case 'RESET_ALL':
        return {
          title: 'Reset Total Toko',
          description:
            'Tindakan ini akan MENGHAPUS SEMUA DATA di perangkat ini (transaksi, produk, meja, promo, pengaturan) dan mereset toko ke kondisi baru.',
          requiredKeyword: 'RESET TOTAL',
          badgeText: `${summary?.totalRecords ?? 0} Total Rekaman`,
          warning:
            'SEMUA DATA AKAN HILANG PERMANEN. Sangat disarankan untuk mengunduh berkas cadangan terlebih dahulu.',
        };
      case 'LOAD_DEMO':
        return {
          title: 'Muat Data Demo Toko Lengkap',
          description:
            'Tindakan ini akan mengisikan katalog kuliner Nusantara lengkap: produk dengan foto HD & varian, kategori, denah meja, data pelanggan, supplier vendor, pengeluaran kas, serta riwayat transaksi.',
          requiredKeyword: 'DEMO',
          badgeText: 'Siap Pakai',
          warning:
            'Data demo akan ditambahkan ke database sehingga seluruh fitur kasir, meja, dan analitik laporan dapat langsung diuji coba.',
        };
      default:
        return {
          title: '',
          description: '',
          requiredKeyword: '',
          badgeText: '',
          warning: '',
        };
    }
  };

  const handleStartAction = (action: ClearActionType) => {
    setActiveAction(action);
    setConfirmText('');
    setSuccessMessage(null);
  };

  const handleConfirmAction = () => {
    // If Owner PIN is set, open PIN modal first
    if (settings?.ownerPin) {
      setIsPinModalOpen(true);
    } else {
      executeAction();
    }
  };

  const executeAction = async () => {
    if (!activeAction) return;

    setIsProcessing(true);
    try {
      if (activeAction === 'CLEAR_ORDERS') {
        const res = await clearOrdersMutation.mutateAsync();
        setSuccessMessage(`Berhasil menghapus ${res.deletedCount} riwayat transaksi.`);
      } else if (activeAction === 'CLEAR_PRODUCTS') {
        const res = await clearProductsMutation.mutateAsync();
        setSuccessMessage(`Berhasil menghapus ${res.productsCount} produk & stok.`);
      } else if (activeAction === 'CLEAR_TABLES') {
        const res = await clearTablesMutation.mutateAsync();
        setSuccessMessage(`Berhasil mengosongkan ${res.deletedCount} meja.`);
      } else if (activeAction === 'CLEAR_PROMOS') {
        const res = await clearPromosMutation.mutateAsync();
        setSuccessMessage(
          `Berhasil menghapus ${res.discountsCount} diskon dan ${res.taxesCount} pajak.`
        );
      } else if (activeAction === 'RESET_MASTER') {
        await resetMasterMutation.mutateAsync();
        setSuccessMessage('Berhasil mereset master data ke template default.');
      } else if (activeAction === 'RESET_ALL') {
        await resetFullMutation.mutateAsync({
          newStoreName: 'Tookoo Store',
          reseedMasterDefaults: true,
        });
        setSuccessMessage('Toko berhasil direset ke kondisi awal.');
      } else if (activeAction === 'LOAD_DEMO') {
        await loadProfessionalDemoData();
        await queryClient.invalidateQueries();
        setSuccessMessage('Berhasil memuat data demo toko lengkap (Kopi & Resto Nusantara).');
      }

      sounds.playSuccess();
      setActiveAction(null);
      setConfirmText('');
    } catch {
      sounds.playAlert();
    } finally {
      setIsProcessing(false);
    }
  };

  const details = getActionDetails(activeAction);
  const isConfirmValid =
    confirmText.trim().toUpperCase() === details.requiredKeyword.trim().toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header Banner with Backup Action */}
      <Card className="border bg-card rounded-xl shadow-none">
        <CardHeader className="p-5 pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Pembersihan & Reset Basis Data Lokal
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Semua data aplikasi Tookoo tersimpan 100% aman di browser / memori perangkat ini
                  (IndexedDB).
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportBackup}
              className="gap-2 text-xs font-bold shrink-0 cursor-pointer"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>Unduh Berkas Cadangan</span>
            </Button>
          </div>
        </CardHeader>

        {/* Database Live Stats */}
        <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20">
          <div className="p-3 bg-card border rounded-lg">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Total Transaksi
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {isSummaryLoading ? '...' : (summary?.ordersCount ?? 0)}
            </span>
          </div>

          <div className="p-3 bg-card border rounded-lg">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Katalog Produk
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {isSummaryLoading ? '...' : (summary?.productsCount ?? 0)}
            </span>
          </div>

          <div className="p-3 bg-card border rounded-lg">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Meja & Denah
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {isSummaryLoading ? '...' : (summary?.tablesCount ?? 0)}
            </span>
          </div>

          <div className="p-3 bg-card border rounded-lg">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Total Rekaman Data
            </span>
            <span className="text-lg font-bold text-primary font-mono">
              {isSummaryLoading ? '...' : (summary?.totalRecords ?? 0)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccessMessage(null)}
            className="h-6 px-2 text-xs"
          >
            Tutup
          </Button>
        </div>
      )}

      {/* Demo Data Quick Load Card */}
      <Card className="border border-primary/30 bg-primary/5 rounded-xl shadow-none">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Data Demo Toko Lengkap</span>
                  <Badge
                    variant="default"
                    className="text-[10px] bg-primary text-primary-foreground font-bold"
                  >
                    Siap Pakai
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground pt-0.5">
                  Isi toko secara otomatis dengan menu kuliner Nusantara (kopi & resto), foto HD,
                  denah meja, pelanggan, vendor, pengeluaran kas, dan riwayat transaksi.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleStartAction('LOAD_DEMO')}
              disabled={isProcessing}
              className="gap-2 shrink-0 font-bold self-end sm:self-auto cursor-pointer"
            >
              {isProcessing && activeAction === 'LOAD_DEMO' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>Muat Data Demo</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Section 1: Granular Clear Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
          <span>Pilihan Pembersihan Spesifik</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Clear Orders */}
          <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Receipt className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-bold">Riwayat Transaksi & Struk</CardTitle>
                    <span className="text-[11px] text-muted-foreground block">
                      Kosongkan riwayat penjualan & laporan
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {summary?.ordersCount ?? 0} Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Cocok dilakukan setelah masa uji coba kasir atau pergantian buku tanpa menghapus
                katalog produk.
              </p>
            </CardContent>
            <CardFooter className="p-3 px-4 border-t bg-muted/20 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartAction('CLEAR_ORDERS')}
                disabled={summary?.ordersCount === 0}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30 cursor-pointer"
              >
                Hapus Transaksi
              </Button>
            </CardFooter>
          </Card>

          {/* 2. Clear Products & Stock */}
          <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-bold">Katalog Produk & Stok</CardTitle>
                    <span className="text-[11px] text-muted-foreground block">
                      Kosongkan produk & riwayat stok
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {summary?.productsCount ?? 0} Produk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Menghapus semua menu makanan/minuman dan produk retail. Riwayat transaksi tetap
                aman.
              </p>
            </CardContent>
            <CardFooter className="p-3 px-4 border-t bg-muted/20 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartAction('CLEAR_PRODUCTS')}
                disabled={summary?.productsCount === 0}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30 cursor-pointer"
              >
                Hapus Katalog Produk
              </Button>
            </CardFooter>
          </Card>

          {/* 3. Clear Tables */}
          <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-bold">Denah & Meja Toko</CardTitle>
                    <span className="text-[11px] text-muted-foreground block">
                      Kosongkan semua tata letak meja
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {summary?.tablesCount ?? 0} Meja
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Menghapus semua susunan meja restoran/kafe di denah kasir.
              </p>
            </CardContent>
            <CardFooter className="p-3 px-4 border-t bg-muted/20 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartAction('CLEAR_TABLES')}
                disabled={summary?.tablesCount === 0}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30 cursor-pointer"
              >
                Hapus Denah Meja
              </Button>
            </CardFooter>
          </Card>

          {/* 4. Reset Master Data to Defaults */}
          <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-bold">Master Data & Template</CardTitle>
                    <span className="text-[11px] text-muted-foreground block">
                      Pulihkan template standar Tookoo
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Template
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Mereset kategori, satuan produk, varian, modifier, diskon, dan pajak ke template
                bawaan.
              </p>
            </CardContent>
            <CardFooter className="p-3 px-4 border-t bg-muted/20 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartAction('RESET_MASTER')}
                className="text-xs font-bold text-primary hover:bg-primary/10 border-primary/30 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset ke Standar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Section 2: Danger Zone (Full Factory Reset) */}
      <Card className="border border-destructive/40 bg-destructive/5 rounded-xl shadow-none">
        <CardHeader className="p-5 pb-3 border-b border-destructive/20">
          <div className="flex items-center gap-2.5 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <div>
              <CardTitle className="text-sm font-bold">Zona Bahaya</CardTitle>
              <CardDescription className="text-xs text-destructive/80 mt-0.5">
                Tindakan tidak dapat dibatalkan. Pastikan Anda telah mengunduh berkas cadangan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground">Reset Total Toko</h4>
            <p className="text-[11px] text-muted-foreground">
              Menghapus seluruh data IndexedDB (transaksi, produk, meja, promo, dan profil toko) dan
              mengembalikan aplikasi ke kondisi toko baru.
            </p>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleStartAction('RESET_ALL')}
            className="text-xs font-bold shrink-0 gap-1.5 cursor-pointer shadow-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Reset Total Toko</span>
          </Button>
        </CardContent>
      </Card>

      {/* Double Confirmation Dialog */}
      <Dialog open={activeAction !== null} onOpenChange={(open) => !open && setActiveAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-base font-bold text-foreground">
                {details.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {details.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs space-y-1">
              <span className="font-bold block">Peringatan:</span>
              <p className="text-[11px]">{details.warning}</p>
            </div>

            <Field>
              <FieldLabel htmlFor="data-confirm-keyword" className="text-xs font-semibold text-foreground">
                Ketik kata{' '}
                <span className="font-mono font-bold text-destructive underline mx-1">
                  {details.requiredKeyword}
                </span>{' '}
                untuk mengonfirmasi:
              </FieldLabel>
              <Input
                id="data-confirm-keyword"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Ketik "${details.requiredKeyword}"`}
                className="h-9 text-xs font-mono"
                autoFocus
              />
            </Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAction(null)}
              disabled={isProcessing}
              className="text-xs"
            >
              {t('common.actions.cancel', 'Batal')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmAction}
              disabled={!isConfirmValid || isProcessing}
              className="text-xs font-bold gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Konfirmasi & Hapus Data</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Owner PIN Verification Modal */}
      <PinModal
        open={isPinModalOpen}
        onOpenChange={setIsPinModalOpen}
        correctPin={settings?.ownerPin}
        title="Otorisasi Pemilik Toko"
        description="Masukkan PIN Pemilik untuk mengesahkan tindakan pembersihan data."
        onSuccess={() => {
          setIsPinModalOpen(false);
          executeAction();
        }}
      />
    </div>
  );
};

export default DataManagementSection;
