import React, { useState } from 'react';
import { ScanLine, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizePassphrase } from '@/lib/passphrase';
import type { StorePairingPayload } from '@/types/sync.types';

interface QrScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPairSuccess: (payload: StorePairingPayload) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  open,
  onOpenChange,
  onPairSuccess,
}) => {
  const [manualPassphrase, setManualPassphrase] = useState('');
  const [manualStoreName, setManualStoreName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleManualPair = () => {
    const cleaned = normalizePassphrase(manualPassphrase);
    const words = cleaned.split(' ').filter(Boolean);

    if (words.length !== 12) {
      setErrorMessage('Kata kunci harus terdiri dari tepat 12 kata.');
      return;
    }

    const payload: StorePairingPayload = {
      storeId: 'paired-store-' + Date.now(),
      storeName: manualStoreName.trim() || 'Toko Cabang Paired',
      passphrase: cleaned,
      timestamp: Date.now(),
    };

    onPairSuccess(payload);
    onOpenChange(false);
    setManualPassphrase('');
    setManualStoreName('');
    setErrorMessage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Pairing Terminal Kasir</DialogTitle>
          <DialogDescription>
            Hubungkan perangkat ini ke database toko yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="scanner" className="gap-1.5">
              <ScanLine className="h-3.5 w-3.5" />
              <span>Pindai Kamera</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              <span>12 Kata Kunci</span>
            </TabsTrigger>
          </TabsList>

          {/* Camera Scanner Tab */}
          <TabsContent value="scanner" className="pt-2">
            <div className="p-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ScanLine className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Arahkan Kamera ke QR Toko</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Pastikan izin kamera aktif pada browser untuk memindai secara
                  langsung.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Manual Passphrase Tab */}
          <TabsContent value="manual" className="pt-2 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Toko (Opsional)
              </label>
              <Input
                value={manualStoreName}
                onChange={(e) => setManualStoreName(e.target.value)}
                placeholder="Contoh: Kedai Utama"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                12 Kata Sandi Toko *
              </label>
              <textarea
                value={manualPassphrase}
                onChange={(e) => {
                  setManualPassphrase(e.target.value);
                  setErrorMessage(null);
                }}
                rows={3}
                placeholder="ocean forest monkey vintage crystal guitar silver river tiger winter cloud amber"
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded-md font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="button" onClick={handleManualPair} className="font-bold gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Hubungkan Toko</span>
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
