import React, { useState } from 'react';
import { Store, QrCode, Sparkles, ArrowRight, ShieldCheck, Zap, WifiOff } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateStoreWizard } from './create-store-wizard';
import { JoinStoreWizard } from './join-store-wizard';
import { db } from '@/lib/db';
import { sounds } from '@/utils/audio';
import type { StoreSettings } from '@/types/store.types';

interface WelcomeOnboardingDialogProps {
  forceOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const WelcomeOnboardingDialog: React.FC<WelcomeOnboardingDialogProps> = ({
  forceOpen,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'CHOICE' | 'CREATE' | 'JOIN'>('CHOICE');

  // Fetch Store Settings
  const { data: settings, isLoading } = useQuery<StoreSettings | null>({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  // Modal is open if forced or if settings.isSetupComplete is false
  const isOpen =
    forceOpen !== undefined
      ? forceOpen
      : !isLoading && Boolean(settings) && settings?.isSetupComplete === false;

  const handleComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    setView('CHOICE');
    onOpenChange?.(false);
  };

  const handleQuickDemo = async () => {
    const current = (await db.settings.toCollection().first()) || settings;
    if (current) {
      await db.settings.update(current.id, {
        isSetupComplete: true,
        updatedAt: Date.now(),
      });
    }
    sounds.playSuccess();
    handleComplete();
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (forceOpen) {
          onOpenChange?.(open);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-xl h-[90vh] max-h-[620px] min-h-[480px] flex flex-col p-0 gap-0 overflow-hidden border-border/80 shadow-2xl"
        onPointerDownOutside={(e) => {
          if (!forceOpen) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!forceOpen) e.preventDefault();
        }}
      >
        {/* Header Branding */}
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card/90 backdrop-blur-sm flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-sm">
              T
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold tracking-tight flex items-center gap-2">
                <span>Selamat Datang di Tookoo</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 font-bold"
                >
                  Offline-First POS
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Aplikasi Kasir Cerdas & Cepat Tanpa Ketergantungan Server
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Dynamic Content Views */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-background/50">
          {view === 'CHOICE' && (
            <div className="flex flex-col h-full justify-between space-y-5 animate-in fade-in duration-200">
              {/* Highlight Banner */}
              <div className="space-y-1 text-center py-1">
                <h2 className="text-lg font-black tracking-tight text-foreground">
                  Bagaimana Anda Ingin Memulai?
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Pilih untuk membuat toko baru atau gabungkan perangkat ini sebagai kasir tambahan
                  ke toko yang sudah ada.
                </p>
              </div>

              {/* Two Main Pathway Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Option 1: Buat Toko Baru (Sign Up / New Store) */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setView('CREATE');
                  }}
                  className="group relative p-5 rounded-2xl border-2 border-border/80 bg-card hover:border-primary/80 hover:bg-primary/5 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-foreground">Buka Toko Baru</h3>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                        >
                          Pemilik
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Mulai usaha baru, tentukan nama toko, jenis usaha, dan siapkan katalog
                        produk siap jual.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-bold text-primary gap-1 group-hover:translate-x-1 transition-transform pt-2 border-t border-border/50">
                    <span>Mulai Buka Toko</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Option 2: Gabung ke Toko (Sign In / Join Store) */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setView('JOIN');
                  }}
                  className="group relative p-5 rounded-2xl border-2 border-border/80 bg-card hover:border-primary/80 hover:bg-primary/5 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-foreground">Gabung ke Toko</h3>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 bg-primary/10 text-primary font-bold"
                        >
                          Staff / Kasir
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Sambungkan HP / tablet ini sebagai kasir ke-2 atau perangkat waiter via Scan
                        QR atau kata kunci.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-bold text-primary gap-1 group-hover:translate-x-1 transition-transform pt-2 border-t border-border/50">
                    <span>Sambungkan Terminal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              </div>

              {/* Value Props & Quick Skip */}
              <div className="pt-2 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-3.5 w-3.5 text-emerald-500" />
                    <span>100% Offline</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Data Tersimpan di HP/PC</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Cepat Tanpa Lemot</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleQuickDemo}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer h-7"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Lewati & Coba Langsung</span>
                </Button>
              </div>
            </div>
          )}

          {view === 'CREATE' && (
            <CreateStoreWizard
              initialSettings={settings}
              onComplete={handleComplete}
              onBackToWelcome={() => setView('CHOICE')}
            />
          )}

          {view === 'JOIN' && (
            <JoinStoreWizard
              initialSettings={settings}
              onComplete={handleComplete}
              onBackToWelcome={() => setView('CHOICE')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeOnboardingDialog;
