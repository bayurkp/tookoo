import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateStoreSettings, updateStoreSettings } from '../api/store-settings-api';
import {
  applySyncMessage,
  exportDatabaseToJson,
  importDatabaseFromJson,
  type DatabaseBackup,
} from '../api/sync-engine';
import { p2pEngine } from '@/lib/webrtc';
import { db } from '@/lib/db';
import { generatePassphrase } from '@/lib/passphrase';
import type { PeerConnectionInfo, SyncMessage } from '@/types/sync.types';
import type { StoreSettings } from '@/types/store.types';

export const useP2pSync = () => {
  const queryClient = useQueryClient();
  const [peers, setPeers] = useState<PeerConnectionInfo[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch Store Settings
  const { data: settings, isLoading: isSettingsLoading } = useQuery<StoreSettings>({
    queryKey: ['settings'],
    queryFn: getOrCreateStoreSettings,
  });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

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
      const currentSettings = settingsRef.current;
      const currentBlacklist = currentSettings?.blacklistedDeviceIds || [];
      const currentWhitelist = currentSettings?.whitelistedDeviceIds || [];
      const isWhitelistOnly = Boolean(currentSettings?.whitelistOnly);

      // 1. Check blacklist: Ignore all messages from blacklisted devices
      if (currentBlacklist.includes(msg.deviceId)) {
        console.warn(`[P2P] Ignored message from blacklisted device: ${msg.deviceId}`);
        return;
      }

      // 2. Check whitelist-only mode
      if (isWhitelistOnly && !currentWhitelist.includes(msg.deviceId)) {
        console.warn(`[P2P] Ignored message from non-whitelisted device: ${msg.deviceId}`);
        return;
      }

      // 3. Handle Handshake
      if (msg.action === 'HANDSHAKE') {
        const peerData = msg.data as { deviceName?: string };
        const deviceName = peerData?.deviceName || 'Terminal Kasir';

        setPeers((prev) => {
          const existing = prev.find((p) => p.peerId === msg.deviceId);
          if (existing) {
            return prev.map((p) =>
              p.peerId === msg.deviceId ? { ...p, deviceName, status: 'CONNECTED' } : p
            );
          }
          return [
            ...prev,
            {
              peerId: msg.deviceId,
              deviceName,
              connectedAt: Date.now(),
              status: 'CONNECTED',
            },
          ];
        });
        return;
      }

      // 4. Apply normal sync mutation
      const applied = await applySyncMessage(msg);
      if (applied) {
        queryClient.invalidateQueries({ queryKey: [msg.collection] });
      }
    },
    [queryClient]
  );

  // Handle peer connection state change
  const handlePeerStatus = useCallback((peerId: string, status: 'CONNECTED' | 'DISCONNECTED') => {
    const currentSettings = settingsRef.current;
    const currentBlacklist = currentSettings?.blacklistedDeviceIds || [];
    const currentWhitelist = currentSettings?.whitelistedDeviceIds || [];
    const isWhitelistOnly = Boolean(currentSettings?.whitelistOnly);

    // Check blacklist & whitelist before accepting connection
    if (currentBlacklist.includes(peerId)) {
      return;
    }
    if (isWhitelistOnly && !currentWhitelist.includes(peerId)) {
      return;
    }

    setPeers((prev) => {
      if (status === 'CONNECTED') {
        const currentDeviceName = currentSettings?.deviceName || 'Kasir Utama';
        p2pEngine.broadcast({
          action: 'HANDSHAKE',
          collection: 'settings',
          data: { deviceName: currentDeviceName },
          updatedAt: Date.now(),
          deviceId: currentSettings?.id || 'host-device',
        });

        const existing = prev.find((p) => p.peerId === peerId);
        if (existing) {
          return prev.map((p) => (p.peerId === peerId ? { ...p, status } : p));
        }
        return [
          ...prev,
          {
            peerId,
            deviceName: 'Terminal Kasir',
            connectedAt: Date.now(),
            status,
          },
        ];
      }
      return prev.filter((p) => p.peerId !== peerId);
    });
  }, []);

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

  const updateDeviceName = (name: string) => {
    updateSettingsMutation.mutate({ deviceName: name });
  };

  const blacklistDevice = (deviceId: string) => {
    const current = settings?.blacklistedDeviceIds || [];
    if (!current.includes(deviceId)) {
      const updated = [...current, deviceId];
      // Also remove from whitelist if present
      const updatedWhitelist = (settings?.whitelistedDeviceIds || []).filter((id) => id !== deviceId);
      updateSettingsMutation.mutate({
        blacklistedDeviceIds: updated,
        whitelistedDeviceIds: updatedWhitelist,
      });
      setPeers((prev) => prev.filter((p) => p.peerId !== deviceId));
    }
  };

  const unblacklistDevice = (deviceId: string) => {
    const current = settings?.blacklistedDeviceIds || [];
    const updated = current.filter((id) => id !== deviceId);
    updateSettingsMutation.mutate({ blacklistedDeviceIds: updated });
  };

  const whitelistDevice = (deviceId: string) => {
    const current = settings?.whitelistedDeviceIds || [];
    if (!current.includes(deviceId)) {
      const updated = [...current, deviceId];
      // Also remove from blacklist if present
      const updatedBlacklist = (settings?.blacklistedDeviceIds || []).filter((id) => id !== deviceId);
      updateSettingsMutation.mutate({
        whitelistedDeviceIds: updated,
        blacklistedDeviceIds: updatedBlacklist,
      });
    }
  };

  const unwhitelistDevice = (deviceId: string) => {
    const current = settings?.whitelistedDeviceIds || [];
    const updated = current.filter((id) => id !== deviceId);
    updateSettingsMutation.mutate({ whitelistedDeviceIds: updated });
  };

  const toggleWhitelistOnly = (enabled: boolean) => {
    updateSettingsMutation.mutate({ whitelistOnly: enabled });
  };

  const regeneratePassphrase = () => {
    updateSettingsMutation.mutate({ passphrase: generatePassphrase(12) });
  };

  const syncAllDataNow = async () => {
    setIsSyncing(true);
    try {
      const products = await db.products.toArray();
      const orders = await db.orders.toArray();
      const deviceId = settings?.id || 'host-device';

      for (const product of products) {
        p2pEngine.broadcast({
          action: 'UPSERT',
          collection: 'products',
          data: product,
          updatedAt: product.updatedAt,
          deviceId,
        });
      }

      for (const order of orders) {
        p2pEngine.broadcast({
          action: 'UPSERT',
          collection: 'orders',
          data: order,
          updatedAt: order.updatedAt,
          deviceId,
        });
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
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

  const updateSettings = (updates: Partial<Omit<StoreSettings, 'id' | 'createdAt'>>) => {
    updateSettingsMutation.mutate(updates);
  };

  return {
    settings,
    isSettingsLoading,
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
  };
};
