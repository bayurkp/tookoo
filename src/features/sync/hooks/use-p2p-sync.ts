import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateStoreSettings,
  updateStoreSettings,
} from '../api/store-settings-api';
import {
  applySyncMessage,
  exportDatabaseToJson,
  importDatabaseFromJson,
  type DatabaseBackup,
} from '../api/sync-engine';
import { p2pEngine } from '@/lib/webrtc';
import { generatePassphrase } from '@/lib/passphrase';
import type { PeerConnectionInfo, SyncMessage } from '@/types/sync.types';
import type { StoreSettings } from '@/types/store.types';

export const useP2pSync = () => {
  const queryClient = useQueryClient();
  const [peers, setPeers] = useState<PeerConnectionInfo[]>([]);

  // Fetch Store Settings
  const { data: settings, isLoading: isSettingsLoading } = useQuery<StoreSettings>({
    queryKey: ['settings'],
    queryFn: getOrCreateStoreSettings,
  });

  // Mutate Store Settings
  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<Omit<StoreSettings, 'id' | 'createdAt'>>) =>
      updateStoreSettings(updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
    },
  });

  // Handle incoming P2P message
  const handleIncomingMessage = useCallback(
    async (msg: SyncMessage) => {
      const applied = await applySyncMessage(msg);
      if (applied) {
        queryClient.invalidateQueries({ queryKey: [msg.collection] });
      }
    },
    [queryClient]
  );

  // Handle peer connection state change
  const handlePeerStatus = useCallback(
    (peerId: string, status: 'CONNECTED' | 'DISCONNECTED') => {
      setPeers((prev) => {
        if (status === 'CONNECTED') {
          const existing = prev.find((p) => p.peerId === peerId);
          if (existing) {
            return prev.map((p) => (p.peerId === peerId ? { ...p, status } : p));
          }
          return [
            ...prev,
            {
              peerId,
              deviceName: 'Terminal Kasir Peer',
              connectedAt: Date.now(),
              status,
            },
          ];
        }
        return prev.filter((p) => p.peerId !== peerId);
      });
    },
    []
  );

  // Initialize P2P Listener
  useEffect(() => {
    p2pEngine.initConnection(handleIncomingMessage, handlePeerStatus);
    return () => {
      p2pEngine.close();
    };
  }, [handleIncomingMessage, handlePeerStatus]);

  // Actions
  const updateStoreName = (name: string) => {
    updateSettingsMutation.mutate({ storeName: name });
  };

  const regeneratePassphrase = () => {
    updateSettingsMutation.mutate({ passphrase: generatePassphrase(12) });
  };

  const exportBackup = async () => {
    const backup = await exportDatabaseToJson();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `tookoo-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (backupData: DatabaseBackup) => {
    const result = await importDatabaseFromJson(backupData);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    return result;
  };

  return {
    settings,
    isSettingsLoading,
    peers,
    updateStoreName,
    regeneratePassphrase,
    exportBackup,
    importBackup,
  };
};
