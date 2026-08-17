import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
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
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { productFormSchema, type ProductFormInput } from '../types/product-form.types';
import { useUpsertProduct } from '../hooks/use-products';
import { compressImageToWebP } from '@/utils/image-compressor';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const currentImageUrl = watch('imageUrl');

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const webpDataUrl = await compressImageToWebP(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
      });
      setValue('imageUrl', webpDataUrl, { shouldValidate: true });
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setValue('imageUrl', '', { shouldValidate: true });
  };

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
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{productToEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              {productToEdit
                ? 'Perbarui rincian harga, stok, atau foto produk.'
                : 'Masukkan rincian produk baru ke dalam katalog tokomu.'}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-3 py-1">
            {/* Image Upload & Compression Section */}
            <Field>
              <FieldLabel>Foto Produk (Otomatis WebP Terkompresi)</FieldLabel>
              <div className="flex items-center gap-3">
                {/* Thumbnail Preview */}
                <div className="relative h-16 w-16 rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                  {currentImageUrl ? (
                    <>
                      <img
                        src={currentImageUrl}
                        alt="Pratinjau Foto"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center cursor-pointer shadow-xs hover:bg-destructive/90"
                        title="Hapus Foto"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>

                {/* Upload Button & Info */}
                <div className="flex-1 space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs gap-1.5 cursor-pointer w-full"
                  >
                    {isCompressing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Mengompresi ke WebP...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Pilih Foto / Kamera</span>
                      </>
                    )}
                  </Button>
                  <FieldDescription className="text-[11px]">
                    Foto dikompresi otomatis ke WebP (~20KB) untuk hemat memori.
                  </FieldDescription>
                </div>
              </div>
            </Field>

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
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isCompressing}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isCompressing}>
              {isSubmitting ? 'Menyimpan...' : productToEdit ? 'Simpan Produk' : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
