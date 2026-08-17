import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { productFormSchema, type ProductFormInput } from '../types/product-form.types';
import { useUpsertProduct } from '../hooks/use-products';
import type { Product } from '@/types/product.types';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  productToEdit,
}) => {
  const upsertMutation = useUpsertProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      stock: 0,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (productToEdit) {
        reset({
          name: productToEdit.name,
          category: productToEdit.category || '',
          price: productToEdit.price,
          stock: productToEdit.stock,
          imageUrl: productToEdit.imageUrl || '',
        });
      } else {
        reset({
          name: '',
          category: '',
          price: 0,
          stock: 0,
          imageUrl: '',
        });
      }
    }
  }, [open, productToEdit, reset]);

  const onSubmit = async (data: ProductFormInput) => {
    try {
      await upsertMutation.mutateAsync({
        ...(productToEdit ? { id: productToEdit.id } : {}),
        name: data.name,
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        imageUrl: data.imageUrl || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{productToEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              {productToEdit
                ? 'Perbarui rincian harga, stok, atau nama produk.'
                : 'Masukkan rincian produk baru ke dalam katalog tokomu.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-semibold text-foreground">
                Nama Produk *
              </label>
              <Input
                id="name"
                placeholder="Contoh: Kopi Americano"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="category" className="text-xs font-semibold text-foreground">
                  Kategori *
                </label>
                <Input
                  id="category"
                  placeholder="Contoh: Minuman"
                  {...register('category')}
                  error={errors.category?.message}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="price" className="text-xs font-semibold text-foreground">
                  Harga (Rp) *
                </label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  {...register('price')}
                  error={errors.price?.message}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="stock" className="text-xs font-semibold text-foreground">
                Jumlah Stok *
              </label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                {...register('stock')}
                error={errors.stock?.message}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="imageUrl" className="text-xs font-semibold text-foreground">
                URL Foto Produk (Opsional)
              </label>
              <Input
                id="imageUrl"
                placeholder="https://images.unsplash.com/..."
                {...register('imageUrl')}
                error={errors.imageUrl?.message}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : productToEdit ? 'Simpan Produk' : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
