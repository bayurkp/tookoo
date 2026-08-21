import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAppMode } from '../use-app-mode';
import { db } from '@/lib/db';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAppMode', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.settings.put({
      id: 'settings-1',
      storeName: 'Test Store',
      passphrase: 'test test test test test test test test test test test test',
      storeSecretKey: 'secret-1',
      currency: 'IDR',
      appMode: 'SIMPLE',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });
  });

  it('reads current app mode accurately', async () => {
    const { result } = renderHook(() => useAppMode(), { wrapper: createWrapper() });

    await act(async () => {});

    expect(result.current.appMode).toBe('SIMPLE');
    expect(result.current.isSimple).toBe(true);
    expect(result.current.isAdvanced).toBe(false);
  });

  it('updates app mode to ADVANCED', async () => {
    const { result } = renderHook(() => useAppMode(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.setAppMode('ADVANCED');
    });

    const updated = await db.settings.get('settings-1');
    expect(updated?.appMode).toBe('ADVANCED');
  });

  it('toggles app mode', async () => {
    const { result } = renderHook(() => useAppMode(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.toggleAppMode();
    });

    const updated = await db.settings.get('settings-1');
    expect(updated?.appMode).toBe('ADVANCED');
  });

  it('preserves mode from localStorage when settings table is cleared', async () => {
    localStorage.setItem('tookoo_last_app_mode', 'ADVANCED');
    await db.settings.clear();

    const { result } = renderHook(() => useAppMode(), { wrapper: createWrapper() });

    await act(async () => {});

    expect(result.current.appMode).toBe('ADVANCED');
    expect(result.current.isAdvanced).toBe(true);
  });
});
