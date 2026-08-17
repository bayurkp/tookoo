import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductById } from '../api/get-products';
import { upsertProduct, type UpsertProductInput } from '../api/upsert-product';
import { deleteProduct } from '../api/delete-product';
import { p2pEngine } from '@/lib/webrtc';
import { db } from '@/lib/db';
import type { Product } from '@/types/product.types';

export const productsKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
};

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: productsKeys.all,
    queryFn: getProducts,
  });
};

export const useProduct = (id: string) => {
  return useQuery<Product | undefined>({
    queryKey: productsKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });
};

export const useUpsertProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertProductInput) => upsertProduct(data),
    onSuccess: async (savedProduct) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(savedProduct.id) });

      // Broadcast to connected peers in real-time
      const settings = await db.settings.toCollection().first();
      p2pEngine.broadcast({
        action: 'UPSERT',
        collection: 'products',
        data: savedProduct,
        updatedAt: savedProduct.updatedAt,
        deviceId: settings?.id || 'host-device',
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) });

      // Broadcast soft-delete to connected peers in real-time
      const deletedItem = await db.products.get(id);
      const settings = await db.settings.toCollection().first();
      if (deletedItem) {
        p2pEngine.broadcast({
          action: 'UPSERT',
          collection: 'products',
          data: deletedItem,
          updatedAt: deletedItem.updatedAt,
          deviceId: settings?.id || 'host-device',
        });
      }
    },
  });
};
