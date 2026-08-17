import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { StoreIdentityCard } from '@/features/sync/components/store-identity-card';
import { QrPairingCard } from '@/features/sync/components/qr-pairing-card';
import { QrScannerModal } from '@/features/sync/components/qr-scanner-modal';
import { ConnectedPeersCard } from '@/features/sync/components/connected-peers-card';
import { TerminalSecurityCard } from '@/features/sync/components/terminal-security-card';
import { BackupExportCard } from '@/features/sync/components/backup-export-card';
import type { StorePairingPayload } from '@/types/sync.types';
import type { UserRole } from '@/types/store.types';

export const SyncPage: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('sync.title', 'Sinkronisasi')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'sync.subtitle',
            'Sinkronisasi multi-terminal kasir peer-to-peer (WebRTC), kelola izin akses (RBAC), whitelist, dan blacklist perangkat.'
          )}
        </p>
      </div>

      {/* Grid Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Identity, Security & QR Code */}
        <div className="space-y-6 flex flex-col">
          <StoreIdentityCard
            settings={settings}
            onUpdateStoreName={updateStoreName}
            onUpdateDeviceName={updateDeviceName}
            onRegeneratePassphrase={regeneratePassphrase}
          />
          <TerminalSecurityCard
            settings={settings}
            onUpdateRole={handleUpdateRole}
            onUpdatePin={handleUpdatePin}
          />
          <QrPairingCard settings={settings} onOpenScanner={() => setIsScannerOpen(true)} />
        </div>

        {/* Right Column: Peers & Whitelist/Blacklist, and Backup */}
        <div className="space-y-6 flex flex-col">
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
          <BackupExportCard onExport={exportBackup} onImport={importBackup} />
        </div>
      </div>

      {/* Scanner & Manual Pairing Modal */}
      <QrScannerModal
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onPairSuccess={handlePairSuccess}
      />
    </div>
  );
};

export default SyncPage;
