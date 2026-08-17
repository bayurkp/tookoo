import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Key, Copy, Check, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StoreSettings } from '@/types/store.types';

interface StoreIdentityCardProps {
  settings?: StoreSettings;
  onUpdateStoreName: (name: string) => void;
  onRegeneratePassphrase: () => void;
}

export const StoreIdentityCard: React.FC<StoreIdentityCardProps> = ({
  settings,
  onUpdateStoreName,
  onRegeneratePassphrase,
}) => {
  const { t } = useTranslation();
  const [storeName, setStoreName] = useState(settings?.storeName || 'Toko Saya');
  const [copied, setCopied] = useState(false);

  const handleSaveName = () => {
    if (storeName.trim()) {
      onUpdateStoreName(storeName.trim());
    }
  };

  const handleCopyPassphrase = () => {
    if (settings?.passphrase) {
      navigator.clipboard.writeText(settings.passphrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              {t('sync.storeIdentity.title', 'Identitas Toko & Kunci Rahasia')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t(
                'sync.storeIdentity.desc',
                'Kredensial lokal untuk pairing antar terminal kasir tanpa server.'
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {/* Store Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            {t('sync.storeIdentity.nameLabel', 'Nama Toko')}
          </label>
          <div className="flex gap-2">
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Contoh: Toko Kopi Senja"
              className="h-9 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveName}
              className="h-9 px-3 text-xs cursor-pointer"
            >
              {t('common.actions.save', 'Simpan')}
            </Button>
          </div>
        </div>

        {/* 12-Word Passphrase */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-primary" />
              <span>
                {t(
                  'sync.storeIdentity.passphraseLabel',
                  '12 Kata Kunci Rahasia (BIP-39 Passphrase)'
                )}
              </span>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRegeneratePassphrase}
              className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>{t('sync.storeIdentity.regenerate', 'Acak Ulang')}</span>
            </Button>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl border border-border/80 font-mono text-xs text-foreground tracking-wide leading-relaxed break-words select-all">
            {settings?.passphrase || t('common.states.loading', 'Memuat...')}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyPassphrase}
            className="w-full h-8 text-xs gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {t('sync.storeIdentity.copied', 'Tersalin ke Clipboard!')}
                </span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t('sync.storeIdentity.copy', 'Salin 12 Kata Rahasia')}</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
