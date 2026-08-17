import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { useP2pSync } from '../use-p2p-sync';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useP2pSync Hook', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.products.clear();
    await db.orders.clear();
  });

  it('loads default store settings and allows updating store name', async () => {
    const { result } = renderHook(() => useP2pSync(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSettingsLoading).toBe(false);
      expect(result.current.settings).toBeDefined();
    });

    expect(result.current.settings?.storeName).toBe('Toko Saya');

    act(() => {
      result.current.updateStoreName('Kedai Kopi Antariksa');
    });

    await waitFor(() => {
      expect(result.current.settings?.storeName).toBe('Kedai Kopi Antariksa');
    });
  });

  it('regenerates a 12-word passphrase', async () => {
    const { result } = renderHook(() => useP2pSync(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.settings).toBeDefined();
    });

    const originalPassphrase = result.current.settings?.passphrase;

    act(() => {
      result.current.regeneratePassphrase();
    });

    await waitFor(() => {
      expect(result.current.settings?.passphrase).not.toBe(originalPassphrase);
      expect(result.current.settings?.passphrase.split(' ')).toHaveLength(12);
    });
  });
});
