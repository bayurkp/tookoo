import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wifi,
  Smartphone,
  Laptop,
  RefreshCw,
  ShieldBan,
  ShieldCheck,
  Star,
  Lock,
  Unlock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PeerConnectionInfo } from '@/types/sync.types';

interface ConnectedPeersCardProps {
  peers: PeerConnectionInfo[];
  blacklistedDeviceIds?: string[];
  whitelistedDeviceIds?: string[];
  whitelistOnly?: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
  onBlacklistDevice?: (deviceId: string) => void;
  onUnblacklistDevice?: (deviceId: string) => void;
  onWhitelistDevice?: (deviceId: string) => void;
  onUnwhitelistDevice?: (deviceId: string) => void;
  onToggleWhitelistOnly?: (enabled: boolean) => void;
}

export const ConnectedPeersCard: React.FC<ConnectedPeersCardProps> = ({
  peers,
  blacklistedDeviceIds = [],
  whitelistedDeviceIds = [],
  whitelistOnly = false,
  isSyncing = false,
  onManualSync,
  onBlacklistDevice,
  onUnblacklistDevice,
  onWhitelistDevice,
  onUnwhitelistDevice,
  onToggleWhitelistOnly,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'WHITELIST' | 'BLACKLIST'>('ACTIVE');

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Wifi className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                {t('sync.peers.title', 'Perangkat Kasir Terhubung')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t(
                  'sync.peers.desc',
                  'Daftar terminal kasir yang sedang aktif tersambung di toko Anda.'
                )}
              </CardDescription>
            </div>
          </div>
          {onManualSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualSync}
              disabled={isSyncing}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`}
              />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Samakan Data Sekarang'}</span>
            </Button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1.5 pt-3 border-b pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <Wifi className="h-3 w-3" />
            <span>Aktif ({peers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WHITELIST')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'WHITELIST'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <Star className="h-3 w-3" />
            <span>Tepercaya ({whitelistedDeviceIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BLACKLIST')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BLACKLIST'
                ? 'bg-destructive text-destructive-foreground'
                : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <ShieldBan className="h-3 w-3" />
            <span>Diblokir ({blacklistedDeviceIds.length})</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 space-y-3">
        {/* 1. Tab Active Peers */}
        {activeTab === 'ACTIVE' && (
          <div>
            {peers.length === 0 ? (
              <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center flex flex-col items-center justify-center space-y-2">
                <Wifi className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs font-medium text-foreground">Mode Kasir Mandiri</p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Belum ada terminal kasir lain yang terhubung. Sambungkan HP atau tablet kasir lain
                  dengan memindai kode QR atau memasukkan 12 kata kunci.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {peers.map((peer) => {
                  const isWhitelisted = whitelistedDeviceIds.includes(peer.peerId);

                  return (
                    <div
                      key={peer.peerId}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                          {peer.deviceName.toLowerCase().includes('laptop') ? (
                            <Laptop className="h-4 w-4 text-foreground" />
                          ) : (
                            <Smartphone className="h-4 w-4 text-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground truncate">
                              {peer.deviceName}
                            </p>
                            {isWhitelisted && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 border-amber-500/30 text-amber-600 bg-amber-500/10 shrink-0"
                              >
                                <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500" />
                                Tepercaya
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            ID: {peer.peerId.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs py-0"
                        >
                          Terhubung
                        </Badge>

                        {/* Whitelist action */}
                        {onWhitelistDevice && !isWhitelisted && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onWhitelistDevice(peer.peerId)}
                            className="h-7 px-2 text-amber-600 hover:bg-amber-500/10 text-[11px] gap-1 cursor-pointer"
                            title="Tandai Sebagai Perangkat Tepercaya"
                          >
                            <Star className="h-3 w-3" />
                            <span className="hidden sm:inline">Tepercaya</span>
                          </Button>
                        )}

                        {/* Blacklist action */}
                        {onBlacklistDevice && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onBlacklistDevice(peer.peerId)}
                            className="h-7 px-2 text-destructive hover:bg-destructive/10 text-[11px] gap-1 cursor-pointer"
                            title="Blokir Akses Perangkat Ini"
                          >
                            <ShieldBan className="h-3 w-3" />
                            <span className="hidden sm:inline">Blokir</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Tab Whitelist (Perangkat Tepercaya) */}
        {activeTab === 'WHITELIST' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  {whitelistOnly ? (
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span>Mode Khusus Perangkat Tepercaya</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {whitelistOnly
                    ? 'Hanya perangkat di daftar Tepercaya yang diizinkan menyinkronkan data.'
                    : 'Semua perangkat dengan kata kunci toko dapat terhubung secara otomatis.'}
                </p>
              </div>
              {onToggleWhitelistOnly && (
                <Button
                  type="button"
                  variant={whitelistOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleWhitelistOnly(!whitelistOnly)}
                  className="h-7 text-xs px-3 cursor-pointer shrink-0 font-semibold"
                >
                  {whitelistOnly ? 'Aktif' : 'Nonaktif'}
                </Button>
              )}
            </div>

            {whitelistedDeviceIds.length === 0 ? (
              <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center text-xs text-muted-foreground">
                Belum ada perangkat di daftar tepercaya. Klik tombol &ldquo;Tepercaya&rdquo; pada
                perangkat yang aktif untuk menambahkannya.
              </div>
            ) : (
              <div className="space-y-1.5">
                {whitelistedDeviceIds.map((deviceId) => (
                  <div
                    key={deviceId}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-mono text-foreground text-[11px] truncate max-w-[200px]">
                        ID: {deviceId}
                      </span>
                    </div>
                    {onUnwhitelistDevice && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnwhitelistDevice(deviceId)}
                        className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Tab Blacklist (Perangkat Diblokir) */}
        {activeTab === 'BLACKLIST' && (
          <div className="space-y-3">
            {blacklistedDeviceIds.length === 0 ? (
              <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center text-xs text-muted-foreground">
                Tidak ada perangkat yang diblokir.
              </div>
            ) : (
              <div className="space-y-1.5">
                {blacklistedDeviceIds.map((deviceId) => (
                  <div
                    key={deviceId}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldBan className="h-3.5 w-3.5 text-destructive" />
                      <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[200px]">
                        ID: {deviceId}
                      </span>
                    </div>
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
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedPeersCard;
