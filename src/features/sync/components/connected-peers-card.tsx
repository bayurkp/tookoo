import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, Smartphone, Laptop, RefreshCw, ShieldBan, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PeerConnectionInfo } from '@/types/sync.types';

interface ConnectedPeersCardProps {
  peers: PeerConnectionInfo[];
  blacklistedDeviceIds?: string[];
  onManualSync?: () => void;
  onBlacklistDevice?: (deviceId: string) => void;
  onUnblacklistDevice?: (deviceId: string) => void;
}

export const ConnectedPeersCard: React.FC<ConnectedPeersCardProps> = ({
  peers,
  blacklistedDeviceIds = [],
  onManualSync,
  onBlacklistDevice,
  onUnblacklistDevice,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wifi className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                {t('sync.peers.title', 'Terminal Terhubung')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('sync.peers.desc', 'Perangkat kasir aktif di jaringan lokal toko.')}
              </CardDescription>
            </div>
          </div>
          {onManualSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualSync}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>{t('sync.peers.syncNow', 'Sinkronkan Sekarang')}</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {peers.length === 0 ? (
          <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center flex flex-col items-center justify-center space-y-2">
            <Wifi className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs font-medium text-foreground">
              {t('sync.peers.standalone', 'Mode Lokal Mandiri (1 Perangkat Aktif)')}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {t(
                'sync.peers.standaloneDesc',
                'Belum ada terminal kasir lain yang terhubung. Pindai QR di atas untuk menambahkan kasir kedua.'
              )}
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

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs py-0">
                    {t('sync.connected', 'Terhubung')}
                  </Badge>

                  {onBlacklistDevice && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onBlacklistDevice(peer.peerId)}
                      className="h-7 px-2 text-destructive hover:bg-destructive/10 text-[11px] gap-1 cursor-pointer"
                      title="Blokir Akses Perangkat Ini"
                    >
                      <ShieldBan className="h-3.5 w-3.5" />
                      <span>Blokir</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blacklisted Devices Section */}
        {blacklistedDeviceIds.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
              <ShieldBan className="h-3.5 w-3.5" />
              <span>Perangkat Diblokir ({blacklistedDeviceIds.length})</span>
            </p>
            <div className="space-y-1.5">
              {blacklistedDeviceIds.map((deviceId) => (
                <div
                  key={deviceId}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs"
                >
                  <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[200px]">
                    ID: {deviceId}
                  </span>
                  {onUnblacklistDevice && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUnblacklistDevice(deviceId)}
                      className="h-6 px-2 text-[11px] gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Buka Blokir</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedPeersCard;
