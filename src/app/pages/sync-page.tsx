import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { StoreIdentityCard } from '@/features/sync/components/store-identity-card';
import { ConnectStoreCard } from '@/features/sync/components/connect-store-card';
import { QrScannerModal } from '@/features/sync/components/qr-scanner-modal';
import { ConnectedPeersCard } from '@/features/sync/components/connected-peers-card';
import { TerminalSecurityCard } from '@/features/sync/components/terminal-security-card';
import { BackupExportCard } from '@/features/sync/components/backup-export-card';
import { CloudBackupCard } from '@/features/sync/components/cloud-backup-card';
import type { StorePairingPayload } from '@/types/sync.types';
import type { UserRole } from '@/types/store.types';

export const SyncPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    settings,
    peers,
    isSyncing,
    updateStoreName,
    updateDeviceName,
    blacklistDevice,
    unblacklistDevice,
    whitelistDevice,
    unwhitelistDevice,
    toggleWhitelistOnly,
    syncAllDataNow,
    regeneratePassphrase,
    updateSettings,
    exportBackup,
    importBackup,
  } = useP2pSync();

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Auto-pair if URL contains ?pair=...
  useEffect(() => {
    const pairParam = searchParams.get('pair');
    const storeParam = searchParams.get('store');
    if (pairParam && pairParam.trim().split(/\s+/).length === 12) {
      updateSettings({
        passphrase: pairParam.trim(),
        storeName: storeParam
          ? decodeURIComponent(storeParam)
          : settings?.storeName || 'Toko Cabang',
      });
      // Clear search params
      setSearchParams({}, { replace: true });
      setTimeout(() => {
        syncAllDataNow();
      }, 600);
    }
  }, [searchParams, setSearchParams, updateSettings, syncAllDataNow, settings?.storeName]);

  const handlePairSuccess = (payload: StorePairingPayload) => {
    updateSettings({
      storeName: payload.storeName,
      passphrase: payload.passphrase,
    });
    setTimeout(() => {
      syncAllDataNow();
    }, 500);
  };

  const handleUpdateRole = (role: UserRole) => {
    updateSettings({ activeRole: role });
  };

  const handleUpdatePin = (pin: string) => {
    updateSettings({ ownerPin: pin || undefined });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('sync.title', 'Sinkronisasi Perangkat')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'sync.subtitle',
            'Hubungkan beberapa HP dan mesin kasir untuk jualan bersama secara offline & real-time.'
          )}
        </p>
      </div>

      {/* 1. Store Identity & Current Passphrase / Current Store QR */}
      <StoreIdentityCard
        settings={settings}
        onUpdateStoreName={updateStoreName}
        onUpdateDeviceName={updateDeviceName}
        onRegeneratePassphrase={regeneratePassphrase}
      />

      {/* 2. Connect to Another Store (Direct 12 Words Typing or Camera QR Scan) */}
      <ConnectStoreCard
        onPairSuccess={handlePairSuccess}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* 3. Connected Devices / Peers & Sync Now */}
      <ConnectedPeersCard
        peers={peers}
        blacklistedDeviceIds={settings?.blacklistedDeviceIds}
        whitelistedDeviceIds={settings?.whitelistedDeviceIds}
        whitelistOnly={settings?.whitelistOnly}
        isSyncing={isSyncing}
        onManualSync={syncAllDataNow}
        onBlacklistDevice={blacklistDevice}
        onUnblacklistDevice={unblacklistDevice}
        onWhitelistDevice={whitelistDevice}
        onUnwhitelistDevice={unwhitelistDevice}
        onToggleWhitelistOnly={toggleWhitelistOnly}
      />

      {/* 4. Terminal Role & Security (Owner, Manager, Cashier + PIN) */}
      <TerminalSecurityCard
        settings={settings}
        onUpdateRole={handleUpdateRole}
        onUpdatePin={handleUpdatePin}
      />

      {/* 5. Offline Backup & Restore */}
      <BackupExportCard onExport={exportBackup} onImport={importBackup} />

      {/* 6. Cloud Backup & Remote Recovery (Google Drive, Telegram, Discord, Auto Schedule) */}
      <CloudBackupCard />

      {/* Scanner Modal for Camera */}
      <QrScannerModal
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onPairSuccess={handlePairSuccess}
      />
    </div>
  );
};

export default SyncPage;
