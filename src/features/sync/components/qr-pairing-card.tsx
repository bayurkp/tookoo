import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ScanLine, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StoreSettings } from '@/types/store.types';
import type { StorePairingPayload } from '@/types/sync.types';

interface QrPairingCardProps {
  settings?: StoreSettings;
  onOpenScanner: () => void;
}

export const QrPairingCard: React.FC<QrPairingCardProps> = ({
  settings,
  onOpenScanner,
}) => {
  const pairingPayload: StorePairingPayload = {
    storeId: settings?.id || 'default-store',
    storeName: settings?.storeName || 'Toko Saya',
    passphrase: settings?.passphrase || '',
    timestamp: Date.now(),
  };

  const payloadString = JSON.stringify(pairingPayload);

  return (
    <Card className="border-border/80 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">QR Code Pairing Toko</CardTitle>
              <CardDescription className="text-xs">
                Pindai dari perangkat kasir lain untuk menghubungkan database lokal.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs py-0 gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            P2P Direct
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-white rounded-xl shadow-xs border border-border flex items-center justify-center">
          <QRCodeSVG
            value={payloadString}
            size={168}
            level="M"
            includeMargin={false}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Arahkan kamera terminal kasir baru ke QR di atas atau masukkan 12 kata sandi
          secara manual.
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          type="button"
          onClick={onOpenScanner}
          className="w-full h-9 text-xs font-bold gap-2 cursor-pointer"
        >
          <ScanLine className="h-4 w-4" />
          <span>Pindai QR Perangkat Lain</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
