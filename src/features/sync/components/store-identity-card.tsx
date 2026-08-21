import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  Store,
  Key,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Share2,
  QrCode,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/stores/auth-store';
import type { StoreSettings } from '@/types/store.types';
import type { StorePairingPayload } from '@/types/sync.types';

interface StoreIdentityCardProps {
  settings?: StoreSettings;
  onUpdateStoreName: (name: string) => void;
  onUpdateDeviceName?: (deviceName: string) => void;
  onRegeneratePassphrase: () => void;
}

export const StoreIdentityCard: React.FC<StoreIdentityCardProps> = ({
  settings,
  onUpdateStoreName,
  onUpdateDeviceName,
  onRegeneratePassphrase,
}) => {
  const { t } = useTranslation();
  const currentRole = useAuthStore((state) => state.currentRole);
  const canManageKeys = currentRole === 'OWNER' || currentRole === 'MANAGER';

  const [storeName, setStoreName] = useState(settings?.storeName || 'Toko Saya');
  const [deviceName, setDeviceName] = useState(settings?.deviceName || 'Kasir Utama');
  const [copiedPassphrase, setCopiedPassphrase] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || 'Toko Saya');
      setDeviceName(settings.deviceName || 'Kasir Utama');
    }
  }, [settings]);

  const handleSaveStoreName = () => {
    if (storeName.trim()) {
      onUpdateStoreName(storeName.trim());
    }
  };

  const handleSaveDeviceName = () => {
    if (deviceName.trim() && onUpdateDeviceName) {
      onUpdateDeviceName(deviceName.trim());
    }
  };

  const handleCopyPassphrase = () => {
    if (settings?.passphrase) {
      navigator.clipboard.writeText(settings.passphrase);
      setCopiedPassphrase(true);
      setTimeout(() => setCopiedPassphrase(false), 2000);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined' && settings?.passphrase) {
      const baseUrl = window.location.origin;
      const pairUrl = `${baseUrl}/sync?pair=${encodeURIComponent(settings.passphrase)}&store=${encodeURIComponent(settings.storeName || 'Toko Saya')}`;
      navigator.clipboard.writeText(pairUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleConfirmRegenerate = () => {
    setConfirmRegenerateOpen(false);
    onRegeneratePassphrase();
  };

  const pairingPayload: StorePairingPayload = {
    storeId: settings?.id || 'default-store',
    storeName: settings?.storeName || 'Toko Saya',
    passphrase: settings?.passphrase || '',
    timestamp: Date.now(),
  };
  const payloadString = JSON.stringify(pairingPayload);

  return (
    <>
      <Card className="border-border/80 shadow-none">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                {t('sync.storeIdentity.title', 'Informasi Toko & Kunci Keamanan')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t(
                  'sync.storeIdentity.desc',
                  'Identitas toko dan 12 kata kunci rahasia untuk menghubungkan perangkat kasir Anda.'
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-4">
          {/* Store Name & Device Name Fields */}
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="sync-store-name">
                {t('sync.storeIdentity.nameLabel', 'Nama Toko')}
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="sync-store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Toko Kopi Senja"
                  className="h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveStoreName}
                  className="h-9 px-3 text-xs shrink-0 cursor-pointer"
                >
                  Simpan Nama Toko
                </Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="sync-device-name" className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-primary" />
                <span>{t('sync.storeIdentity.deviceLabel', 'Nama Perangkat Ini')}</span>
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="sync-device-name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Contoh: Laptop Kasir Utama / HP Kasir 1"
                  className="h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDeviceName}
                  className="h-9 px-3 text-xs shrink-0 cursor-pointer"
                >
                  Simpan Nama Perangkat
                </Button>
              </div>
            </Field>
          </FieldGroup>

          {/* 12-Word Passphrase Box */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  <span>Kunci Keamanan Toko</span>
                </FieldLabel>
                <FieldDescription>
                  Gunakan 12 kata kunci rahasia ini untuk menyambungkan perangkat kasir baru secara
                  manual.
                </FieldDescription>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                  title={showPassphrase ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassphrase ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassphrase ? 'Sembunyikan' : 'Tampilkan'}</span>
                </Button>
                {canManageKeys && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmRegenerateOpen(true)}
                    className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-destructive gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Ganti Kunci Baru</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl border border-border/80 font-mono text-xs text-foreground tracking-wide leading-relaxed break-words overflow-hidden">
              <span
                className={`inline-block transition-all duration-300 ${
                  showPassphrase
                    ? 'blur-none select-all'
                    : 'blur-[5px] select-none opacity-60 pointer-events-none'
                }`}
              >
                {settings?.passphrase || t('common.states.loading', 'Memuat...')}
              </span>
            </div>

            {/* Action Buttons for Passphrase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPassphrase}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                {copiedPassphrase ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      12 Kata Tersalin!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Salin 12 Kata Kunci</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyShareLink}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Tautan Toko Tersalin!
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Salin Tautan Toko</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* QR Code Keamanan Toko */}
          <div className="pt-2 border-t">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  <span>Kode QR Keamanan Toko</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pindai kode QR ini dari HP atau tablet kasir lain untuk terhubung otomatis.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQr(!showQr)}
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer shrink-0 ml-2"
                title={showQr ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showQr ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showQr ? 'Sembunyikan' : 'Tampilkan'}</span>
              </Button>
            </div>

            {showQr && (
              <div className="mt-3 p-4 bg-muted/30 rounded-xl border border-border/80 flex flex-col items-center justify-center space-y-2.5">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-border flex items-center justify-center">
                  <QRCodeSVG value={payloadString} size={160} level="M" includeMargin={false} />
                </div>
                <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                  Arahkan kamera HP kasir baru ke kode QR ini untuk menghubungkan perangkat ke toko
                  ini secara instan.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal Alert for Regenerating Passphrase */}
      <AlertDialog open={confirmRegenerateOpen} onOpenChange={setConfirmRegenerateOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold">
                Ganti Kunci Keamanan Toko?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground mt-1">
                Mengganti 12 kata kunci akan{' '}
                <strong>memutuskan sambungan seluruh perangkat kasir lain</strong> yang saat ini
                terhubung. Semua perangkat kasir harus dihubungkan ulang dengan kunci baru.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
            <AlertDialogCancel
              onClick={() => setConfirmRegenerateOpen(false)}
              className="cursor-pointer"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRegenerate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold cursor-pointer"
            >
              Ya, Ganti Kunci Baru
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StoreIdentityCard;
