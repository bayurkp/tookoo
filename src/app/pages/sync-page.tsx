import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { StoreIdentityCard } from '@/features/sync/components/store-identity-card';
import { QrPairingCard } from '@/features/sync/components/qr-pairing-card';
import { QrScannerModal } from '@/features/sync/components/qr-scanner-modal';
import { ConnectedPeersCard } from '@/features/sync/components/connected-peers-card';
import { BackupExportCard } from '@/features/sync/components/backup-export-card';
import type { StorePairingPayload } from '@/types/sync.types';

export const SyncPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    settings,
    peers,
    updateStoreName,
    regeneratePassphrase,
    exportBackup,
    importBackup,
  } = useP2pSync();

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handlePairSuccess = (payload: StorePairingPayload) => {
    updateStoreName(payload.storeName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('sync.title', 'Sinkronisasi & Kunci Toko')}
        </h2>
        <p className="text-muted-foreground text-sm">
          Pairing multi-perangkat kasir peer-to-peer (WebRTC) tanpa server terpusat.
        </p>
      </div>

      {/* Grid Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Identity & QR Code */}
        <div className="space-y-6 flex flex-col">
          <StoreIdentityCard
            settings={settings}
            onUpdateStoreName={updateStoreName}
            onRegeneratePassphrase={regeneratePassphrase}
          />
          <QrPairingCard
            settings={settings}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        </div>

        {/* Right Column: Peers & Backup */}
        <div className="space-y-6 flex flex-col">
          <ConnectedPeersCard peers={peers} />
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
