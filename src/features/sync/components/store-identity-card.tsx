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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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
  const [storeName, setStoreName] = useState(settings?.storeName || 'Toko Saya');
  const [deviceName, setDeviceName] = useState(settings?.deviceName || 'Kasir Utama');
  const [copiedPassphrase, setCopiedPassphrase] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(true);

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

  const pairingPayload: StorePairingPayload = {
    storeId: settings?.id || 'default-store',
    storeName: settings?.storeName || 'Toko Saya',
    passphrase: settings?.passphrase || '',
    timestamp: Date.now(),
  };
  const payloadString = JSON.stringify(pairingPayload);

  return (
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
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-primary" />
              <span>
                {t(
                  'sync.storeIdentity.passphraseLabel',
                  'Kunci Keamanan Toko (12 Kata Mnemonic)'
                )}
              </span>
            </label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                title={showPassphrase ? 'Sembunyikan Kata Kunci' : 'Tampilkan Kata Kunci'}
              >
                {showPassphrase ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showPassphrase ? 'Sembunyikan' : 'Tampilkan'}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRegeneratePassphrase}
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Ganti Kunci Baru</span>
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl border border-border/80 font-mono text-xs text-foreground tracking-wide leading-relaxed break-words select-all">
            {showPassphrase
              ? settings?.passphrase || t('common.states.loading', 'Memuat...')
              : '•••••••• •••••••• •••••••• •••••••• •••••••• •••••••• •••••••• •••••••• •••••••• •••••••• •••••••• ••••••••'}
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

        {/* QR Code Toko Saat Ini (Expandable / Inline) */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <QrCode className="h-3.5 w-3.5 text-primary" />
              <span>Kode QR Toko Saat Ini</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowQr(!showQr)}
              className="h-6 px-2 text-xs font-medium text-primary hover:text-primary/80 cursor-pointer"
            >
              {showQr ? 'Tutup Kode QR' : 'Tampilkan Kode QR'}
            </Button>
          </div>

          {showQr && (
            <div className="mt-3 p-4 bg-muted/30 rounded-xl border border-border/80 flex flex-col items-center justify-center space-y-2.5">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-border flex items-center justify-center">
                <QRCodeSVG value={payloadString} size={160} level="M" includeMargin={false} />
              </div>
              <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                Arahkan kamera HP kasir baru ke kode QR ini untuk menghubungkan perangkat ke toko ini secara instan.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreIdentityCard;
