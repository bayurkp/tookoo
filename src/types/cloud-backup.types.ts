export type AutoBackupInterval =
  | 'MANUAL_ONLY'
  | 'EVERY_5_ORDERS'
  | 'EVERY_10_ORDERS'
  | 'EVERY_25_ORDERS'
  | 'DAILY';

export interface GoogleDriveConfig {
  clientId?: string;
  accessToken?: string;
  connectedEmail?: string;
  connectedName?: string;
  connectedPicture?: string;
  tokenExpiresAt?: number;
}

export interface CloudBackupConfig {
  autoBackupInterval: AutoBackupInterval;
  destinations: {
    googleDrive?: boolean;
  };
  googleDrive?: GoogleDriveConfig;
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
  },
  googleDrive: {
    clientId: '',
    accessToken: '',
  },
  lastBackupStatus: 'IDLE',
  ordersCountAtLastBackup: 0,
};
