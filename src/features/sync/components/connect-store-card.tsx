import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validatePassphrase } from '@/lib/passphrase';
import type { StorePairingPayload } from '@/types/sync.types';

interface ConnectStoreCardProps {
  onPairSuccess: (payload: StorePairingPayload) => void;
  onOpenScanner: () => void;
}

export const ConnectStoreCard: React.FC<ConnectStoreCardProps> = ({
  onPairSuccess,
  onOpenScanner,
}) => {
  const { t } = useTranslation();
  const [passphraseInput, setPassphraseInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const words = passphraseInput.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isComplete = wordCount === 12;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPassphrase = words.join(' ');
    if (!validatePassphrase(cleanPassphrase)) {
      setErrorMsg(
        '12 kata kunci tidak valid. Pastikan semua kata diketik dengan benar dan dipisahkan spasi.'
      );
      return;
    }

    onPairSuccess({
      storeId: 'paired-store',
      storeName: 'Toko Terhubung',
      passphrase: cleanPassphrase,
      timestamp: Date.now(),
    });

    setSuccessMsg('Perangkat berhasil disambungkan ke toko!');
    setPassphraseInput('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              {t('sync.connectCard.title', 'Sambungkan ke Toko Lain')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t(
                'sync.connectCard.desc',
                'Ketik 12 kata kunci toko utama atau pindai kode QR untuk menggabungkan terminal ini.'
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-3">
          {/* Direct typing / pasting 12 words textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="connect-passphrase" className="font-semibold text-foreground">
                Ketik / Tempel 12 Kata Kunci Toko
              </label>
              <span
                className={`text-[11px] font-mono font-medium ${
                  isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                }`}
              >
                {wordCount} / 12 kata
              </span>
            </div>

            <textarea
              id="connect-passphrase"
              rows={3}
              value={passphraseInput}
              onChange={(e) => {
                setPassphraseInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Contoh: apple banana cherry diamond eagle flame galaxy harbor island jungle knight lemon"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={!isComplete}
              className="h-9 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Link2 className="h-4 w-4" />
              <span>Hubungkan ke Toko</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenScanner}
              className="h-9 text-xs font-bold gap-2 cursor-pointer"
            >
              <ScanLine className="h-4 w-4" />
              <span>Buka Kamera Pindai QR</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConnectStoreCard;
