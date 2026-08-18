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
  TrendingUp,
  SlidersHorizontal,
  Zap,
  Wand2,
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
import type { Product, ProductType, ProductVariantDimension } from '@/types/product.types';

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
  const [isAdvanceMode, setIsAdvanceMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'variants' | 'modifiers'>('basic');

  // Dimensions for up to 3-level variants
  const [dimensions, setDimensions] = useState<ProductVariantDimension[]>([]);
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [bulkCostPrice, setBulkCostPrice] = useState<number>(0);
  const [bulkStock, setBulkStock] = useState<number>(10);

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
      variantDimensions: [],
      variants: [],
      modifierGroups: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    replace: replaceVariants,
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
  const currentPrice = Number(watch('price')) || 0;
  const currentCostPrice = Number(watch('costPrice')) || 0;
  const watchedModifierGroups = watch('modifierGroups') || [];
  const watchedVariants = watch('variants') || [];

  // Calculate profit margin in real-time
  const profit = currentPrice - currentCostPrice;
  const marginPercentage = currentPrice > 0 ? ((profit / currentPrice) * 100).toFixed(1) : '0';

  useEffect(() => {
    if (open) {
      setActiveTab('basic');
      if (productToEdit) {
        const hasAdvancedData = Boolean(
          (productToEdit.variants && productToEdit.variants.length > 0) ||
          (productToEdit.modifierGroups && productToEdit.modifierGroups.length > 0) ||
          (productToEdit.variantDimensions && productToEdit.variantDimensions.length > 0) ||
          productToEdit.sku ||
          productToEdit.barcode ||
          productToEdit.description
        );
        setIsAdvanceMode(hasAdvancedData);
        setDimensions(productToEdit.variantDimensions || []);

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
          variantDimensions: productToEdit.variantDimensions || [],
          variants: productToEdit.variants || [],
          modifierGroups: productToEdit.modifierGroups || [],
        });
      } else {
        setIsAdvanceMode(false);
        setDimensions([]);
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
          variantDimensions: [],
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setValue('imageUrl', '', { shouldValidate: true });
  };

  // Dimension Handlers for Multi-Level Variant
  const handleAddDimension = () => {
    if (dimensions.length >= 3) return;
    const newDim: ProductVariantDimension = {
      id: generateUUID(),
      name: dimensions.length === 0 ? 'Ukuran' : dimensions.length === 1 ? 'Warna' : 'Bahan',
      options: [],
    };
    const updated = [...dimensions, newDim];
    setDimensions(updated);
    setValue('variantDimensions', updated);
  };

  const handleRemoveDimension = (index: number) => {
    const updated = dimensions.filter((_, i) => i !== index);
    setDimensions(updated);
    setValue('variantDimensions', updated);
  };

  const handleUpdateDimensionName = (index: number, name: string) => {
    const updated = [...dimensions];
    updated[index].name = name;
    setDimensions(updated);
    setValue('variantDimensions', updated);
  };

  const handleAddDimensionOption = (index: number, optionStr: string) => {
    const trimmed = optionStr.trim();
    if (!trimmed) return;
    const updated = [...dimensions];
    if (!updated[index].options.includes(trimmed)) {
      updated[index].options.push(trimmed);
      setDimensions(updated);
      setValue('variantDimensions', updated);
    }
  };

  const handleRemoveDimensionOption = (dimIndex: number, optIndex: number) => {
    const updated = [...dimensions];
    updated[dimIndex].options = updated[dimIndex].options.filter((_, i) => i !== optIndex);
    setDimensions(updated);
    setValue('variantDimensions', updated);
  };

  // Generate Cartesian Combinations of Dimensions
  const handleGenerateMatrix = () => {
    const validDims = dimensions.filter((d) => d.name.trim() && d.options.length > 0);
    if (validDims.length === 0) return;

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
        [[]]
      );
    };

    const combinations = cartesian(validDims.map((d) => d.options));
    const basePrice = Number(watch('price')) || 0;
    const baseCostPrice = Number(watch('costPrice')) || 0;
    const baseStock = Number(watch('stock')) || 10;

    const newVariants = combinations.map((combo) => {
      const name = combo.join(' / ');
      const existing = (watchedVariants || []).find((v) => v.name === name);

      return {
        id: existing?.id || generateUUID(),
        name,
        price: existing ? existing.price : basePrice,
        costPrice: existing ? existing.costPrice : baseCostPrice,
        stock: existing ? existing.stock : baseStock,
        minStock: existing?.minStock ?? 5,
        sku: existing?.sku || '',
        barcode: existing?.barcode || '',
      };
    });

    replaceVariants(newVariants);
  };

  const handleApplyBulkValues = () => {
    const updated = watchedVariants.map((v) => ({
      ...v,
      price: bulkPrice > 0 ? bulkPrice : v.price,
      costPrice: bulkCostPrice > 0 ? bulkCostPrice : v.costPrice,
      stock: bulkStock >= 0 ? bulkStock : v.stock,
    }));
    replaceVariants(updated);
  };

  const onSubmit = async (data: ProductFormInput) => {
    try {
      // Clean up variants and modifiers
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

      const validDimensions = dimensions.filter((d) => d.name.trim() && d.options.length > 0);

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
        variantDimensions: validDimensions.length > 0 ? validDimensions : undefined,
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
      <DialogContent className="sm:max-w-2xl h-[85vh] max-h-[680px] min-h-[520px] flex flex-col p-0 gap-0 overflow-hidden shadow-xl">
        {/* Sticky Header */}
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold">
              {productToEdit ? 'Edit Data Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAdvanceMode
                ? 'Mode Lengkap: Kelola varian multi-level, modifier, barcode & batas stok.'
                : 'Mode Sederhana: Isi kolom penting untuk langsung mulai jualan.'}
            </DialogDescription>
          </div>

          {/* Mode Switch Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdvanceMode(!isAdvanceMode)}
            className={`h-8 px-3 text-xs gap-1.5 font-bold transition-colors cursor-pointer ${
              isAdvanceMode
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {isAdvanceMode ? <Zap className="h-3.5 w-3.5 text-primary" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
            <span>{isAdvanceMode ? 'Mode Lengkap' : 'Mode Sederhana'}</span>
          </Button>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {!isAdvanceMode ? (
            /* =========================================================
               MODE SEDERHANA (SIMPLE MODE) - ZERO CLUTTER SINGLE SCREEN
               ========================================================= */
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              {/* Product Type Pills */}
              <div className="flex items-center gap-2 pb-1">
                <span className="text-xs font-bold text-muted-foreground mr-1">Jenis Usaha:</span>
                {[
                  { type: 'RETAIL', label: 'Toko / Retail', icon: Package },
                  { type: 'FNB', label: 'Kuliner / F&B', icon: Coffee },
                  { type: 'SERVICE', label: 'Jasa / Servis', icon: Scissors },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue('productType', type as any)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      currentProductType === type
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Nama Produk */}
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="simple-product-name" className="text-xs font-bold">
                  Nama Produk *
                </FieldLabel>
                <Input
                  id="simple-product-name"
                  placeholder="Contoh: Es Kopi Susu Aren / Kaos Polos Hitam"
                  {...register('name')}
                  aria-invalid={Boolean(errors.name)}
                  className="h-10 text-sm"
                  autoFocus
                />
                <FieldError errors={[{ message: errors.name?.message }]} />
              </Field>

              {/* Kategori & Sub-Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field data-invalid={Boolean(errors.category)}>
                  <FieldLabel htmlFor="simple-product-category" className="text-xs font-bold">
                    Kategori Produk *
                  </FieldLabel>
                  <Input
                    id="simple-product-category"
                    placeholder="Contoh: Minuman / Pakaian"
                    {...register('category')}
                    aria-invalid={Boolean(errors.category)}
                    className="h-9 text-sm"
                  />
                  <FieldError errors={[{ message: errors.category?.message }]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="simple-product-unit" className="text-xs font-bold flex items-center justify-between">
                    <span>Satuan Unit (UOM) *</span>
                    <span className="text-[10px] text-muted-foreground font-normal">pcs, cup, porsi</span>
                  </FieldLabel>
                  <Input
                    id="simple-product-unit"
                    placeholder="pcs"
                    {...register('unit')}
                    className="h-9 text-sm"
                  />
                </Field>
              </div>

              {/* Quick Category & Unit Presets */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Kategori:</span>
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

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Satuan:</span>
                  {QUICK_UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setValue('unit', u, { shouldValidate: true })}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors cursor-pointer"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Field data-invalid={Boolean(errors.price)}>
                  <FieldLabel className="text-xs font-bold text-primary">
                    Harga Jual Pelanggan *
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="price"
                    render={({ field }) => (
                      <CurrencyInput
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="0"
                        className="h-10 text-sm font-bold text-primary border-primary/40 focus-visible:ring-primary"
                      />
                    )}
                  />
                  <FieldError errors={[{ message: errors.price?.message }]} />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Harga Modal HPP (Opsional)</FieldLabel>
                  <Controller
                    control={control}
                    name="costPrice"
                    render={({ field }) => (
                      <CurrencyInput
                        value={field.value || 0}
                        onValueChange={field.onChange}
                        placeholder="0"
                        className="h-10 text-sm"
                      />
                    )}
                  />
                </Field>
              </div>

              {/* Stock Quantity */}
              {currentProductType !== 'SERVICE' && (
                <Field data-invalid={Boolean(errors.stock)}>
                  <FieldLabel htmlFor="simple-product-stock" className="text-xs font-bold">
                    Jumlah Stok Sekarang ({watch('unit') || 'pcs'}) *
                  </FieldLabel>
                  <Input
                    id="simple-product-stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register('stock')}
                    aria-invalid={Boolean(errors.stock)}
                    className="h-10 text-sm font-mono"
                  />
                  <FieldError errors={[{ message: errors.stock?.message }]} />
                </Field>
              )}

              {/* Foto Produk */}
              <Field>
                <FieldLabel className="text-xs font-bold">Foto Produk (Opsional)</FieldLabel>
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
                      <p className="text-xs font-semibold text-foreground">Foto Produk Tersimpan</p>
                      <p className="text-[11px] text-muted-foreground">Otomatis teroptimasi format WebP</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="w-full h-14 border-dashed border-2 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
                  >
                    {isCompressing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{isCompressing ? 'Mengompres Foto...' : 'Upload Foto Produk'}</span>
                  </Button>
                )}
              </Field>

              {/* Quick Profit Indicator */}
              {currentPrice > 0 && currentCostPrice > 0 && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-foreground">Estimasi Laba Kotor</p>
                      <p className="text-muted-foreground text-[11px]">Margin {marginPercentage}% per transaksi</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    +{formatCurrency(profit)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* =========================================================
               MODE LENGKAP / ADVANCE (TABS, 3-LEVEL VARIANTS, MODIFIERS)
               ========================================================= */
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as any)}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {/* Tabs Bar */}
              <div className="px-6 pt-2 border-b bg-card shrink-0">
                <TabsList className="grid grid-cols-4 w-full h-10">
                  <TabsTrigger value="basic" className="text-xs gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Identitas</span>
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="text-xs gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Harga & Stok</span>
                  </TabsTrigger>
                  <TabsTrigger value="variants" className="text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Varian (3 Level)</span>
                  </TabsTrigger>
                  <TabsTrigger value="modifiers" className="text-xs gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Identitas */}
              <TabsContent value="basic" className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0">
                {/* Product Type Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground mr-1">Tipe:</span>
                  {[
                    { type: 'RETAIL', label: 'Toko / Retail', icon: Package },
                    { type: 'FNB', label: 'Kuliner / F&B', icon: Coffee },
                    { type: 'SERVICE', label: 'Jasa / Servis', icon: Scissors },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('productType', type as any)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        currentProductType === type
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 text-muted-foreground border-border'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="adv-product-name" className="text-xs font-bold">
                    Nama Produk *
                  </FieldLabel>
                  <Input
                    id="adv-product-name"
                    placeholder="Nama produk"
                    {...register('name')}
                    className="h-10 text-sm"
                  />
                  <FieldError errors={[{ message: errors.name?.message }]} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field data-invalid={Boolean(errors.category)}>
                    <FieldLabel htmlFor="adv-product-category" className="text-xs font-bold">
                      Kategori Produk *
                    </FieldLabel>
                    <Input
                      id="adv-product-category"
                      placeholder="Kategori"
                      {...register('category')}
                      className="h-9 text-sm"
                    />
                    <FieldError errors={[{ message: errors.category?.message }]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="adv-product-unit" className="text-xs font-bold">
                      Satuan Unit (UOM) *
                    </FieldLabel>
                    <Input
                      id="adv-product-unit"
                      placeholder="pcs"
                      {...register('unit')}
                      className="h-9 text-sm"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="adv-product-sku" className="text-xs font-bold">SKU Produk</FieldLabel>
                    <Input id="adv-product-sku" placeholder="Contoh: KOP-001" {...register('sku')} className="h-9 text-sm" />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="adv-product-barcode" className="text-xs font-bold">Barcode</FieldLabel>
                    <Input id="adv-product-barcode" placeholder="Contoh: 89912345678" {...register('barcode')} className="h-9 text-sm" />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="adv-product-desc" className="text-xs font-bold">Deskripsi Produk</FieldLabel>
                  <Input id="adv-product-desc" placeholder="Rincian deskripsi produk..." {...register('description')} className="h-9 text-sm" />
                </Field>

                {/* Foto Upload */}
                <Field>
                  <FieldLabel className="text-xs font-bold">Foto Produk</FieldLabel>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {currentImageUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border">
                      <img src={currentImageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
                      <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage} className="text-destructive h-8 text-xs">
                        Hapus
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full h-12 border-dashed text-xs gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>Upload Foto</span>
                    </Button>
                  )}
                </Field>
              </TabsContent>

              {/* Tab 2: Harga & Stok */}
              <TabsContent value="pricing" className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field data-invalid={Boolean(errors.price)}>
                    <FieldLabel className="text-xs font-bold text-primary">Harga Jual Dasar *</FieldLabel>
                    <Controller
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <CurrencyInput
                          value={field.value}
                          onValueChange={field.onChange}
                          className="h-10 text-sm font-bold text-primary"
                        />
                      )}
                    />
                    <FieldError errors={[{ message: errors.price?.message }]} />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-bold">Harga Modal HPP</FieldLabel>
                    <Controller
                      control={control}
                      name="costPrice"
                      render={({ field }) => (
                        <CurrencyInput
                          value={field.value || 0}
                          onValueChange={field.onChange}
                          className="h-10 text-sm"
                        />
                      )}
                    />
                  </Field>
                </div>

                {currentProductType !== 'SERVICE' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field data-invalid={Boolean(errors.stock)}>
                      <FieldLabel htmlFor="adv-product-stock" className="text-xs font-bold">Stok Dasar *</FieldLabel>
                      <Input id="adv-product-stock" type="number" min="0" {...register('stock')} className="h-10 text-sm font-mono" />
                      <FieldError errors={[{ message: errors.stock?.message }]} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="adv-product-minstock" className="text-xs font-bold">Batas Minimum Alert Stok</FieldLabel>
                      <Input id="adv-product-minstock" type="number" min="0" {...register('minStock')} className="h-10 text-sm font-mono" />
                    </Field>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Multi-Level Variants (Hingga 3 Level) */}
              <TabsContent value="variants" className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Definisi Atribut Dimensi (Maks 3 Tingkat)</p>
                    <p className="text-[11px] text-muted-foreground">Contoh Tingkat 1: Ukuran, Tingkat 2: Warna, Tingkat 3: Bahan.</p>
                  </div>
                  {dimensions.length < 3 && (
                    <Button type="button" variant="outline" size="sm" onClick={handleAddDimension} className="text-xs h-8 gap-1">
                      <Plus className="h-3 w-3" />
                      <span>Tambah Tingkat Dimensi</span>
                    </Button>
                  )}
                </div>

                {/* Dimension Rows */}
                {dimensions.map((dim, dimIdx) => (
                  <div key={dim.id} className="p-3 bg-muted/40 rounded-xl border space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-primary">Tingkat {dimIdx + 1}:</span>
                        <Input
                          value={dim.name}
                          onChange={(e) => handleUpdateDimensionName(dimIdx, e.target.value)}
                          placeholder="Nama Dimensi (Ukuran / Warna / dll)"
                          className="h-8 text-xs max-w-[180px] bg-background font-semibold"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDimension(dimIdx)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Options Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {dim.options.map((opt, optIdx) => (
                        <span key={optIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-background border text-xs font-medium">
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDimensionOption(dimIdx, optIdx)}
                            className="text-muted-foreground hover:text-destructive ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {/* Add Option Input */}
                      <input
                        type="text"
                        placeholder="+ Ketik opsi lalu Tekan Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDimensionOption(dimIdx, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="h-7 text-xs px-2 rounded-md border border-dashed bg-background/50 focus:bg-background outline-none w-48"
                      />
                    </div>
                  </div>
                ))}

                {/* Generate Matrix Button */}
                {dimensions.some((d) => d.options.length > 0) && (
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-foreground">Hasilkan Kombinasi Varian Otomatis</p>
                    </div>
                    <Button type="button" size="sm" onClick={handleGenerateMatrix} className="text-xs h-8 gap-1.5 font-bold">
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Buat Matriks Varian</span>
                    </Button>
                  </div>
                )}

                {/* Variants Table */}
                {variantFields.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">Daftar Kombinasi Varian ({variantFields.length})</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendVariant({
                            id: generateUUID(),
                            name: `Varian #${variantFields.length + 1}`,
                            price: currentPrice,
                            costPrice: currentCostPrice,
                            stock: 10,
                            minStock: 5,
                          })
                        }
                        className="text-xs h-7 gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tambah Manual</span>
                      </Button>
                    </div>

                    {/* Bulk Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 p-2.5 bg-muted/40 rounded-lg border text-xs">
                      <span className="font-bold text-muted-foreground mr-1">Terapkan Massal:</span>
                      <Input
                        type="number"
                        placeholder="Harga"
                        onChange={(e) => setBulkPrice(Number(e.target.value))}
                        className="h-7 w-24 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="HPP"
                        onChange={(e) => setBulkCostPrice(Number(e.target.value))}
                        className="h-7 w-20 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Stok"
                        onChange={(e) => setBulkStock(Number(e.target.value))}
                        className="h-7 w-16 text-xs"
                      />
                      <Button type="button" size="sm" variant="secondary" onClick={handleApplyBulkValues} className="h-7 px-2 text-xs font-semibold">
                        Terapkan ke Semua
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {variantFields.map((field, idx) => (
                        <div key={field.id} className="p-2.5 bg-card rounded-lg border flex items-center gap-2 text-xs">
                          <Input
                            {...register(`variants.${idx}.name` as const)}
                            placeholder="Nama Varian"
                            className="h-8 text-xs font-semibold flex-1 min-w-[120px]"
                          />
                          <div className="w-28">
                            <Controller
                              control={control}
                              name={`variants.${idx}.price` as const}
                              render={({ field: f }) => (
                                <CurrencyInput
                                  value={f.value}
                                  onValueChange={f.onChange}
                                  placeholder="Harga"
                                  className="h-8 text-xs font-bold text-primary"
                                />
                              )}
                            />
                          </div>
                          <div className="w-24">
                            <Controller
                              control={control}
                              name={`variants.${idx}.costPrice` as const}
                              render={({ field: f }) => (
                                <CurrencyInput
                                  value={f.value || 0}
                                  onValueChange={f.onChange}
                                  placeholder="HPP"
                                  className="h-8 text-xs"
                                />
                              )}
                            />
                          </div>
                          <Input
                            type="number"
                            {...register(`variants.${idx}.stock` as const)}
                            placeholder="Stok"
                            className="h-8 w-16 text-xs font-mono"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(idx)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 4: Modifiers */}
              <TabsContent value="modifiers" className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Grup Modifier & Topping</p>
                    <p className="text-[11px] text-muted-foreground">Tambahan pilihan seperti ekstra boba, level gula, topping keju.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendModifierGroup({
                        id: generateUUID(),
                        name: 'Topping Tambahan',
                        required: false,
                        maxSelect: 1,
                        options: [{ id: generateUUID(), name: 'Opsi 1', price: 3000 }],
                      })
                    }
                    className="text-xs h-8 gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Grup Modifier</span>
                  </Button>
                </div>

                {modifierGroupFields.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground text-xs">
                    Belum ada grup modifier. Klik tombol di atas untuk menambahkan.
                  </div>
                ) : (
                  modifierGroupFields.map((groupField, gIdx) => (
                    <div key={groupField.id} className="p-3.5 bg-muted/30 rounded-xl border space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          {...register(`modifierGroups.${gIdx}.name` as const)}
                          placeholder="Nama Grup Modifier"
                          className="h-8 text-xs font-bold flex-1 bg-background"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeModifierGroup(gIdx)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Modifier Options List */}
                      <div className="space-y-1.5 pl-2 border-l-2 border-primary/30">
                        {(watchedModifierGroups[gIdx]?.options || []).map((_, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <Input
                              {...register(`modifierGroups.${gIdx}.options.${optIdx}.name` as const)}
                              placeholder="Nama Opsi"
                              className="h-7 text-xs bg-background flex-1"
                            />
                            <div className="w-28">
                              <Controller
                                control={control}
                                name={`modifierGroups.${gIdx}.options.${optIdx}.price` as const}
                                render={({ field: f }) => (
                                  <CurrencyInput
                                    value={f.value}
                                    onValueChange={f.onChange}
                                    placeholder="+Harga"
                                    className="h-7 text-xs"
                                  />
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentOpts = [...(watchedModifierGroups[gIdx]?.options || [])];
                                currentOpts.splice(optIdx, 1);
                                setValue(`modifierGroups.${gIdx}.options`, currentOpts);
                              }}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentOpts = [...(watchedModifierGroups[gIdx]?.options || [])];
                            currentOpts.push({ id: generateUUID(), name: '', price: 0 });
                            setValue(`modifierGroups.${gIdx}.options`, currentOpts);
                          }}
                          className="h-6 px-2 text-[11px] text-primary gap-1 cursor-pointer"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          <span>Tambah Opsi</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Sticky Footer */}
          <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold gap-2 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : productToEdit ? 'Simpan Perubahan' : 'Simpan Produk'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
