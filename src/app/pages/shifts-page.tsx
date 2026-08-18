import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Sparkles,
  ArrowRight,
  Calculator,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ShiftsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 p-6 md:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1.5 px-2.5 py-0.5 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Segera Hadir (Coming Soon)</span>
            </Badge>
            <Badge variant="outline" className="text-xs font-semibold">
              Fase Rilis v1.2
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            Shift Kasir & Manajemen Uang Laci
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Kontrol penuh atas uang fisik di laci kasir, serah terima shift antar staf, modal kas
            awal, pencatatan kas masuk/keluar, dan audit selisih kas harian secara otomatis.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate('/')} className="gap-2 font-bold shadow-xs">
              <span>Kembali ke Terminal Kasir</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Background decorative watermark */}
        <Clock className="absolute -right-6 -bottom-6 h-56 w-56 text-primary/10 pointer-events-none" />
      </div>

      {/* Feature Teasers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Buka & Tutup Shift */}
        <Card className="p-5 flex flex-col justify-between border-border/80 relative overflow-hidden">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Buka & Tutup Shift</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Catat modal kas awal saat shift dimulai dan input penghitungan fisik uang tunai saat
                toko tutup atau pergantian kasir.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Rekapitulasi X & Z Report</span>
          </div>
        </Card>

        {/* Card 2: Kas Masuk & Kas Keluar */}
        <Card className="p-5 flex flex-col justify-between border-border/80 relative overflow-hidden">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Kas Masuk & Kas Keluar</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Dokumentasikan uang keluar cepat untuk kebutuhan dadakan (beli es batu, galon, dll)
                agar saldo akhir laci tetap cocok.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Audit Otomatis Selisih Kas</span>
          </div>
        </Card>

        {/* Card 3: Serah Terima & Multi-Kasir */}
        <Card className="p-5 flex flex-col justify-between border-border/80 relative overflow-hidden">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Serah Terima Staf</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Mendukung toko dengan banyak kasir bergantian (Shift Pagi & Malam) dengan cetak nota
                serah terima resmi.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Otorisasi PIN Pemilik</span>
          </div>
        </Card>
      </div>

      {/* Note about current state */}
      <Card className="p-4 bg-muted/40 border-border/60 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">
            Operasional Kasir Saat Ini Berjalan Normal
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Saat ini Tookoo menggunakan sistem rekapitulasi harian otomatis. Anda tetap dapat
            bertransaksi dan melihat seluruh laporan omzet penjualan tanpa hambatan.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ShiftsPage;
