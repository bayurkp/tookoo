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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
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

          <FieldGroup className="gap-3 py-2">
            <Field>
              <FieldLabel htmlFor="name">Nama Produk *</FieldLabel>
              <Input
                id="name"
                placeholder="Contoh: Kopi Americano"
                {...register('name')}
              />
              <FieldError errors={[{ message: errors.name?.message }]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="category">Kategori *</FieldLabel>
                <Input
                  id="category"
                  placeholder="Contoh: Minuman"
                  {...register('category')}
                />
                <FieldError errors={[{ message: errors.category?.message }]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="price">Harga (Rp) *</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  {...register('price')}
                />
                <FieldError errors={[{ message: errors.price?.message }]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="stock">Jumlah Stok *</FieldLabel>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                {...register('stock')}
              />
              <FieldError errors={[{ message: errors.stock?.message }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="imageUrl">URL Foto Produk (Opsional)</FieldLabel>
              <Input
                id="imageUrl"
                placeholder="https://images.unsplash.com/..."
                {...register('imageUrl')}
              />
              <FieldError errors={[{ message: errors.imageUrl?.message }]} />
            </Field>
          </FieldGroup>

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
