import { exportDatabaseToJson, importDatabaseFromJson, type DatabaseBackup } from './sync-engine';
import type { CloudBackupConfig, GoogleDriveBackupFile } from '@/types/cloud-backup.types';
import { formatCurrency } from '@/utils/format-currency';

/**
 * Format a human-friendly timestamp for backup filenames
 */
export const getBackupFilename = (storeName: string): string => {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const sanitizedStore = storeName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return `tookoo-backup-${sanitizedStore}-${dateStr}.json`;
};

// ============================================================================
// 1. GOOGLE DRIVE REST API INTEGRATION
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
// 2. TELEGRAM BOT API INTEGRATION
// ============================================================================

/**
 * Test Telegram Bot credentials with a ping message
 */
export const testTelegramConnection = async (
  botToken: string,
  chatId: string
): Promise<boolean> => {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
  const text = `🔔 *Tookoo POS — Uji Koneksi Telegram Berhasil*\n\nBot Telegram berhasil terhubung dengan sistem kasir Anda. Pencadangan otomatis siap digunakan!`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: cleanChatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.description || 'Gagal mengirim pesan uji ke Telegram');
  }

  return true;
};

/**
 * Send full backup file (.json) as document attachment to Telegram
 */
export const sendBackupToTelegram = async (
  botToken: string,
  chatId: string,
  backup: DatabaseBackup,
  storeName: string
): Promise<boolean> => {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();
  const fileName = getBackupFilename(storeName);

  const fileContent = JSON.stringify(backup, null, 2);
  const blob = new Blob([fileContent], { type: 'application/json' });

  const totalOmzet = backup.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const caption =
    `📦 *Cadangan Data Tookoo POS*\n` +
    `🏪 *Toko:* ${storeName}\n` +
    `📅 *Waktu:* ${new Date().toLocaleString('id-ID')}\n` +
    `📊 *Statistik:* ${backup.products.length} Produk, ${backup.orders.length} Transaksi\n` +
    `💰 *Total Omzet Tercatat:* ${formatCurrency(totalOmzet, backup.settings?.currency)}\n\n` +
    `_Simpan berkas JSON ini untuk memulihkan data kasir kapan saja._`;

  const formData = new FormData();
  formData.append('chat_id', cleanChatId);
  formData.append('caption', caption);
  formData.append('parse_mode', 'Markdown');
  formData.append('document', blob, fileName);

  const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendDocument`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.description || 'Gagal mengirim berkas backup ke Telegram');
  }

  return true;
};

// ============================================================================
// 3. DISCORD WEBHOOK INTEGRATION
// ============================================================================

/**
 * Test Discord Webhook with an embed message
 */
export const testDiscordWebhook = async (
  webhookUrl: string,
  storeName: string
): Promise<boolean> => {
  const cleanUrl = webhookUrl.trim();

  const payload = {
    username: 'Tookoo POS Backup Bot',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/869/869636.png',
    embeds: [
      {
        title: '✅ Uji Koneksi Webhook Discord Berhasil',
        description: `Webhook Discord untuk **${storeName}** berhasil terhubung. Pencadangan otomatis siap berjalan!`,
        color: 0x10b981, // Emerald Green
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Tookoo POS • 100% Offline P2P',
        },
      },
    ],
  };

  const response = await fetch(cleanUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengirim pesan uji ke Discord (${response.status})`);
  }

  return true;
};

/**
 * Send backup file (.json) as file attachment to Discord Webhook with rich embed
 */
export const sendBackupToDiscord = async (
  webhookUrl: string,
  backup: DatabaseBackup,
  storeName: string
): Promise<boolean> => {
  const cleanUrl = webhookUrl.trim();
  const fileName = getBackupFilename(storeName);

  const fileContent = JSON.stringify(backup, null, 2);
  const blob = new Blob([fileContent], { type: 'application/json' });

  const totalOmzet = backup.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const payload = {
    username: 'Tookoo POS Backup Bot',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/869/869636.png',
    content: `📦 **Cadangan Baru Tookoo POS:** \`${fileName}\``,
    embeds: [
      {
        title: `Laporan Cadangan Data Toko — ${storeName}`,
        color: 0x3b82f6, // Blue
        fields: [
          {
            name: '📦 Total Produk',
            value: `${backup.products.length} Menu/Barang`,
            inline: true,
          },
          {
            name: '🧾 Total Transaksi',
            value: `${backup.orders.length} Struk`,
            inline: true,
          },
          {
            name: '💰 Total Omzet',
            value: formatCurrency(totalOmzet, backup.settings?.currency),
            inline: true,
          },
          {
            name: '🪑 Denah Meja',
            value: `${backup.tables?.length || 0} Meja`,
            inline: true,
          },
          {
            name: '🏷️ Master Promo & Pajak',
            value: `${(backup.masterDiscounts?.length || 0) + (backup.masterTaxes?.length || 0)} Aturan`,
            inline: true,
          },
        ],
        footer: {
          text: 'Tookoo POS • Simpan lampiran file JSON untuk pemulihan data',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const formData = new FormData();
  formData.append('payload_json', JSON.stringify(payload));
  formData.append('files[0]', blob, fileName);

  const response = await fetch(cleanUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Gagal mengirim berkas backup ke Discord (${response.status})`);
  }

  return true;
};

// ============================================================================
// 4. CLOUD BACKUP MULTI-DESTINATION RUNNER
// ============================================================================

export interface BackupExecutionResult {
  success: boolean;
  message: string;
  destinationsSuccess: string[];
  destinationsFailed: string[];
}

/**
 * Execute cloud backup to all enabled destinations in parallel
 */
export const executeCloudBackup = async (
  config: CloudBackupConfig,
  storeName: string
): Promise<BackupExecutionResult> => {
  const backup = await exportDatabaseToJson();
  const destinationsSuccess: string[] = [];
  const destinationsFailed: string[] = [];

  const promises: Promise<void>[] = [];

  // 1. Google Drive
  if (config.destinations.googleDrive && config.googleDrive?.accessToken) {
    promises.push(
      uploadBackupToGoogleDrive(config.googleDrive.accessToken, backup, storeName)
        .then(() => {
          destinationsSuccess.push('Google Drive');
        })
        .catch((err) => {
          destinationsFailed.push(`Google Drive (${err.message})`);
        })
    );
  }

  // 2. Telegram Bot
  if (config.destinations.telegram && config.telegram?.botToken && config.telegram?.chatId) {
    promises.push(
      sendBackupToTelegram(config.telegram.botToken, config.telegram.chatId, backup, storeName)
        .then(() => {
          destinationsSuccess.push('Telegram');
        })
        .catch((err) => {
          destinationsFailed.push(`Telegram (${err.message})`);
        })
    );
  }

  // 3. Discord Webhook
  if (config.destinations.discord && config.discord?.webhookUrl) {
    promises.push(
      sendBackupToDiscord(config.discord.webhookUrl, backup, storeName)
        .then(() => {
          destinationsSuccess.push('Discord');
        })
        .catch((err) => {
          destinationsFailed.push(`Discord (${err.message})`);
        })
    );
  }

  if (promises.length === 0) {
    return {
      success: false,
      message: 'Tidak ada tujuan cloud backup yang aktif atau terkonfigurasi.',
      destinationsSuccess: [],
      destinationsFailed: [],
    };
  }

  await Promise.all(promises);

  const isSuccess = destinationsSuccess.length > 0;
  const message = isSuccess
    ? `Berhasil dicadangkan ke: ${destinationsSuccess.join(', ')}`
    : `Gagal mencadangkan ke: ${destinationsFailed.join(', ')}`;

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
