import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadBackupToGoogleDrive,
  listGoogleDriveBackups,
  downloadAndRestoreGoogleDriveBackup,
  requestGoogleDriveOAuth,
  revokeGoogleOAuth,
  executeCloudBackup,
} from '../api/cloud-backup-api';
import { exportDatabaseToJson } from '../api/sync-engine';
import { db } from '@/lib/db';
import { useP2pSync } from './use-p2p-sync';
import type { CloudBackupConfig } from '@/types/cloud-backup.types';
import { sounds } from '@/utils/audio';

export const useCloudBackup = () => {
  const queryClient = useQueryClient();
  const { settings, updateSettings } = useP2pSync();
  const storeName = settings?.storeName || 'Tookoo Store';
  const config = settings?.cloudBackupConfig;

  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // 1. Google Drive Backups Query
  const googleDriveBackupsQuery = useQuery({
    queryKey: ['google-drive-backups', config?.googleDrive?.accessToken],
    queryFn: () => {
      if (!config?.googleDrive?.accessToken) return [];
      return listGoogleDriveBackups(config.googleDrive.accessToken);
    },
    enabled: Boolean(config?.googleDrive?.accessToken),
  });

  // 2. Connect with Google Drive via standard OAuth popup
  const connectGoogleDrive = async (clientId: string) => {
    setIsConnectingGoogle(true);
    try {
      const authResult = await requestGoogleDriveOAuth(clientId);
      const updatedConfig: CloudBackupConfig = {
        autoBackupInterval: config?.autoBackupInterval || 'MANUAL_ONLY',
        destinations: {
          googleDrive: true,
        },
        googleDrive: {
          clientId,
          accessToken: authResult.accessToken,
          connectedEmail: authResult.email,
          connectedName: authResult.name,
          connectedPicture: authResult.picture,
          tokenExpiresAt: authResult.tokenExpiresAt,
        },
        lastBackupTimestamp: config?.lastBackupTimestamp,
        lastBackupStatus: config?.lastBackupStatus,
        lastBackupMessage: config?.lastBackupMessage,
        ordersCountAtLastBackup: config?.ordersCountAtLastBackup,
      };

      await updateSettings({ cloudBackupConfig: updatedConfig });
      queryClient.invalidateQueries({ queryKey: ['google-drive-backups'] });
      sounds.playSuccess();
      return authResult;
    } catch (err: any) {
      sounds.playAlert();
      throw err;
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  // 3. Disconnect Google Drive
  const disconnectGoogleDrive = async () => {
    const currentToken = config?.googleDrive?.accessToken;
    if (currentToken) {
      await revokeGoogleOAuth(currentToken);
    }

    const updatedConfig: CloudBackupConfig = {
      autoBackupInterval: config?.autoBackupInterval || 'MANUAL_ONLY',
      destinations: {
        googleDrive: false,
      },
      googleDrive: {
        clientId: config?.googleDrive?.clientId || '',
        accessToken: undefined,
        connectedEmail: undefined,
        connectedName: undefined,
        connectedPicture: undefined,
        tokenExpiresAt: undefined,
      },
      lastBackupTimestamp: config?.lastBackupTimestamp,
      lastBackupStatus: config?.lastBackupStatus,
      lastBackupMessage: config?.lastBackupMessage,
      ordersCountAtLastBackup: config?.ordersCountAtLastBackup,
    };

    await updateSettings({ cloudBackupConfig: updatedConfig });
    queryClient.invalidateQueries({ queryKey: ['google-drive-backups'] });
    sounds.playAlert();
  };

  // 4. Upload to Google Drive Mutation
  const uploadGoogleDriveMutation = useMutation({
    mutationFn: async () => {
      if (!config?.googleDrive?.accessToken) {
        throw new Error('Akses Google Drive belum terhubung.');
      }
      const backup = await exportDatabaseToJson();
      return uploadBackupToGoogleDrive(config.googleDrive.accessToken, backup, storeName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-backups'] });
      sounds.playSuccess();
    },
  });

  // 5. Restore from Google Drive Mutation
  const restoreGoogleDriveMutation = useMutation({
    mutationFn: async (fileId: string) => {
      if (!config?.googleDrive?.accessToken) {
        throw new Error('Akses Google Drive belum terhubung.');
      }
      return downloadAndRestoreGoogleDriveBackup(config.googleDrive.accessToken, fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      sounds.playSuccess();
    },
  });

  // 6. Update Cloud Backup Config
  const saveCloudBackupConfig = async (newConfig: CloudBackupConfig) => {
    await updateSettings({
      cloudBackupConfig: newConfig,
    });
  };

  // 7. Execute Full Cloud Backup
  const runCloudBackupNow = async () => {
    if (!config) return;
    setIsSyncing(true);
    try {
      const currentOrdersCount = await db.orders.count();
      const res = await executeCloudBackup(config, storeName);

      await saveCloudBackupConfig({
        ...config,
        lastBackupTimestamp: Date.now(),
        lastBackupStatus: res.success ? 'SUCCESS' : 'FAILED',
        lastBackupMessage: res.message,
        ordersCountAtLastBackup: currentOrdersCount,
      });

      if (res.success) {
        sounds.playSuccess();
      } else {
        sounds.playAlert();
      }
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    config,
    isSyncing,
    isConnectingGoogle,
    connectGoogleDrive,
    disconnectGoogleDrive,
    googleDriveBackups: googleDriveBackupsQuery.data || [],
    isLoadingGoogleDriveBackups: googleDriveBackupsQuery.isLoading,
    refetchGoogleDriveBackups: googleDriveBackupsQuery.refetch,
    uploadGoogleDrive: uploadGoogleDriveMutation.mutateAsync,
    isUploadingGoogleDrive: uploadGoogleDriveMutation.isPending,
    restoreGoogleDrive: restoreGoogleDriveMutation.mutateAsync,
    isRestoringGoogleDrive: restoreGoogleDriveMutation.isPending,
    saveCloudBackupConfig,
    runCloudBackupNow,
  };
};
