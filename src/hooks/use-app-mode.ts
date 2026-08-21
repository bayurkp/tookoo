import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { AppMode } from '@/types/store.types';
import { sounds } from '@/utils/audio';

const APP_MODE_STORAGE_KEY = 'tookoo_last_app_mode';

const getStoredAppMode = (): AppMode => {
  try {
    const stored = localStorage.getItem(APP_MODE_STORAGE_KEY);
    if (stored === 'ADVANCED' || stored === 'SIMPLE') {
      return stored;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return 'SIMPLE';
};

const storeAppMode = (mode: AppMode) => {
  try {
    localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore localStorage access errors
  }
};

export const useAppMode = () => {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  // Default to stored mode or 'SIMPLE' if not specified in database
  const appMode: AppMode = settings?.appMode || getStoredAppMode();
  const isSimple = appMode === 'SIMPLE';
  const isAdvanced = appMode === 'ADVANCED';

  const setAppModeMutation = useMutation({
    mutationFn: async (newMode: AppMode) => {
      storeAppMode(newMode);
      const currentSettings = await db.settings.toCollection().first();
      if (currentSettings) {
        await db.settings.update(currentSettings.id, {
          appMode: newMode,
          updatedAt: Date.now(),
        });
      } else {
        await db.settings.put({
          id: crypto.randomUUID(),
          storeName: 'Tookoo POS',
          passphrase: '',
          storeSecretKey: crypto.randomUUID(),
          currency: 'IDR',
          appMode: newMode,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          deletedAt: null,
        });
      }
      return newMode;
    },
    onSuccess: (newMode) => {
      storeAppMode(newMode);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      sounds.playSuccess();
    },
  });

  const setAppMode = async (mode: AppMode) => {
    return setAppModeMutation.mutateAsync(mode);
  };

  const toggleAppMode = async () => {
    const nextMode: AppMode = isSimple ? 'ADVANCED' : 'SIMPLE';
    return setAppMode(nextMode);
  };

  return {
    appMode,
    isSimple,
    isAdvanced,
    setAppMode,
    toggleAppMode,
    isUpdating: setAppModeMutation.isPending,
  };
};
