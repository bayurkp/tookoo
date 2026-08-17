import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, KeyRound, CheckCircle2, AlertCircle, Camera, RefreshCw, StopCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { normalizePassphrase } from '@/lib/passphrase';
import { sounds } from '@/utils/audio';
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual'>('scanner');
  const [manualPassphrase, setManualPassphrase] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);

  // Stop camera scanner safely
  const stopCamera = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error clearing QR scanner:', err);
      }
      scannerRef.current = null;
    }

    setIsCameraActive(false);
    setIsInitializing(false);
    isStoppingRef.current = false;
  };

  // Start camera scanner
  const startCamera = async () => {
    setErrorMessage(null);
    setIsInitializing(true);

    try {
      // Ensure any previous scanner is stopped cleanly
      await stopCamera();

      // Wait a tick for DOM to settle
      await new Promise((r) => setTimeout(r, 100));

      const readerElement = document.getElementById('tookoo-qr-reader');
      if (!readerElement) {
        throw new Error('Viewfinder element not found');
      }

      const scanner = new Html5Qrcode('tookoo-qr-reader');
      scannerRef.current = scanner;

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.max(150, Math.floor(minEdge * 0.75));
          return { width: edge, height: edge };
        },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode: 'environment' },
        qrConfig,
        async (decodedText) => {
          try {
            const payload = JSON.parse(decodedText) as StorePairingPayload;
            if (!payload.passphrase) {
              throw new Error('Missing passphrase in QR');
            }
            sounds.playSuccess();
            await stopCamera();
            onPairSuccess(payload);
            onOpenChange(false);
          } catch {
            setErrorMessage(
              t(
                'sync.scanner.invalidQr',
                'Format QR Code tidak valid. Pastikan Anda memindai QR Code dari aplikasi Tookoo.'
              )
            );
          }
        },
        () => {
          // ignore scan frame errors
        }
      );

      // Force video element to play inline on iOS Safari
      const video = readerElement.querySelector('video');
      if (video) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '0.75rem';
        video.play().catch(() => {});
      }

      setIsCameraActive(true);
    } catch (err) {
      console.error('Failed to start camera scanner:', err);
      setIsCameraActive(false);
      setErrorMessage(
        t(
          'sync.scanner.cameraPermissionDenied',
          'Kamera tidak dapat dimulai. Pastikan izin kamera aktif di Safari/Chrome, atau gunakan tab 12 Kata Kunci.'
        )
      );
    } finally {
      setIsInitializing(false);
    }
  };

  // Auto-stop camera when modal closes or tab changes
  useEffect(() => {
    if (!open || activeTab !== 'scanner') {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, activeTab]);

  const handleManualPair = () => {
    const cleaned = normalizePassphrase(manualPassphrase);
    const words = cleaned.split(' ').filter(Boolean);

    if (words.length !== 12) {
      setErrorMessage(
        t('sync.scanner.invalidWordCount', 'Kata kunci harus terdiri dari tepat 12 kata.')
      );
      return;
    }

    const payload: StorePairingPayload = {
      storeId: 'paired-store-' + Date.now(),
      storeName: 'Toko Terhubung',
      passphrase: cleaned,
      timestamp: Date.now(),
    };

    sounds.playSuccess();
    onPairSuccess(payload);
    onOpenChange(false);
    setManualPassphrase('');
    setErrorMessage(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) stopCamera();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('sync.scanner.title', 'Pairing Terminal Kasir')}</DialogTitle>
          <DialogDescription>
            {t('sync.scanner.desc', 'Hubungkan perangkat ini ke database toko yang sudah ada.')}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setErrorMessage(null);
            setActiveTab(val as 'scanner' | 'manual');
          }}
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="scanner" className="gap-1.5 cursor-pointer">
              <ScanLine className="h-3.5 w-3.5" />
              <span>{t('sync.scanner.cameraTab', 'Pindai Kamera')}</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-1.5 cursor-pointer">
              <KeyRound className="h-3.5 w-3.5" />
              <span>{t('sync.scanner.manualTab', '12 Kata Kunci')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Camera Scanner Tab */}
          <TabsContent value="scanner" className="pt-2 space-y-3">
            <div className="relative w-full aspect-square max-h-[280px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center overflow-hidden bg-muted/30">
              {/* Always rendered in DOM with valid geometry */}
              <div
                id="tookoo-qr-reader"
                className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl"
              />

              {/* Placeholder when camera is inactive */}
              {!isCameraActive && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center space-y-3 bg-card/95 z-10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {t('sync.scanner.cameraTitle', 'Pindai QR Toko dengan Kamera')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      {t(
                        'sync.scanner.cameraDesc',
                        'Arahkan kamera ke QR Code toko di layar laptop atau HP utama.'
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={startCamera}
                    disabled={isInitializing}
                    className="mt-2 text-xs font-bold gap-2 cursor-pointer"
                  >
                    {isInitializing ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isInitializing
                        ? t('common.loading', 'Menyiapkan Kamera...')
                        : t('sync.scanner.startCamera', 'Nyalakan Kamera')}
                    </span>
                  </Button>
                </div>
              )}
            </div>

            {isCameraActive && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={stopCamera}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <StopCircle className="h-3.5 w-3.5 text-destructive" />
                  <span>Matikan Kamera</span>
                </Button>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 p-2.5 rounded-md font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </TabsContent>

          {/* Manual Passphrase Tab */}
          <TabsContent value="manual" className="pt-2 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t('sync.scanner.passphraseLabel', '12 Kata Kunci Toko *')}
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
              <p className="text-[11px] text-muted-foreground">
                {t(
                  'sync.scanner.passphraseHelper',
                  'Salin 12 kata kunci dari menu Sinkronisasi pada terminal kasir utama.'
                )}
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 p-2.5 rounded-md font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              stopCamera();
              onOpenChange(false);
            }}
            className="cursor-pointer"
          >
            {t('common.actions.cancel', 'Batal')}
          </Button>
          {activeTab === 'manual' && (
            <Button
              type="button"
              onClick={handleManualPair}
              className="font-bold gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{t('sync.scanner.connectBtn', 'Hubungkan Toko')}</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrScannerModal;
