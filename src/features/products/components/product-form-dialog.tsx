import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Package,
  Coffee,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Tag,
  Barcode,
  TrendingUp,
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
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { productFormSchema, type ProductFormInput } from '../types/product-form.types';
import { useUpsertProduct } from '../hooks/use-products';
import { compressImageToWebP } from '@/utils/image-compressor';
import { formatCurrency } from '@/utils/format-currency';
import { generateUUID } from '@/utils/uuid';
import type { Product, ProductType } from '@/types/product.types';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
}

const QUICK_CATEGORIES = ['Minuman', 'Makanan', 'Retail', 'Pakaian', 'Elektronik', 'Jasa / Servis'];
const QUICK_UNITS = ['pcs', 'porsi', 'cup', 'box', 'botol', 'pack', 'kg', 'liter', 'sesi'];

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
      unit: 'pcs',
      productType: 'RETAIL',
      subType: '',
      price: 0,
      costPrice: 0,
      stock: 0,
      minStock: 5,
      sku: '',
      barcode: '',
      description: '',
      imageUrl: '',
      isActive: true,
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
  const currentIsActive = watch('isActive');
  const currentPrice = Number(watch('price')) || 0;
  const currentCostPrice = Number(watch('costPrice')) || 0;
  const watchedModifierGroups = watch('modifierGroups') || [];

  // Calculate profit margin in real-time
  const profit = currentPrice - currentCostPrice;
  const marginPercentage = currentPrice > 0 ? ((profit / currentPrice) * 100).toFixed(1) : '0';

  useEffect(() => {
    if (open) {
      setActiveTab('basic');
      if (productToEdit) {
        reset({
          name: productToEdit.name,
          category: productToEdit.category || '',
          unit: productToEdit.unit || 'pcs',
          productType: productToEdit.productType || 'RETAIL',
          subType: productToEdit.subType || '',
          price: productToEdit.price,
          costPrice: productToEdit.costPrice || 0,
          stock: productToEdit.stock,
          minStock: productToEdit.minStock ?? 5,
          sku: productToEdit.sku || '',
          barcode: productToEdit.barcode || '',
          description: productToEdit.description || '',
          imageUrl: productToEdit.imageUrl || '',
          isActive: productToEdit.isActive !== false,
          variants: productToEdit.variants || [],
          modifierGroups: productToEdit.modifierGroups || [],
        });
      } else {
        reset({
          name: '',
          category: '',
          unit: 'pcs',
          productType: 'RETAIL',
          subType: '',
          price: 0,
          costPrice: 0,
          stock: 0,
          minStock: 5,
          sku: '',
          barcode: '',
          description: '',
          imageUrl: '',
          isActive: true,
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
      sku: '',
      barcode: '',
      price: currentPrice || 0,
      costPrice: currentCostPrice || 0,
      stock: Number(watch('stock')) || 0,
      minStock: 5,
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
          barcode: v.barcode?.trim() || undefined,
          price: Number(v.price),
          costPrice: v.costPrice ? Number(v.costPrice) : undefined,
          stock: Number(v.stock),
          minStock: v.minStock ? Number(v.minStock) : 5,
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
        unit: data.unit?.trim() || 'pcs',
        productType: data.productType as ProductType,
        subType: data.subType?.trim() || undefined,
        price: Number(data.price),
        costPrice: data.costPrice ? Number(data.costPrice) : undefined,
        stock: data.productType === 'SERVICE' ? 999999 : Number(data.stock),
        minStock: data.minStock ? Number(data.minStock) : 5,
        sku: data.sku?.trim() || undefined,
        barcode: data.barcode?.trim() || undefined,
        description: data.description?.trim() || undefined,
        imageUrl: data.imageUrl || undefined,
        isActive: data.isActive !== false,
        variants: cleanVariants.length > 0 ? cleanVariants : undefined,
        modifierGroups: cleanModifierGroups.length > 0 ? cleanModifierGroups : undefined,
      });

      onOpenChange(false);
    } catch (err) {
      console.error('Failed to upsert product:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b bg-card">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">
                {productToEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {productToEdit
                  ? 'Perbarui rincian tipe, harga, varian, dan stok katalog produk.'
                  : 'Lengkapi identitas produk, tipe sistem, harga modal, varian, dan modifier.'}
              </DialogDescription>
            </div>
            {/* Active Status Badge Toggle */}
            <button
              type="button"
              onClick={() => setValue('isActive', !currentIsActive)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentIsActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              {currentIsActive ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Aktif Dijual</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Non-aktif</span>
                </>
              )}
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-5 pt-3 border-b bg-muted/20">
              <TabsList className="grid grid-cols-4 w-full h-10">
                <TabsTrigger value="basic" className="text-xs font-semibold gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  <span>1. Identitas</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs font-semibold gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>2. Harga & Stok</span>
                </TabsTrigger>
                <TabsTrigger value="variants" className="text-xs font-semibold gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>3. Varian ({variantFields.length})</span>
                </TabsTrigger>
                <TabsTrigger value="modifiers" className="text-xs font-semibold gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>4. Modifier ({modifierGroupFields.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* TAB 1: IDENTITAS & TIPE PRODUK */}
              <TabsContent value="basic" className="space-y-4 m-0">
                {/* 1. Tipe Produk (Pembeda Sistem) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Tipe Produk (Pembeda Sistem) *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Retail Option */}
                    <button
                      type="button"
                      onClick={() => setValue('productType', 'RETAIL')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                        currentProductType === 'RETAIL'
                          ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                          : 'border-border hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Produk Fisik (Retail)</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Barang berwujud, stok berkurang otomatis setiap terjual.
                      </p>
                    </button>

                    {/* F&B Option */}
                    <button
                      type="button"
                      onClick={() => setValue('productType', 'FNB')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                        currentProductType === 'FNB'
                          ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                          : 'border-border hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <Coffee className="h-4 w-4 text-primary" />
                        <span>Olahan (F&B)</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Dibuat langsung saat dipesan dengan pilihan varian & topping.
                      </p>
                    </button>

                    {/* Service Option */}
                    <button
                      type="button"
                      onClick={() => setValue('productType', 'SERVICE')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                        currentProductType === 'SERVICE'
                          ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                          : 'border-border hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <Scissors className="h-4 w-4 text-primary" />
                        <span>Non-Fisik (Jasa)</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Layanan/jasa tanpa batasan stok inventaris fisik.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Nama Produk */}
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="product-name" className="text-xs font-bold">
                    Nama Produk *
                  </FieldLabel>
                  <Input
                    id="product-name"
                    placeholder="Contoh: Kopi Susu Gula Aren / Kemeja Flanel"
                    {...register('name')}
                    aria-invalid={Boolean(errors.name)}
                    className="h-10 text-sm"
                  />
                  <FieldError errors={[{ message: errors.name?.message }]} />
                </Field>

                {/* 3. Kategori & Sub-Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field data-invalid={Boolean(errors.category)}>
                    <FieldLabel htmlFor="product-category" className="text-xs font-bold">
                      Kategori Produk *
                    </FieldLabel>
                    <Input
                      id="product-category"
                      placeholder="Contoh: Minuman / Pakaian"
                      {...register('category')}
                      aria-invalid={Boolean(errors.category)}
                      className="h-9 text-sm"
                    />
                    <FieldError errors={[{ message: errors.category?.message }]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="product-subtype" className="text-xs font-bold">
                      Sub-Kategori (Opsional)
                    </FieldLabel>
                    <Input
                      id="product-subtype"
                      placeholder="Contoh: Kopi / Kaos / Snack"
                      {...register('subType')}
                      className="h-9 text-sm"
                    />
                  </Field>
                </div>

                {/* Quick Category Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Kategori Cepat:</span>
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue('category', cat, { shouldValidate: true })}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* 4. Satuan Unit Produk (Unit of Measure / UOM) */}
                <div className="space-y-1.5 pt-1">
                  <Field data-invalid={Boolean(errors.unit)}>
                    <FieldLabel htmlFor="product-unit" className="text-xs font-bold flex items-center justify-between">
                      <span>Satuan Unit Produk (UOM) *</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Contoh: pcs, porsi, cup, box, kg</span>
                    </FieldLabel>
                    <Input
                      id="product-unit"
                      placeholder="pcs"
                      {...register('unit')}
                      className="h-9 text-sm"
                    />
                  </Field>

                  {/* Quick Unit Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] text-muted-foreground mr-1">Satuan Cepat:</span>
                    {QUICK_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setValue('unit', u, { shouldValidate: true })}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                          watch('unit') === u
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Foto Produk (WebP Upload) */}
                <Field>
                  <FieldLabel className="text-xs font-bold">Foto Produk (WebP Otomatis)</FieldLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {currentImageUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/80">
                      <img
                        src={currentImageUrl}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-lg border shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">Foto Produk Terpasang</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Telah dioptimasi ke WebP (&lt;100KB) untuk performa instan offline.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center"
                    >
                      {isCompressing ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {isCompressing ? 'Mengompres Foto...' : 'Klik untuk Unggah Foto Produk'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Format PNG, JPG, WebP otomatis dikompresi ringan untuk IndexedDB.
                        </p>
                      </div>
                    </div>
                  )}
                </Field>

                {/* 5. Deskripsi Produk */}
                <Field>
                  <FieldLabel htmlFor="product-desc" className="text-xs font-bold">
                    Deskripsi Singkat (Opsional)
                  </FieldLabel>
                  <textarea
                    id="product-desc"
                    rows={2}
                    placeholder="Catatan komposisi atau rincian spesifikasi barang..."
                    {...register('description')}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </Field>
              </TabsContent>

              {/* TAB 2: HARGA, MODAL & STOK */}
              <TabsContent value="pricing" className="space-y-4 m-0">
                {/* Profit Margin Insight Banner */}
                <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Estimasi Keuntungan Bersih</p>
                      <p className="text-[11px] text-muted-foreground">
                        Harga Jual ({formatCurrency(currentPrice)}) - Modal ({formatCurrency(currentCostPrice)})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-extrabold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                      {formatCurrency(profit)}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Margin: {marginPercentage}%
                    </p>
                  </div>
                </div>

                {/* Harga Jual & Harga Modal (HPP) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field data-invalid={Boolean(errors.price)}>
                    <FieldLabel htmlFor="product-price" className="text-xs font-bold">
                      Harga Jual Pelanggan *
                    </FieldLabel>
                    <Controller
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <CurrencyInput
                          id="product-price"
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="0"
                          aria-invalid={Boolean(errors.price)}
                          className="h-10 text-sm font-bold"
                        />
                      )}
                    />
                    <FieldError errors={[{ message: errors.price?.message }]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.costPrice)}>
                    <FieldLabel htmlFor="product-cost-price" className="text-xs font-bold">
                      Harga Modal (HPP / COGS)
                    </FieldLabel>
                    <Controller
                      control={control}
                      name="costPrice"
                      render={({ field }) => (
                        <CurrencyInput
                          id="product-cost-price"
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="0"
                          className="h-10 text-sm"
                        />
                      )}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Untuk menghitung laporan laba kotor dan margin penjualan.
                    </p>
                  </Field>
                </div>

                {/* Stok & Batas Stok Menipis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                  <Field data-invalid={Boolean(errors.stock)}>
                    <FieldLabel htmlFor="product-stock" className="text-xs font-bold flex items-center justify-between">
                      <span>Jumlah Stok Tersedia *</span>
                      {currentProductType === 'SERVICE' && (
                        <span className="text-[10px] text-primary font-normal">Tipe Jasa: Tidak Terbatas</span>
                      )}
                    </FieldLabel>
                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={currentProductType === 'SERVICE'}
                      {...register('stock')}
                      aria-invalid={Boolean(errors.stock)}
                      className="h-10 text-sm font-bold"
                    />
                    <FieldError errors={[{ message: errors.stock?.message }]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="product-min-stock" className="text-xs font-bold">
                      Batas Peringatan Stok Menipis
                    </FieldLabel>
                    <Input
                      id="product-min-stock"
                      type="number"
                      min="0"
                      placeholder="5"
                      disabled={currentProductType === 'SERVICE'}
                      {...register('minStock')}
                      className="h-10 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Sistem akan memberi tanda warna oranye/merah saat stok &le; angka ini.
                    </p>
                  </Field>
                </div>

                {/* SKU & Barcode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                  <Field>
                    <FieldLabel htmlFor="product-sku" className="text-xs font-bold flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span>Kode SKU (Pelacakan)</span>
                    </FieldLabel>
                    <Input
                      id="product-sku"
                      placeholder="Contoh: KPS-REG-01"
                      {...register('sku')}
                      className="h-9 text-sm font-mono uppercase"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="product-barcode" className="text-xs font-bold flex items-center gap-1.5">
                      <Barcode className="h-3.5 w-3.5 text-primary" />
                      <span>Kode Barcode (Scan Retail)</span>
                    </FieldLabel>
                    <Input
                      id="product-barcode"
                      placeholder="Contoh: 899276100123"
                      {...register('barcode')}
                      className="h-9 text-sm font-mono"
                    />
                  </Field>
                </div>
              </TabsContent>

              {/* TAB 3: VARIAN PRODUK */}
              <TabsContent value="variants" className="space-y-4 m-0">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/80">
                  <div>
                    <p className="text-xs font-bold text-foreground">Satu Produk, Banyak Pilihan Varian</p>
                    <p className="text-[11px] text-muted-foreground">
                      Contoh: Ukuran S, M, L / Panas, Dingin / Warna Merah, Hitam dengan harga & stok tersendiri.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVariantOption}
                    className="gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Varian</span>
                  </Button>
                </div>

                {variantFields.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-border/80 rounded-xl space-y-2">
                    <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-bold text-foreground">Belum Ada Varian</p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Jika produk ini dijual dalam satu jenis standar saja, Anda dapat melewati tab varian ini.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVariantOption}
                      className="text-xs gap-1.5 mt-2 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Buat Varian Pertama</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variantFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-3.5 bg-card rounded-xl border border-border/80 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b">
                          <span className="text-xs font-bold text-primary">
                            Varian #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            className="h-6 px-2 text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            <span>Hapus</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-foreground">
                              Nama Varian *
                            </label>
                            <Input
                              placeholder="Contoh: Ukuran L / Panas / Merah"
                              {...register(`variants.${index}.name` as const)}
                              className="h-8 text-xs mt-1"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-foreground">
                              Harga Jual Varian *
                            </label>
                            <Controller
                              control={control}
                              name={`variants.${index}.price` as const}
                              render={({ field }) => (
                                <CurrencyInput
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder="0"
                                  className="h-8 text-xs font-bold mt-1"
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground">
                              Modal HPP
                            </label>
                            <Controller
                              control={control}
                              name={`variants.${index}.costPrice` as const}
                              render={({ field }) => (
                                <CurrencyInput
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder="0"
                                  className="h-7 text-[11px] mt-0.5"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground">
                              Stok Varian
                            </label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...register(`variants.${index}.stock` as const)}
                              className="h-7 text-[11px] font-bold mt-0.5"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground">
                              SKU Varian
                            </label>
                            <Input
                              placeholder="SKU-VAR"
                              {...register(`variants.${index}.sku` as const)}
                              className="h-7 text-[11px] font-mono mt-0.5"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground">
                              Barcode Varian
                            </label>
                            <Input
                              placeholder="Barcode"
                              {...register(`variants.${index}.barcode` as const)}
                              className="h-7 text-[11px] font-mono mt-0.5"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB 4: MODIFIER & TOPPING */}
              <TabsContent value="modifiers" className="space-y-4 m-0">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/80">
                  <div>
                    <p className="text-xs font-bold text-foreground">Modifier, Topping & Kustomisasi Tambahan</p>
                    <p className="text-[11px] text-muted-foreground">
                      Contoh: Topping Boba (+Rp3.000), Level Pedas (Gratis Rp0), Extra Kertas Kado (+Rp5.000).
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddModifierGroup}
                    className="gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Grup Modifier</span>
                  </Button>
                </div>

                {modifierGroupFields.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-border/80 rounded-xl space-y-2">
                    <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-bold text-foreground">Belum Ada Modifier</p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Gunakan modifier jika produk Anda memerlukan opsi kustomisasi tambahan (seperti topping, level kepedasan, atau bungkus kado).
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddModifierGroup}
                      className="text-xs gap-1.5 mt-2 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Buat Grup Modifier Pertama</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modifierGroupFields.map((field, groupIndex) => {
                      const group = watchedModifierGroups[groupIndex] || { options: [] };
                      return (
                        <div
                          key={field.id}
                          className="p-4 bg-card rounded-xl border border-border/80 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b">
                            <span className="text-xs font-bold text-primary">
                              Grup Modifier #{groupIndex + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeModifierGroup(groupIndex)}
                              className="h-6 px-2 text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              <span>Hapus Grup</span>
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-semibold text-foreground">
                                Nama Grup Modifier *
                              </label>
                              <Input
                                placeholder="Contoh: Pilihan Topping / Level Pedas / Packaging"
                                {...register(`modifierGroups.${groupIndex}.name` as const)}
                                className="h-8 text-xs mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-foreground">
                                Tipe Pilihan
                              </label>
                              <select
                                {...register(`modifierGroups.${groupIndex}.maxSelect` as const, {
                                  valueAsNumber: true,
                                })}
                                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <option value={1}>Pilihan Tunggal (Pilih 1 Saja)</option>
                                <option value={5}>Pilihan Bebas (Bisa Banyak)</option>
                              </select>
                            </div>
                          </div>

                          {/* Options in this group */}
                          <div className="space-y-2 pt-2 border-t border-border/60">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-foreground">
                                Opsi Pilihan & Penyesuaian Harga
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddModifierOptionToGroup(groupIndex)}
                                className="h-6 px-2 text-primary hover:bg-primary/10 text-xs cursor-pointer"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                <span>Tambah Opsi</span>
                              </Button>
                            </div>

                            {(group.options || []).map((opt, optIndex) => (
                              <div
                                key={opt.id || optIndex}
                                className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50"
                              >
                                <Input
                                  placeholder="Contoh: Ekstra Keju / Boba / Kertas Kado"
                                  {...register(
                                    `modifierGroups.${groupIndex}.options.${optIndex}.name` as const
                                  )}
                                  className="h-7 text-xs flex-1"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                  <Controller
                                    control={control}
                                    name={
                                      `modifierGroups.${groupIndex}.options.${optIndex}.price` as const
                                    }
                                    render={({ field }) => (
                                      <CurrencyInput
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="0"
                                        className="h-7 w-28 text-xs font-bold"
                                      />
                                    )}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveModifierOptionFromGroup(groupIndex, optIndex)
                                  }
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-card flex-row justify-between sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold gap-1.5 cursor-pointer text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{productToEdit ? 'Simpan Perubahan' : 'Tambah Produk'}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
