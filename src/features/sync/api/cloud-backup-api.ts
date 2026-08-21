import { exportDatabaseToJson, importDatabaseFromJson, type DatabaseBackup } from './sync-engine';
import type { CloudBackupConfig, GoogleDriveBackupFile } from '@/types/cloud-backup.types';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              expires_in?: number;
            }) => void;
            error_callback?: (err: unknown) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
          revoke: (accessToken: string, done: () => void) => void;
        };
      };
    };
  }
}

/**
 * Format a human-friendly timestamp for backup filenames
 */
export const getBackupFilename = (storeName: string): string => {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const sanitizedStore = storeName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return `tookoo-backup-${sanitizedStore}-${dateStr}.json`;
};

// ============================================================================
// 1. GOOGLE IDENTITY SERVICES (GIS) OAUTH 2.0 INTEGRATION
// ============================================================================

/**
 * Dynamically loads the official Google Identity Services script
 */
export const loadGoogleIdentityScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('google-identity-services-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Gagal memuat Google Identity Services dari Google.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-services-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Gagal mengunduh Google Identity Services dari Google.'));
    document.head.appendChild(script);
  });
};

/**
 * Opens standard Google OAuth 2.0 Consent popup for conscious user authorization
 */
export const requestGoogleDriveOAuth = async (
  clientId: string
): Promise<{
  accessToken: string;
  tokenExpiresAt: number;
  email?: string;
  name?: string;
  picture?: string;
}> => {
  if (!clientId?.trim()) {
    throw new Error(
      'Google Client ID belum dikonfigurasi. Masukkan Client ID Google Cloud Anda.'
    );
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services tidak dapat diinisialisasi di peramban ini.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google!.accounts!.oauth2!.initTokenClient({
        client_id: clientId.trim(),
        scope:
          'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response) => {
          if (response.error || !response.access_token) {
            reject(
              new Error(
                response.error === 'access_denied'
                  ? 'Izin akses Google Drive ditolak oleh pengguna.'
                  : response.error || 'Autentikasi Google dibatalkan.'
              )
            );
            return;
          }

          const accessToken = response.access_token;
          const expiresIn = response.expires_in || 3600;
          const tokenExpiresAt = Date.now() + expiresIn * 1000;

          // Fetch user profile info to display connected account
          let email: string | undefined;
          let name: string | undefined;
          let picture: string | undefined;

          try {
            const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (userinfoRes.ok) {
              const profile = await userinfoRes.json();
              email = profile.email;
              name = profile.name;
              picture = profile.picture;
            }
          } catch {
            // Profile fetch optional
          }

          resolve({
            accessToken,
            tokenExpiresAt,
            email,
            name,
            picture,
          });
        },
        error_callback: () => {
          reject(new Error('Gagal membuka jendela autentikasi Google. Pastikan popup tidak diblokir.'));
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(new Error(err.message || 'Gagal memulai koneksi Google OAuth.'));
    }
  });
};

/**
 * Revoke Google Access Token on Disconnect
 */
export const revokeGoogleOAuth = async (accessToken: string): Promise<void> => {
  if (!accessToken) return;
  try {
    if (window.google?.accounts?.oauth2?.revoke) {
      await new Promise<void>((resolve) => {
        window.google!.accounts!.oauth2!.revoke(accessToken, () => resolve());
      });
    } else {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    }
  } catch {
    // Non-blocking revoke
  }
};

// ============================================================================
// 2. GOOGLE DRIVE REST API INTEGRATION
// ============================================================================

/**
 * Upload backup JSON payload to Google Drive as a file
 */
export const uploadBackupToGoogleDrive = async (
  accessToken: string,
  backup: DatabaseBackup,
  storeName: string
): Promise<{ fileId: string; fileName: string }> => {
  const fileName = getBackupFilename(storeName);
  const fileContent = JSON.stringify(backup, null, 2);

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Tookoo POS Backup for ${storeName} exported at ${new Date().toLocaleString('id-ID')}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal mengunggah ke Google Drive (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as { id: string; name: string };
  return { fileId: data.id, fileName: data.name };
};

/**
 * List existing Tookoo backup files from Google Drive
 */
export const listGoogleDriveBackups = async (
  accessToken: string
): Promise<GoogleDriveBackupFile[]> => {
  const query = encodeURIComponent("name contains 'tookoo-backup' and trashed = false");
  const fields = encodeURIComponent('files(id, name, mimeType, createdTime, size, modifiedTime)');

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=createdTime desc&pageSize=20`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal mengambil daftar cadangan dari Google Drive: ${err}`);
  }

  const data = (await response.json()) as { files?: GoogleDriveBackupFile[] };
  return data.files || [];
};

/**
 * Download a backup file from Google Drive and restore to local database
 */
export const downloadAndRestoreGoogleDriveBackup = async (
  accessToken: string,
  fileId: string
): Promise<{ productsCount: number; ordersCount: number }> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengunduh file dari Google Drive: status ${response.status}`);
  }

  const json = (await response.json()) as DatabaseBackup;
  return importDatabaseFromJson(json);
};

// ============================================================================
// 3. CLOUD BACKUP ORCHESTRATION & BACKGROUND AUTO-TRIGGER
// ============================================================================

export interface BackupExecutionResult {
  success: boolean;
  message: string;
  destinationsSuccess: string[];
  destinationsFailed: string[];
}

/**
 * Execute cloud backup to Google Drive
 */
export const executeCloudBackup = async (
  config: CloudBackupConfig,
  storeName: string
): Promise<BackupExecutionResult> => {
  const backup = await exportDatabaseToJson();
  const destinationsSuccess: string[] = [];
  const destinationsFailed: string[] = [];

  if (config.googleDrive?.accessToken) {
    try {
      await uploadBackupToGoogleDrive(config.googleDrive.accessToken, backup, storeName);
      destinationsSuccess.push('Google Drive');
    } catch (err: any) {
      destinationsFailed.push(`Google Drive (${err.message})`);
    }
  }

  if (destinationsSuccess.length === 0 && destinationsFailed.length === 0) {
    return {
      success: false,
      message: 'Akun Google Drive belum terhubung untuk pencadangan otomatis.',
      destinationsSuccess: [],
      destinationsFailed: [],
    };
  }

  const isSuccess = destinationsSuccess.length > 0;
  const message = isSuccess
    ? `Berhasil dicadangkan ke Google Drive.`
    : `Gagal mencadangkan ke Google Drive: ${destinationsFailed.join(', ')}`;

  return {
    success: isSuccess,
    message,
    destinationsSuccess,
    destinationsFailed,
  };
};

/**
 * Background checker called after new transactions to trigger scheduled auto-backup
 */
export const checkAndTriggerAutoBackup = async (): Promise<void> => {
  try {
    const settings = await import('@/lib/db').then((m) => m.db.settings.toCollection().first());
    if (!settings || !settings.cloudBackupConfig) return;

    const config = settings.cloudBackupConfig;
    if (config.autoBackupInterval === 'MANUAL_ONLY') return;
    if (!config.googleDrive?.accessToken) return;

    const ordersCount = await import('@/lib/db').then((m) => m.db.orders.count());
    const lastCount = config.ordersCountAtLastBackup || 0;
    const lastTime = config.lastBackupTimestamp || 0;
    const now = Date.now();

    let shouldTrigger = false;

    if (config.autoBackupInterval === 'EVERY_5_ORDERS' && ordersCount - lastCount >= 5) {
      shouldTrigger = true;
    } else if (config.autoBackupInterval === 'EVERY_10_ORDERS' && ordersCount - lastCount >= 10) {
      shouldTrigger = true;
    } else if (config.autoBackupInterval === 'EVERY_25_ORDERS' && ordersCount - lastCount >= 25) {
      shouldTrigger = true;
    } else if (config.autoBackupInterval === 'DAILY' && now - lastTime >= 86400000) {
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      const res = await executeCloudBackup(config, settings.storeName || 'Tookoo Store');
      const updatedConfig: CloudBackupConfig = {
        ...config,
        lastBackupTimestamp: now,
        lastBackupStatus: res.success ? 'SUCCESS' : 'FAILED',
        lastBackupMessage: res.message,
        ordersCountAtLastBackup: ordersCount,
      };
      await import('@/lib/db').then((m) =>
        m.db.settings.update(settings.id, {
          cloudBackupConfig: updatedConfig,
          updatedAt: now,
        })
      );
    }
  } catch {
    // Non-blocking background worker
  }
};
