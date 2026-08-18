import React, { useState } from 'react';
import {
  QrCode,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Monitor,
  User,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { QrScannerModal } from '@/features/sync/components/qr-scanner-modal';
import { normalizePassphrase, validatePassphrase } from '@/lib/passphrase';
import { db } from '@/lib/db';
import { sounds } from '@/utils/audio';
import { useAuthStore } from '@/stores/auth-store';
import type { StorePairingPayload } from '@/types/sync.types';
import type { StoreSettings } from '@/types/store.types';

interface JoinStoreWizardProps {
  initialSettings?: StoreSettings | null;
  onComplete: () => void;
  onBackToWelcome: () => void;
}

export const JoinStoreWizard: React.FC<JoinStoreWizardProps> = ({
  initialSettings,
  onComplete,
  onBackToWelcome,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'passphrase'>('qr');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [storeNameInput, setStoreNameInput] = useState('');
  const [deviceName, setDeviceName] = useState('Kasir 2 (Terminal)');
  const [cashierName, setCashierName] = useState('Kasir Cabang');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedPayload, setScannedPayload] = useState<StorePairingPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle successful QR scan
  const handleQrPairSuccess = (payload: StorePairingPayload) => {
    setScannedPayload(payload);
    setStoreNameInput(payload.storeName || 'Toko Tookoo');
    setPassphraseInput(payload.passphrase);
    setIsScannerOpen(false);
    sounds.playSuccess();
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePassphrase(passphraseInput);

    if (!validatePassphrase(normalized)) {
      setErrorMessage('Kata kunci toko harus terdiri dari 12 kata yang valid.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const now = Date.now();
      const currentSettings = (await db.settings.toCollection().first()) || initialSettings;

      const finalStoreName =
        scannedPayload?.storeName || storeNameInput.trim() || 'Toko Terhubung';
      const finalSecretKey = scannedPayload?.storeSecretKey || currentSettings?.storeSecretKey || '';

      const updatedSettings: StoreSettings = {
        id: currentSettings?.id || crypto.randomUUID(),
        storeName: finalStoreName,
        deviceName: deviceName.trim() || 'Terminal Kasir',
        defaultCashier: cashierName.trim() || 'Kasir',
        appMode: 'SIMPLE',
        activeRole: 'CASHIER', // Staff / Cashier role
        passphrase: normalized,
        storeSecretKey: finalSecretKey,
        soundEnabled: true,
        autoPrint: false,
        isSetupComplete: true,
        createdAt: currentSettings?.createdAt || now,
        updatedAt: now,
        deletedAt: null,
      };

      await db.settings.put(updatedSettings);

      // Set auth role to cashier
      useAuthStore.getState().setRole('CASHIER');

      sounds.playSuccess();
      onComplete();
    } catch (err) {
      console.error('Failed to join store:', err);
      setErrorMessage('Gagal bergabung ke toko. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Info */}
      <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
        <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
          <QrCode className="h-4 w-4 text-primary" />
          <span>Sambungkan Terminal ke Toko Utama</span>
        </h3>
        <p className="text-xs text-muted-foreground">
          Gunakan perangkat ini sebagai kasir tambahan, tablet pesanan pelayan, atau kasir cabang.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs: Scan QR vs 12 Words */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'qr' | 'passphrase')}
        className="w-full flex-1 flex flex-col min-h-0"
      >
        <TabsList className="grid grid-cols-2 h-9 p-1">
          <TabsTrigger value="qr" className="text-xs font-bold gap-1.5">
            <QrCode className="h-3.5 w-3.5" />
            <span>Scan QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="passphrase" className="text-xs font-bold gap-1.5">
            <KeyRound className="h-3.5 w-3.5" />
            <span>12 Kata Kunci</span>
          </TabsTrigger>
        </TabsList>

        <form
          onSubmit={handleJoinSubmit}
          className="flex-1 flex flex-col justify-between space-y-4 pt-3 min-h-0 overflow-y-auto"
        >
          {/* Tab 1: QR Code Scanner */}
          <TabsContent value="qr" className="mt-0 space-y-3">
            {scannedPayload ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>QR Berhasil Terpindai!</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setScannedPayload(null);
                      setPassphraseInput('');
                    }}
                    className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Scan Ulang
                  </Button>
                </div>
                <p className="text-xs font-extrabold text-foreground">
                  Toko: {scannedPayload.storeName}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">
                  Kunci: {scannedPayload.passphrase}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-card text-center space-y-3">
                <QrCode className="h-10 w-10 text-primary/70 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    Buka Menu &ldquo;Sinkronisasi & Kunci&rdquo; di HP/Tablet Utama
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Arahkan kamera perangkat ini ke QR Code yang tampil di layar toko utama.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="gap-1.5 font-bold text-xs cursor-pointer shadow-xs"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Buka Kamera Scanner</span>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Manual 12 Words Passphrase */}
          <TabsContent value="passphrase" className="mt-0 space-y-3">
            <Field>
              <FieldLabel className="text-xs font-bold">
                12 Kata Kunci Toko (Passphrase) *
              </FieldLabel>
              <Input
                placeholder="Contoh: ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber"
                value={passphraseInput}
                onChange={(e) => {
                  setPassphraseInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="h-9 text-xs font-mono"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Dapat dilihat pada menu Sinkronisasi toko utama.
              </p>
            </Field>

            <Field>
              <FieldLabel className="text-xs font-bold">Nama Toko (Opsional)</FieldLabel>
              <Input
                placeholder="Contoh: Kedai Kopi Senja"
                value={storeNameInput}
                onChange={(e) => setStoreNameInput(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>
          </TabsContent>

          {/* Terminal Identity fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
            <Field>
              <FieldLabel className="text-xs font-bold flex items-center gap-1">
                <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Perangkat Ini</span>
              </FieldLabel>
              <Input
                placeholder="Contoh: Kasir 2, Tablet Waiter"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-bold flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Kasir / Staff</span>
              </FieldLabel>
              <Input
                placeholder="Contoh: Siti, Kasir 2"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-3 border-t mt-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBackToWelcome}
              className="text-xs cursor-pointer gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !passphraseInput.trim()}
              className="text-xs font-bold gap-1.5 cursor-pointer shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Gabung & Sinkronkan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>

      {/* QR Scanner Camera Modal */}
      <QrScannerModal
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onPairSuccess={handleQrPairSuccess}
      />
    </div>
  );
};
