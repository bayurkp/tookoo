import React from 'react';
import { Wifi, Smartphone, Laptop, RefreshCw } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PeerConnectionInfo } from '@/types/sync.types';

interface ConnectedPeersCardProps {
  peers: PeerConnectionInfo[];
  onManualSync?: () => void;
}

export const ConnectedPeersCard: React.FC<ConnectedPeersCardProps> = ({
  peers,
  onManualSync,
}) => {
  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wifi className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Terminal Terhubung</CardTitle>
              <CardDescription className="text-xs">
                Perangkat kasir aktif di jaringan lokal toko.
              </CardDescription>
            </div>
          </div>
          {onManualSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualSync}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Sinkronkan Sekarang</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {peers.length === 0 ? (
          <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center flex flex-col items-center justify-center space-y-2">
            <Wifi className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs font-medium text-foreground">
              Mode Lokal Mandiri (1 Perangkat Aktif)
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Belum ada terminal kasir lain yang terhubung. Pindai QR di atas untuk
              menambahkan kasir kedua.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {peers.map((peer) => (
              <div
                key={peer.peerId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    {peer.deviceName.includes('Laptop') ? (
                      <Laptop className="h-4 w-4 text-foreground" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{peer.deviceName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      ID: {peer.peerId.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <Badge variant="success" className="text-xs py-0">
                  {peer.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
