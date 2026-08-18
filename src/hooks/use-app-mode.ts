import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { AppMode } from '@/types/store.types';
import { sounds } from '@/utils/audio';

export const useAppMode = () => {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  // Default to 'SIMPLE' mode if not specified
  const appMode: AppMode = settings?.appMode || 'SIMPLE';
  const isSimple = appMode === 'SIMPLE';
  const isAdvanced = appMode === 'ADVANCED';

  const setAppModeMutation = useMutation({
    mutationFn: async (newMode: AppMode) => {
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
    onSuccess: () => {
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
