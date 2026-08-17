import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { useProducts, useUpsertProduct, useDeleteProduct } from '../use-products';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProducts hooks', () => {
  beforeEach(async () => {
    await db.products.clear();
  });

  it('fetches products, upserts a product and invalidates query', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);

    const { result: upsertHook } = renderHook(() => useUpsertProduct(), { wrapper });

    await act(async () => {
      await upsertHook.current.mutateAsync({
        name: 'Matcha Latte',
        price: 22000,
        stock: 30,
        category: 'Minuman',
      });
    });

    await waitFor(() => expect(result.current.data?.length).toBe(1));
    expect(result.current.data?.[0].name).toBe('Matcha Latte');
  });

  it('deletes a product and updates query result', async () => {
    const wrapper = createWrapper();
    const { result: upsertHook } = renderHook(() => useUpsertProduct(), { wrapper });

    let created: any;
    await act(async () => {
      created = await upsertHook.current.mutateAsync({
        name: 'Croissant',
        price: 25000,
        stock: 15,
        category: 'Makanan',
      });
    });

    const { result: productsHook } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(productsHook.current.data?.length).toBe(1));

    const { result: deleteHook } = renderHook(() => useDeleteProduct(), { wrapper });

    await act(async () => {
      await deleteHook.current.mutateAsync(created.id);
    });

    await waitFor(() => expect(productsHook.current.data?.length).toBe(0));
  });
});
