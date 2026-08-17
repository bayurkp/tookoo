import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductById } from '../api/get-products';
import { upsertProduct, type UpsertProductInput } from '../api/upsert-product';
import { deleteProduct } from '../api/delete-product';
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
    onSuccess: (savedProduct) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(savedProduct.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) });
    },
  });
};
