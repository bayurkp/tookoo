import { db } from '@/lib/db';
import { generateUUID } from '@/utils/uuid';
import { generatePassphrase } from '@/lib/passphrase';
import type { StoreSettings } from '@/types/store.types';

export const getOrCreateStoreSettings = async (): Promise<StoreSettings> => {
  const existing = await db.settings.toCollection().first();
  if (existing) {
    return existing;
  }

  const now = Date.now();
  const defaultSettings: StoreSettings = {
    id: generateUUID(),
    storeName: 'Tookoo POS',
    passphrase: generatePassphrase(12),
    storeSecretKey: generateUUID(),
    isSetupComplete: false,
    activeRole: 'OWNER',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.settings.put(defaultSettings);
  return defaultSettings;
};

export const updateStoreSettings = async (
  updates: Partial<Omit<StoreSettings, 'id' | 'createdAt'>>
): Promise<StoreSettings> => {
  const current = await getOrCreateStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
  };

  await db.settings.put(updated);
  return updated;
};
