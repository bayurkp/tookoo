export type AutoBackupInterval =
  'MANUAL_ONLY' | 'EVERY_5_ORDERS' | 'EVERY_10_ORDERS' | 'EVERY_25_ORDERS' | 'DAILY';

export interface GoogleDriveConfig {
  clientId?: string;
  apiKey?: string;
  accessToken?: string;
  connectedEmail?: string;
  folderId?: string;
  tokenExpiresAt?: number;
}

export interface TelegramBackupConfig {
  botToken?: string;
  chatId?: string;
  enabled?: boolean;
}

export interface DiscordBackupConfig {
  webhookUrl?: string;
  enabled?: boolean;
}

export interface CloudBackupConfig {
  autoBackupInterval: AutoBackupInterval;
  destinations: {
    googleDrive?: boolean;
    telegram?: boolean;
    discord?: boolean;
  };
  googleDrive?: GoogleDriveConfig;
  telegram?: TelegramBackupConfig;
  discord?: DiscordBackupConfig;
  lastBackupTimestamp?: number;
  lastBackupStatus?: 'SUCCESS' | 'FAILED' | 'IDLE';
  lastBackupMessage?: string;
  ordersCountAtLastBackup?: number;
}

export interface GoogleDriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: string;
  modifiedTime?: string;
}

export const DEFAULT_CLOUD_BACKUP_CONFIG: CloudBackupConfig = {
  autoBackupInterval: 'MANUAL_ONLY',
  destinations: {
    googleDrive: false,
    telegram: false,
    discord: false,
  },
  telegram: {
    botToken: '',
    chatId: '',
    enabled: false,
  },
  discord: {
    webhookUrl: '',
    enabled: false,
  },
  lastBackupStatus: 'IDLE',
  ordersCountAtLastBackup: 0,
};
