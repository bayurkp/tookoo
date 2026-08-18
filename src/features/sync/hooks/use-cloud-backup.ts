import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadBackupToGoogleDrive,
  listGoogleDriveBackups,
  downloadAndRestoreGoogleDriveBackup,
  sendBackupToTelegram,
  testTelegramConnection,
  sendBackupToDiscord,
  testDiscordWebhook,
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

  // 1. Google Drive Backups Query
  const googleDriveBackupsQuery = useQuery({
    queryKey: ['google-drive-backups', config?.googleDrive?.accessToken],
    queryFn: () => {
      if (!config?.googleDrive?.accessToken) return [];
      return listGoogleDriveBackups(config.googleDrive.accessToken);
    },
    enabled: Boolean(config?.googleDrive?.accessToken),
  });

  // 2. Upload to Google Drive Mutation
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

  // 3. Restore from Google Drive Mutation
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

  // 4. Test Telegram Connection Mutation
  const testTelegramMutation = useMutation({
    mutationFn: async ({ botToken, chatId }: { botToken: string; chatId: string }) => {
      return testTelegramConnection(botToken, chatId);
    },
    onSuccess: () => {
      sounds.playSuccess();
    },
  });

  // 5. Send to Telegram Mutation
  const sendTelegramMutation = useMutation({
    mutationFn: async ({ botToken, chatId }: { botToken: string; chatId: string }) => {
      const backup = await exportDatabaseToJson();
      return sendBackupToTelegram(botToken, chatId, backup, storeName);
    },
    onSuccess: () => {
      sounds.playSuccess();
    },
  });

  // 6. Test Discord Webhook Mutation
  const testDiscordMutation = useMutation({
    mutationFn: async (webhookUrl: string) => {
      return testDiscordWebhook(webhookUrl, storeName);
    },
    onSuccess: () => {
      sounds.playSuccess();
    },
  });

  // 7. Send to Discord Mutation
  const sendDiscordMutation = useMutation({
    mutationFn: async (webhookUrl: string) => {
      const backup = await exportDatabaseToJson();
      return sendBackupToDiscord(webhookUrl, backup, storeName);
    },
    onSuccess: () => {
      sounds.playSuccess();
    },
  });

  // 8. Update Cloud Backup Config
  const saveCloudBackupConfig = async (newConfig: CloudBackupConfig) => {
    await updateSettings({
      cloudBackupConfig: newConfig,
    });
  };

  // 9. Execute Full Cloud Backup
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
    googleDriveBackups: googleDriveBackupsQuery.data || [],
    isLoadingGoogleDriveBackups: googleDriveBackupsQuery.isLoading,
    refetchGoogleDriveBackups: googleDriveBackupsQuery.refetch,
    uploadGoogleDrive: uploadGoogleDriveMutation.mutateAsync,
    isUploadingGoogleDrive: uploadGoogleDriveMutation.isPending,
    restoreGoogleDrive: restoreGoogleDriveMutation.mutateAsync,
    isRestoringGoogleDrive: restoreGoogleDriveMutation.isPending,
    testTelegram: testTelegramMutation.mutateAsync,
    isTestingTelegram: testTelegramMutation.isPending,
    sendTelegram: sendTelegramMutation.mutateAsync,
    isSendingTelegram: sendTelegramMutation.isPending,
    testDiscord: testDiscordMutation.mutateAsync,
    isTestingDiscord: testDiscordMutation.isPending,
    sendDiscord: sendDiscordMutation.mutateAsync,
    isSendingDiscord: sendDiscordMutation.isPending,
    saveCloudBackupConfig,
    runCloudBackupNow,
  };
};
