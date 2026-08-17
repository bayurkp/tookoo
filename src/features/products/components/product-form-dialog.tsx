import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { productFormSchema, type ProductFormInput } from '../types/product-form.types';
import { useUpsertProduct } from '../hooks/use-products';
import { compressImageToWebP } from '@/utils/image-compressor';
import { generateUUID } from '@/utils/uuid';
import type { Product, ProductType } from '@/types/product.types';

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
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'variants' | 'modifiers'>('basic');

  const {
    register,
    control,
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
      productType: 'FNB',
      subType: '',
      price: 0,
      stock: 0,
      sku: '',
      barcode: '',
      description: '',
      imageUrl: '',
      variants: [],
      modifierGroups: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: 'variants',
  });

  const {
    fields: modifierGroupFields,
    append: appendModifierGroup,
    remove: removeModifierGroup,
  } = useFieldArray({
    control,
    name: 'modifierGroups',
  });

  const currentImageUrl = watch('imageUrl');
  const currentProductType = watch('productType');
  const watchedModifierGroups = watch('modifierGroups') || [];

  useEffect(() => {
    if (open) {
      setActiveTab('basic');
      if (productToEdit) {
        reset({
          name: productToEdit.name,
          category: productToEdit.category || '',
          productType: productToEdit.productType || 'FNB',
          subType: productToEdit.subType || '',
          price: productToEdit.price,
          stock: productToEdit.stock,
          sku: productToEdit.sku || '',
          barcode: productToEdit.barcode || '',
          description: productToEdit.description || '',
          imageUrl: productToEdit.imageUrl || '',
          variants: productToEdit.variants || [],
          modifierGroups: productToEdit.modifierGroups || [],
        });
      } else {
        reset({
          name: '',
          category: '',
          productType: 'FNB',
          subType: '',
          price: 0,
          stock: 0,
          sku: '',
          barcode: '',
          description: '',
          imageUrl: '',
          variants: [],
          modifierGroups: [],
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

  const handleAddVariantOption = () => {
    appendVariant({
      id: generateUUID(),
      name: '',
      price: Number(watch('price')) || 0,
      stock: Number(watch('stock')) || 0,
    });
  };

  const handleAddModifierGroup = () => {
    appendModifierGroup({
      id: generateUUID(),
      name: '',
      required: false,
      maxSelect: 1,
      options: [
        { id: generateUUID(), name: '', price: 0 },
      ],
    });
  };

  const handleAddModifierOptionToGroup = (groupIndex: number) => {
    const currentGroups = [...watchedModifierGroups];
    const group = currentGroups[groupIndex];
    if (group) {
      group.options = [
        ...(group.options || []),
        { id: generateUUID(), name: '', price: 0 },
      ];
      setValue('modifierGroups', currentGroups);
    }
  };

  const handleRemoveModifierOptionFromGroup = (groupIndex: number, optionIndex: number) => {
    const currentGroups = [...watchedModifierGroups];
    const group = currentGroups[groupIndex];
    if (group && group.options) {
      group.options.splice(optionIndex, 1);
      setValue('modifierGroups', currentGroups);
    }
  };

  const onSubmit = async (data: ProductFormInput) => {
    try {
      // Clean up variants and modifiers (ensure valid IDs)
      const cleanVariants = (data.variants || [])
        .filter((v) => v.name.trim().length > 0)
        .map((v) => ({
          id: v.id || generateUUID(),
          name: v.name.trim(),
          sku: v.sku?.trim() || undefined,
          price: Number(v.price),
          stock: Number(v.stock),
        }));

      const cleanModifierGroups = (data.modifierGroups || [])
        .filter((g) => g.name.trim().length > 0)
        .map((g) => ({
          id: g.id || generateUUID(),
          name: g.name.trim(),
          required: Boolean(g.required),
          maxSelect: Number(g.maxSelect) || 1,
          options: (g.options || [])
            .filter((opt) => opt.name.trim().length > 0)
            .map((opt) => ({
              id: opt.id || generateUUID(),
              name: opt.name.trim(),
              price: Number(opt.price) || 0,
            })),
        }));

      await upsertMutation.mutateAsync({
        ...(productToEdit ? { id: productToEdit.id } : {}),
        name: data.name.trim(),
        category: data.category.trim(),
        productType: data.productType as ProductType,
        subType: data.subType?.trim() || undefined,
        price: Number(data.price),
        stock: Number(data.stock),
        sku: data.sku?.trim() || undefined,
        barcode: data.barcode?.trim() || undefined,
        description: data.description?.trim() || undefined,
        imageUrl: data.imageUrl || undefined,
        variants: cleanVariants.length > 0 ? cleanVariants : undefined,
        modifierGroups: cleanModifierGroups.length > 0 ? cleanModifierGroups : undefined,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-4 pb-3 border-b bg-muted/20 shrink-0">
            <DialogTitle className="text-base font-bold">
              {productToEdit ? 'Edit Rincian Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {productToEdit
                ? 'Perbarui harga, stok, varian rasa/ukuran, atau modifier topping.'
                : 'Lengkapi info produk, kategori, varian, dan pilihan tambahan.'}
            </DialogDescription>
          </DialogHeader>

          {/* Form Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-4 pt-2 border-b shrink-0 bg-card">
              <TabsList className="grid grid-cols-4 w-full h-8">
                <TabsTrigger value="basic" className="text-xs gap-1 cursor-pointer">
                  <Info className="h-3 w-3" />
                  <span>Info Dasar</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs gap-1 cursor-pointer">
                  <DollarSign className="h-3 w-3" />
                  <span>Harga & Stok</span>
                </TabsTrigger>
                <TabsTrigger value="variants" className="text-xs gap-1 cursor-pointer">
                  <Sparkles className="h-3 w-3" />
                  <span>Varian ({variantFields.length})</span>
                </TabsTrigger>
                <TabsTrigger value="modifiers" className="text-xs gap-1 cursor-pointer">
                  <Layers className="h-3 w-3" />
                  <span>Topping ({modifierGroupFields.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 text-xs">
              {/* Tab 1: Info Dasar */}
              <TabsContent value="basic" className="space-y-3.5 m-0">
                {/* Photo Upload */}
                <Field>
                  <FieldLabel>Foto Produk (Otomatis WebP)</FieldLabel>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-xl border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                      {currentImageUrl ? (
                        <>
                          <img
                            src={currentImageUrl}
                            alt="Pratinjau"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center cursor-pointer shadow-xs"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="product-image-file"
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
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Mengompresi...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            <span>Unggah Foto Produk</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Field>

                {/* Product Type Selector */}
                <Field>
                  <FieldLabel>Tipe Produk</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'FNB', label: '🍜 F&B (Kuliner)' },
                      { type: 'RETAIL', label: '🛍️ Retail (Barang)' },
                      { type: 'SERVICE', label: '✂️ Jasa / Layanan' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setValue('productType', item.type as ProductType)}
                        className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          currentProductType === item.type
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Name */}
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="name">Nama Produk *</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    aria-invalid={Boolean(errors.name)}
                    {...register('name')}
                    className="h-9 text-xs"
                  />
                  <FieldError errors={[{ message: errors.name?.message }]} />
                </Field>

                {/* Category & SubType */}
                <div className="grid grid-cols-2 gap-3">
                  <Field data-invalid={Boolean(errors.category)}>
                    <FieldLabel htmlFor="category">Kategori Utama *</FieldLabel>
                    <Input
                      id="category"
                      placeholder="Contoh: Minuman"
                      aria-invalid={Boolean(errors.category)}
                      {...register('category')}
                      className="h-9 text-xs"
                    />
                    <FieldError errors={[{ message: errors.category?.message }]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="subType">Sub-Kategori / Jenis</FieldLabel>
                    <Input
                      id="subType"
                      placeholder="Contoh: Kopi Signature"
                      {...register('subType')}
                      className="h-9 text-xs"
                    />
                  </Field>
                </div>

                {/* SKU & Barcode */}
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="sku">Kode SKU</FieldLabel>
                    <Input
                      id="sku"
                      placeholder="Contoh: KOP-001"
                      {...register('sku')}
                      className="h-9 text-xs"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="barcode">Barcode</FieldLabel>
                    <Input
                      id="barcode"
                      placeholder="Scan Barcode EAN-13"
                      {...register('barcode')}
                      className="h-9 text-xs"
                    />
                  </Field>
                </div>

                {/* Description */}
                <Field>
                  <FieldLabel htmlFor="description">Deskripsi Singkat</FieldLabel>
                  <Input
                    id="description"
                    placeholder="Contoh: Perpaduan espresso robusta arabika dengan susu segar"
                    {...register('description')}
                    className="h-9 text-xs"
                  />
                </Field>
              </TabsContent>

              {/* Tab 2: Harga & Stok Dasar */}
              <TabsContent value="pricing" className="space-y-4 m-0">
                <div className="p-3 bg-muted/40 rounded-xl border text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Harga & Stok Dasar Produk</p>
                  <p>
                    Jika produk tidak memiliki varian ukuran/warna, harga dan stok ini yang akan digunakan saat kasir checkout.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field data-invalid={Boolean(errors.price)}>
                    <FieldLabel htmlFor="price">Harga Jual Dasar (Rp) *</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      aria-invalid={Boolean(errors.price)}
                      {...register('price')}
                      className="h-9 text-xs font-bold"
                    />
                    <FieldError errors={[{ message: errors.price?.message }]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.stock)}>
                    <FieldLabel htmlFor="stock">Total Stok Tersedia *</FieldLabel>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      aria-invalid={Boolean(errors.stock)}
                      {...register('stock')}
                      className="h-9 text-xs font-bold"
                    />
                    <FieldError errors={[{ message: errors.stock?.message }]} />
                  </Field>
                </div>
              </TabsContent>

              {/* Tab 3: Varian Produk */}
              <TabsContent value="variants" className="space-y-3 m-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-foreground">Daftar Varian Produk</p>
                    <p className="text-[11px] text-muted-foreground">
                      Contoh: Ukuran (Reguler/Large) atau Warna (Merah/Hitam) dengan harga & stok tersendiri.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddVariantOption}
                    className="h-7 px-2 text-xs gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Varian</span>
                  </Button>
                </div>

                {variantFields.length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-xl bg-card text-muted-foreground">
                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium text-xs">Belum ada varian produk</p>
                    <p className="text-[11px] mt-0.5">
                      Klik "Tambah Varian" untuk membuat pilihan ukuran, rasa, atau tipe.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {variantFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="p-3 rounded-xl border bg-card flex items-center gap-2"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">Nama Varian *</label>
                            <Input
                              placeholder="Reguler / Large"
                              {...register(`variants.${idx}.name` as const)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Harga (Rp) *</label>
                            <Input
                              type="number"
                              placeholder="0"
                              {...register(`variants.${idx}.price` as const)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Stok *</label>
                            <Input
                              type="number"
                              placeholder="0"
                              {...register(`variants.${idx}.stock` as const)}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(idx)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-3 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab 4: Modifiers / Topping */}
              <TabsContent value="modifiers" className="space-y-3 m-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-foreground">Grup Modifier & Topping</p>
                    <p className="text-[11px] text-muted-foreground">
                      Contoh: Topping Tambahan (Boba, Keju) atau Opsi Wajib (Level Gula, Level Pedas).
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddModifierGroup}
                    className="h-7 px-2 text-xs gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Grup Topping</span>
                  </Button>
                </div>

                {modifierGroupFields.length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-xl bg-card text-muted-foreground">
                    <Layers className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium text-xs">Belum ada modifier / topping</p>
                    <p className="text-[11px] mt-0.5">
                      Tambahkan opsi ekstra seperti Topping, Level Gula, atau Tambahan Sambal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modifierGroupFields.map((groupField, gIdx) => {
                      const group = watchedModifierGroups[gIdx];
                      const options = group?.options || [];

                      return (
                        <div
                          key={groupField.id}
                          className="p-3 rounded-xl border bg-card space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Nama Grup (cth: Topping Ekstra)"
                                {...register(`modifierGroups.${gIdx}.name` as const)}
                                className="h-7 text-xs font-semibold"
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    {...register(`modifierGroups.${gIdx}.required` as const)}
                                    className="rounded border-border"
                                  />
                                  <span>Wajib Pilih</span>
                                </label>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeModifierGroup(gIdx)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Options inside this group */}
                          <div className="space-y-1.5 pl-2 border-l-2 border-primary/20">
                            {options.map((opt, oIdx) => (
                              <div key={opt.id || oIdx} className="flex items-center gap-2">
                                <Input
                                  placeholder="Nama Opsi (cth: Boba)"
                                  value={opt.name}
                                  onChange={(e) => {
                                    const newGroups = [...watchedModifierGroups];
                                    if (newGroups[gIdx]?.options?.[oIdx]) {
                                      newGroups[gIdx].options[oIdx].name = e.target.value;
                                      setValue('modifierGroups', newGroups);
                                    }
                                  }}
                                  className="h-7 text-xs flex-1"
                                />
                                <div className="w-28 flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground">+Rp</span>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={opt.price}
                                    onChange={(e) => {
                                      const newGroups = [...watchedModifierGroups];
                                      if (newGroups[gIdx]?.options?.[oIdx]) {
                                        newGroups[gIdx].options[oIdx].price = Number(e.target.value) || 0;
                                        setValue('modifierGroups', newGroups);
                                      }
                                    }}
                                    className="h-7 text-xs font-semibold"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveModifierOptionFromGroup(gIdx, oIdx)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddModifierOptionToGroup(gIdx)}
                              className="h-6 px-2 text-[11px] text-primary hover:text-primary gap-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Tambah Pilihan</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Dialog Footer */}
          <DialogFooter className="p-4 pt-3 border-t bg-muted/20 flex flex-row items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isCompressing}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="font-bold cursor-pointer"
            >
              {isSubmitting
                ? 'Menyimpan...'
                : productToEdit
                ? 'Simpan Perubahan'
                : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
