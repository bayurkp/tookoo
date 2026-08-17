import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Key, Camera } from 'lucide-react';

export const SyncPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">P2P Sync & Sambung Kasir</h2>
        <p className="text-muted-foreground text-sm">
          Hubungkan perangkat kasir baru dengan Scan QR Code atau ketik 12 Kata Passphrase (BIP-39).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Toko Saya
            </CardTitle>
            <CardDescription>
              Tunjukkan QR Code ini kepada kasir lain yang ingin bergabung ke toko Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="h-48 w-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed">
              <QrCode className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Scan menggunakan kamera HP kasir baru.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Gabung ke Toko Lain
            </CardTitle>
            <CardDescription>
              Scan QR Code atau masukkan 12 kata passphrase milik toko utama.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full gap-2">
              <Camera className="h-4 w-4" />
              Buka Kamera untuk Scan QR
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Key className="h-4 w-4" />
              Ketik 12 Kata Passphrase
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SyncPage;
