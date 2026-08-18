import React, { useState } from 'react';
import { Zap, Rocket, CheckCircle2, ChevronDown, Info, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppMode } from '@/hooks/use-app-mode';
import { cn } from '@/lib/cn';
import type { AppMode } from '@/types/store.types';

interface AppModeSwitcherProps {
  variant?: 'header' | 'inline' | 'sidebar';
  className?: string;
}

export const AppModeSwitcher: React.FC<AppModeSwitcherProps> = ({
  variant = 'header',
  className,
}) => {
  useTranslation();
  const { appMode, isSimple, isAdvanced, setAppMode, isUpdating } = useAppMode();
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedTargetMode, setSelectedTargetMode] = useState<AppMode>(appMode);

  const handleSelectMode = async (mode: AppMode) => {
    if (mode !== appMode) {
      await setAppMode(mode);
    }
  };

  const handleOpenGuide = (target: AppMode) => {
    setSelectedTargetMode(target);
    setIsGuideModalOpen(true);
  };

  const handleConfirmSwitchFromModal = async () => {
    await setAppMode(selectedTargetMode);
    setIsGuideModalOpen(false);
  };

  // 1. INLINE VARIANT (Used on Settings Page Card)
  if (variant === 'inline') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
        {/* Mode Sederhana Option Card */}
        <div
          onClick={() => handleSelectMode('SIMPLE')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-3',
            isSimple
              ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/5 shadow-xs'
              : 'border-border/60 bg-card hover:border-amber-500/40 hover:bg-muted/30'
          )}
        >
          {isSimple && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Aktif</span>
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 fill-amber-500/30" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Mode Sederhana (Lite)</h3>
                <p className="text-xs text-muted-foreground">Cepat, praktis, dan tanpa ribet</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Didesain khusus untuk kasir cepat, warung, toko kelontong, dan UMKM yang mengutamakan
              kecepatan jualan langsung tanpa opsi varian bertingkat.
            </p>

            <ul className="space-y-1.5 pt-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Kasir 1-klik langsung masuk keranjang</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Katalog produk 1 halaman instan</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Menu ringkas: Kasir, Produk, Riwayat, Pengaturan</span>
              </li>
            </ul>
          </div>

          <Button
            size="sm"
            variant={isSimple ? 'default' : 'outline'}
            disabled={isUpdating}
            className={cn(
              'w-full text-xs font-bold gap-1.5 cursor-pointer mt-2',
              isSimple && 'bg-amber-500 hover:bg-amber-600 text-white'
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{isSimple ? 'Mode Sederhana Sedang Aktif' : 'Pilih Mode Sederhana'}</span>
          </Button>
        </div>

        {/* Mode Lanjutan Option Card */}
        <div
          onClick={() => handleSelectMode('ADVANCED')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-3',
            isAdvanced
              ? 'border-primary bg-primary/10 dark:bg-primary/5 shadow-xs'
              : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30'
          )}
        >
          {isAdvanced && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold text-[10px] px-2 py-0.5 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Aktif</span>
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Mode Lanjutan (Pro)</h3>
                <p className="text-xs text-muted-foreground">Fitur lengkap bisnis & F&B modern</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Manajemen komprehensif untuk kafe, restoran, retail modern, dan multi-cabang dengan
              denah meja, varian rasa/ukuran, dan analitik lengkap.
            </p>

            <ul className="space-y-1.5 pt-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Denah Meja Kanvas Interaktif (Snap-to-Grid)</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Varian Multi-Dimensi & Grup Modifier Topping</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Laporan Analitik, Mutasi Stok, P2P Mesh</span>
              </li>
            </ul>
          </div>

          <Button
            size="sm"
            variant={isAdvanced ? 'default' : 'outline'}
            disabled={isUpdating}
            className="w-full text-xs font-bold gap-1.5 cursor-pointer mt-2"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>{isAdvanced ? 'Mode Lanjutan Sedang Aktif' : 'Pilih Mode Lanjutan'}</span>
          </Button>
        </div>
      </div>
    );
  }

  // 2. SIDEBAR VARIANT (Placed in Sidebar Footer)
  if (variant === 'sidebar') {
    return (
      <div
        className={cn(
          'p-2.5 rounded-xl border flex items-center justify-between gap-2 bg-card/80 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
              isSimple
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-primary/15 text-primary'
            )}
          >
            {isSimple ? <Zap className="h-3.5 w-3.5" /> : <Rocket className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-foreground truncate block">
              {isSimple ? 'Mode Sederhana' : 'Mode Lanjutan (Pro)'}
            </span>
            <span className="text-[9px] text-muted-foreground block">Klik untuk ganti</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenGuide(isSimple ? 'ADVANCED' : 'SIMPLE')}
          className="h-6 px-2 text-[10px] font-bold cursor-pointer shrink-0"
        >
          Ganti
        </Button>

        {/* Modal Switch Guide */}
        <Dialog open={isGuideModalOpen} onOpenChange={setIsGuideModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {selectedTargetMode === 'ADVANCED' ? (
                  <>
                    <Rocket className="h-5 w-5 text-primary" />
                    <span>Beralih ke Mode Lanjutan (Pro)?</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span>Beralih ke Mode Sederhana (Lite)?</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedTargetMode === 'ADVANCED'
                  ? 'Mode Lanjutan membuka fitur Denah Meja, Varian & Modifier rasa/ukuran, Multi-UOM, dan Analitik penjualan mendalam.'
                  : 'Mode Sederhana menyederhanakan antarmuka menjadi 4 menu utama dengan alur kasir cepat tanpa kebingungan fitur.'}
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-muted/40 rounded-xl border flex items-center gap-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="font-semibold text-foreground">
                Data toko & produk Anda tetap 100% aman dan tidak akan hilang saat berganti mode.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGuideModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSwitchFromModal}
                className={cn(
                  'text-xs font-bold gap-1.5 cursor-pointer',
                  selectedTargetMode === 'SIMPLE'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                )}
              >
                {selectedTargetMode === 'SIMPLE' ? (
                  <Zap className="h-3.5 w-3.5" />
                ) : (
                  <Rocket className="h-3.5 w-3.5" />
                )}
                <span>
                  Ganti ke {selectedTargetMode === 'SIMPLE' ? 'Mode Sederhana' : 'Mode Lanjutan'}
                </span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // 3. HEADER VARIANT (Compact Pill Dropdown in Top Header Bar)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 px-2.5 gap-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs border',
              isSimple
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20',
              className
            )}
          >
            {isSimple ? (
              <Zap className="h-3.5 w-3.5 fill-amber-500/30 shrink-0" />
            ) : (
              <Rocket className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {isSimple ? 'Mode Sederhana' : 'Mode Lanjutan'}
            </span>
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-1.5">
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
            Pilih Mode Aplikasi
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Option: Mode Sederhana */}
          <DropdownMenuItem
            onClick={() => handleSelectMode('SIMPLE')}
            className={cn(
              'flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer',
              isSimple && 'bg-amber-500/10 font-bold text-amber-700 dark:text-amber-300'
            )}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <div>
                <span className="block font-bold">Mode Sederhana</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Kasir cepat & ringkas
                </span>
              </div>
            </div>
            {isSimple && <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />}
          </DropdownMenuItem>

          {/* Option: Mode Lanjutan */}
          <DropdownMenuItem
            onClick={() => handleSelectMode('ADVANCED')}
            className={cn(
              'flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer',
              isAdvanced && 'bg-primary/10 font-bold text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              <div>
                <span className="block font-bold">Mode Lanjutan</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Fitur lengkap & Meja
                </span>
              </div>
            </div>
            {isAdvanced && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleOpenGuide(isSimple ? 'ADVANCED' : 'SIMPLE')}
            className="gap-2 text-[11px] text-muted-foreground cursor-pointer px-2 py-1.5"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Lihat Panduan Perbedaan Mode</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Guide Dialog */}
      <Dialog open={isGuideModalOpen} onOpenChange={setIsGuideModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {selectedTargetMode === 'ADVANCED' ? (
                <>
                  <Rocket className="h-5 w-5 text-primary" />
                  <span>Beralih ke Mode Lanjutan (Pro)?</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span>Beralih ke Mode Sederhana (Lite)?</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedTargetMode === 'ADVANCED'
                ? 'Mode Lanjutan membuka fitur Denah Meja, Varian & Modifier rasa/ukuran, Multi-UOM, dan Analitik penjualan mendalam.'
                : 'Mode Sederhana menyederhanakan antarmuka menjadi 4 menu utama dengan alur kasir cepat tanpa kebingungan fitur.'}
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted/40 rounded-xl border flex items-center gap-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <p className="font-semibold text-foreground">
              Data toko & produk Anda tetap 100% aman dan tidak akan hilang saat berganti mode.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGuideModalOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSwitchFromModal}
              className={cn(
                'text-xs font-bold gap-1.5 cursor-pointer',
                selectedTargetMode === 'SIMPLE'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              )}
            >
              {selectedTargetMode === 'SIMPLE' ? (
                <Zap className="h-3.5 w-3.5" />
              ) : (
                <Rocket className="h-3.5 w-3.5" />
              )}
              <span>
                Ganti ke {selectedTargetMode === 'SIMPLE' ? 'Mode Sederhana' : 'Mode Lanjutan'}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppModeSwitcher;
