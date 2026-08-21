import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  BookmarkPlus,
  Check,
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
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productFormSchema, type ProductFormInput } from '../types/product-form.types';
import { useUpsertProduct } from '../hooks/use-products';
import { useAppMode } from '@/hooks/use-app-mode';
import {
  useMasterCategories,
  useUpsertMasterCategory,
  useMasterUoms,
  useUpsertMasterUom,
  useMasterVariantAttributes,
  useUpsertMasterVariantAttribute,
  useMasterModifierGroups,
  useUpsertMasterModifierGroup,
} from '../hooks/use-master-data';
import { compressImageToWebP } from '@/utils/image-compressor';
import { formatCurrency } from '@/utils/format-currency';
import { generateUUID } from '@/utils/uuid';
import type { Product, ProductVariantDimension } from '@/types/product.types';
import type { MasterVariantAttribute, MasterModifierGroup } from '@/types/master-data.types';

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
  const { isAdvanced: isGlobalAdvanced } = useAppMode();
  const upsertMutation = useUpsertProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isAdvanceMode, setIsAdvanceMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'variants' | 'modifiers'>(
    'basic'
  );

  // Master Data Hooks
  const { data: masterCategories = [] } = useMasterCategories();
  const { data: masterUoms = [] } = useMasterUoms();
  const { data: masterVariantAttributes = [] } = useMasterVariantAttributes();
  const { data: masterModifierGroups = [] } = useMasterModifierGroups();

  const upsertCategoryMutation = useUpsertMasterCategory();
  const upsertUomMutation = useUpsertMasterUom();
  const upsertVariantAttrMutation = useUpsertMasterVariantAttribute();
  const upsertModifierMutation = useUpsertMasterModifierGroup();

  // Inline Quick Creation Modals
  const [isQuickCategoryOpen, setIsQuickCategoryOpen] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [quickCategoryParentId, setQuickCategoryParentId] = useState<string>('NONE');

  const [isQuickUomOpen, setIsQuickUomOpen] = useState(false);
  const [quickUomName, setQuickUomName] = useState('');
  const [quickUomSymbol, setQuickUomSymbol] = useState('');

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
    replace: replaceModifierGroups,
  } = useFieldArray({
    control,
    name: 'modifierGroups',
  });

  // Watchers for dynamic calculations & previews
  const currentCategory = watch('category');
  const currentProductType = watch('productType');
  const currentPrice = watch('price') || 0;
  const currentCostPrice = watch('costPrice') || 0;
  const currentImageUrl = watch('imageUrl');
  const currentUnit = watch('unit') || 'pcs';
  const watchedModifierGroups = watch('modifierGroups') || [];

  // Profit calculation for visual indicator
  const profit = Math.max(0, currentPrice - currentCostPrice);
  const marginPercentage = currentPrice > 0 ? Math.round((profit / currentPrice) * 100) : 0;

  // Master Categories Helpers
  const parentMasterCategories = useMemo(() => {
    return masterCategories.filter((c) => !c.parentId);
  }, [masterCategories]);

  const activeParentCategory = useMemo(() => {
    return parentMasterCategories.find((c) => c.name === currentCategory);
  }, [parentMasterCategories, currentCategory]);

  const availableSubCategories = useMemo(() => {
    if (!activeParentCategory) return [];
    return masterCategories.filter((c) => c.parentId === activeParentCategory.id);
  }, [masterCategories, activeParentCategory]);

  // Sync state on open/edit
  useEffect(() => {
    if (open) {
      if (productToEdit && productToEdit.id) {
        const hasVariants =
          Boolean(productToEdit.variants && productToEdit.variants.length > 0) ||
          Boolean(productToEdit.variantDimensions && productToEdit.variantDimensions.length > 0);
        const hasModifiers = Boolean(
          productToEdit.modifierGroups && productToEdit.modifierGroups.length > 0
        );

        setIsAdvanceMode(hasVariants || hasModifiers || isGlobalAdvanced);
        setActiveTab('basic');

        reset({
          name: productToEdit.name,
          category: productToEdit.category || parentMasterCategories[0]?.name || 'Minuman',
          unit: productToEdit.unit || 'pcs',
          productType: productToEdit.productType || 'RETAIL',
          subType: productToEdit.subType || '',
          price: productToEdit.price,
          costPrice: productToEdit.costPrice || 0,
          stock: productToEdit.stock,
          minStock: productToEdit.minStock || 5,
          sku: productToEdit.sku || '',
          barcode: productToEdit.barcode || '',
          description: productToEdit.description || '',
          imageUrl: productToEdit.imageUrl || '',
          isActive: productToEdit.isActive ?? true,
          variantDimensions: productToEdit.variantDimensions || [],
          variants: productToEdit.variants || [],
          modifierGroups: productToEdit.modifierGroups || [],
        });

        setDimensions(
          productToEdit.variantDimensions && productToEdit.variantDimensions.length > 0
            ? productToEdit.variantDimensions
            : []
        );
      } else {
        setIsAdvanceMode(isGlobalAdvanced);
        setActiveTab('basic');
        reset({
          name: '',
          category: parentMasterCategories[0]?.name || 'Minuman',
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
        setDimensions([]);
      }
    }
  }, [open, productToEdit, reset, parentMasterCategories, isGlobalAdvanced]);

  // Handle Photo WebP compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const webpBase64 = await compressImageToWebP(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
      });
      setValue('imageUrl', webpBase64, { shouldValidate: true });
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

  // Multi-Level Dimension Builders
  const handleAddDimension = () => {
    if (dimensions.length >= 3) return;
    const newDim: ProductVariantDimension = {
      id: generateUUID(),
      name: dimensions.length === 0 ? 'Ukuran' : dimensions.length === 1 ? 'Suhu' : 'Varian',
      options: [],
    };
    setDimensions((prev) => [...prev, newDim]);
  };

  const handleApplyMasterVariantTemplate = (template: MasterVariantAttribute, dimIndex: number) => {
    setDimensions((prev) =>
      prev.map((d, i) =>
        i === dimIndex
          ? {
              ...d,
              name: template.name.replace(/\s*\(.*?\)\s*/g, ''),
              options: [...template.presetOptions],
            }
          : d
      )
    );
  };

  const handleSaveDimensionToMaster = async (dim: ProductVariantDimension) => {
    if (!dim.name.trim() || dim.options.length === 0) return;
    await upsertVariantAttrMutation.mutateAsync({
      name: dim.name.trim(),
      presetOptions: dim.options,
    });
    alert(`Template "${dim.name}" berhasil disimpan ke Master Varian Toko!`);
  };

  const handleRemoveDimension = (index: number) => {
    setDimensions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDimensionName = (index: number, name: string) => {
    setDimensions((prev) => prev.map((d, i) => (i === index ? { ...d, name } : d)));
  };

  const handleAddDimensionOption = (index: number, option: string) => {
    const trimmed = option.trim();
    if (!trimmed) return;
    setDimensions((prev) =>
      prev.map((d, i) =>
        i === index && !d.options.includes(trimmed) ? { ...d, options: [...d.options, trimmed] } : d
      )
    );
  };

  const handleRemoveDimensionOption = (dimIndex: number, optIndex: number) => {
    setDimensions((prev) =>
      prev.map((d, i) =>
        i === dimIndex ? { ...d, options: d.options.filter((_, oi) => oi !== optIndex) } : d
      )
    );
  };

  // Generate Cartesian Product Matrix for up to 3 dimensions
  const handleGenerateMatrix = () => {
    const validDimensions = dimensions.filter((d) => d.name.trim() && d.options.length > 0);
    if (validDimensions.length === 0) return;

    function cartesianProduct(arr: string[][]): string[][] {
      return arr.reduce<string[][]>((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);
    }

    const optionArrays = validDimensions.map((d) => d.options);
    const combinations = cartesianProduct(optionArrays);

    const generatedVariants = combinations.map((combo) => {
      const dimensionValues: Record<string, string> = {};
      validDimensions.forEach((dim, idx) => {
        dimensionValues[dim.name] = combo[idx];
      });

      const variantName = combo.join(' / ');

      return {
        id: generateUUID(),
        name: variantName,
        dimensionValues,
        price: currentPrice > 0 ? currentPrice : 15000,
        costPrice: currentCostPrice > 0 ? currentCostPrice : 0,
        stock: 10,
        minStock: 5,
        sku: '',
        barcode: '',
      };
    });

    replaceVariants(generatedVariants);
    setValue('variantDimensions', validDimensions);
  };

  // Apply Bulk Values to Generated Matrix
  const handleApplyBulkValues = () => {
    const current = watch('variants') || [];
    const updated = current.map((v) => ({
      ...v,
      price: bulkPrice > 0 ? bulkPrice : v.price,
      costPrice: bulkCostPrice > 0 ? bulkCostPrice : v.costPrice,
      stock: bulkStock >= 0 ? bulkStock : v.stock,
    }));
    replaceVariants(updated);
  };

  // Inline Quick Master Category Creation
  const handleSaveQuickCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCategoryName.trim()) return;

    const parent = parentMasterCategories.find((p) => p.id === quickCategoryParentId);

    const created = await upsertCategoryMutation.mutateAsync({
      name: quickCategoryName.trim(),
      parentId: quickCategoryParentId === 'NONE' ? null : quickCategoryParentId,
      parentName: quickCategoryParentId === 'NONE' ? null : parent?.name,
    });

    if (created.parentId) {
      setValue('subType', created.name);
    } else {
      setValue('category', created.name, { shouldValidate: true });
    }

    setQuickCategoryName('');
    setIsQuickCategoryOpen(false);
  };

  // Inline Quick Master UOM Creation
  const handleSaveQuickUom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUomName.trim() || !quickUomSymbol.trim()) return;

    const created = await upsertUomMutation.mutateAsync({
      name: quickUomName.trim(),
      symbol: quickUomSymbol.trim().toLowerCase(),
    });

    setValue('unit', created.symbol, { shouldValidate: true });
    setQuickUomName('');
    setQuickUomSymbol('');
    setIsQuickUomOpen(false);
  };

  // Toggle Master Modifier Attachment
  const handleToggleMasterModifier = (masterMod: MasterModifierGroup) => {
    const currentList = watch('modifierGroups') || [];
    const exists = currentList.some((m) => m.name.toLowerCase() === masterMod.name.toLowerCase());

    if (exists) {
      const filtered = currentList.filter(
        (m) => m.name.toLowerCase() !== masterMod.name.toLowerCase()
      );
      replaceModifierGroups(filtered);
    } else {
      appendModifierGroup({
        id: generateUUID(),
        name: masterMod.name,
        required: Boolean(masterMod.required),
        minSelect: masterMod.minSelect ?? (masterMod.required ? 1 : 0),
        maxSelect: masterMod.maxSelect ?? 1,
        options: masterMod.options.map((opt) => ({
          id: generateUUID(),
          name: opt.name,
          price: opt.price,
        })),
      });
    }
  };

  // Save Modifier Group to Master Store
  const handleSaveModifierToMaster = async (group: any) => {
    if (!group.name?.trim() || !group.options || group.options.length === 0) return;
    await upsertModifierMutation.mutateAsync({
      name: group.name.trim(),
      required: group.required,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      options: group.options.map((o: any) => ({
        id: generateUUID(),
        name: o.name,
        price: o.price,
      })),
    });
    alert(`Grup Modifier "${group.name}" berhasil disimpan ke Master Toko!`);
  };

  // Final Form Submission
  const onSubmit = async (data: ProductFormInput) => {
    try {
      const now = Date.now();

      const productPayload: Product = {
        id: productToEdit?.id || generateUUID(),
        name: data.name.trim(),
        category: data.category.trim(),
        unit: data.unit?.trim() || 'pcs',
        productType: data.productType || 'RETAIL',
        subType: data.subType?.trim() || undefined,
        price: data.price,
        costPrice: data.costPrice || 0,
        stock: data.productType === 'SERVICE' ? 0 : data.stock,
        minStock: data.minStock || 5,
        sku: data.sku?.trim() || undefined,
        barcode: data.barcode?.trim() || undefined,
        description: data.description?.trim() || undefined,
        imageUrl: data.imageUrl || undefined,
        isActive: data.isActive ?? true,
        variantDimensions:
          dimensions.length > 0
            ? dimensions.filter((d) => d.name.trim() && d.options.length > 0)
            : undefined,
        variants:
          data.variants && data.variants.length > 0
            ? data.variants.map((v) => ({
                id: v.id || generateUUID(),
                name: v.name.trim(),
                dimensionValues: v.dimensionValues,
                price: v.price,
                costPrice: v.costPrice || 0,
                stock: data.productType === 'SERVICE' ? 0 : v.stock,
                minStock: v.minStock || 5,
                sku: v.sku?.trim() || undefined,
                barcode: v.barcode?.trim() || undefined,
              }))
            : undefined,
        modifierGroups:
          data.modifierGroups && data.modifierGroups.length > 0
            ? data.modifierGroups.map((g) => ({
                id: g.id || generateUUID(),
                name: g.name.trim(),
                required: Boolean(g.required),
                minSelect: g.minSelect ?? (g.required ? 1 : 0),
                maxSelect: g.maxSelect ?? 1,
                options: g.options.map((opt) => ({
                  id: opt.id || generateUUID(),
                  name: opt.name.trim(),
                  price: opt.price,
                })),
              }))
            : undefined,
        createdAt: productToEdit?.createdAt || now,
        updatedAt: now,
        deletedAt: null,
      };

      await upsertMutation.mutateAsync(productPayload);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[85vh] max-h-[640px] min-h-[500px] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header with Simple vs Advance Mode Toggle */}
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card flex flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-base font-bold">
                {productToEdit ? 'Edit Produk Katalog' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isAdvanceMode
                  ? 'Mode Lengkap: Atur identitas, harga modal HPP, varian multi-level, dan modifier.'
                  : 'Mode Sederhana: Buat produk cepat dalam hitungan detik.'}
              </DialogDescription>
            </div>

            {/* Mode Switcher Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant={isAdvanceMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setIsAdvanceMode(!isAdvanceMode);
                  if (!isAdvanceMode) setActiveTab('basic');
                }}
                className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
              >
                {isAdvanceMode ? (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    <span>Mode Lengkap</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                    <span>Mode Sederhana</span>
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>

          {/* Scrollable Form Body */}
          <form
            id="product-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            {!isAdvanceMode ? (
              /* =========================================================
                 MODE SEDERHANA (SIMPLE MODE) - ZERO CLUTTER SINGLE SCREEN
                 ========================================================= */
              <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
                {/* Product Type Pills */}
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs font-bold text-muted-foreground mr-1">Jenis:</span>
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
                    className="h-10 text-sm font-semibold"
                    autoFocus
                  />
                  <FieldError errors={[{ message: errors.name?.message }]} />
                </Field>

                {/* Kategori & Satuan Master Integrations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field data-invalid={Boolean(errors.category)}>
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel htmlFor="simple-product-category" className="text-xs font-bold">
                        Kategori Produk *
                      </FieldLabel>
                      <button
                        type="button"
                        onClick={() => setIsQuickCategoryOpen(true)}
                        className="text-[11px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Kategori Baru</span>
                      </button>
                    </div>
                    <Input
                      id="simple-product-category"
                      placeholder="Pilih atau ketik kategori..."
                      {...register('category')}
                      aria-invalid={Boolean(errors.category)}
                      className="h-9 text-xs"
                    />
                    <FieldError errors={[{ message: errors.category?.message }]} />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel htmlFor="simple-product-unit" className="text-xs font-bold">
                        Satuan Produk *
                      </FieldLabel>
                      <button
                        type="button"
                        onClick={() => setIsQuickUomOpen(true)}
                        className="text-[11px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Satuan Baru</span>
                      </button>
                    </div>
                    <Input
                      id="simple-product-unit"
                      placeholder="pcs"
                      {...register('unit')}
                      className="h-9 text-xs font-mono font-semibold"
                    />
                  </Field>
                </div>

                {/* Quick Master Category & Unit Chips */}
                <div className="space-y-2 pt-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground mr-1">
                      Master Kategori:
                    </span>
                    {parentMasterCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setValue('category', cat.name, { shouldValidate: true })}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                          currentCategory === cat.name
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted hover:bg-muted/80 text-foreground border-border/60'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {availableSubCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pl-2 border-l-2 border-primary/30">
                      <span className="text-[11px] font-bold text-muted-foreground mr-1">
                        Sub-Kategori:
                      </span>
                      {availableSubCategories.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setValue('subType', sub.name)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                            watch('subType') === sub.name
                              ? 'bg-primary/20 text-primary border-primary font-bold'
                              : 'bg-muted/60 hover:bg-muted text-muted-foreground border-border/40'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground mr-1">
                      Master Satuan:
                    </span>
                    {masterUoms.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setValue('unit', u.symbol, { shouldValidate: true })}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer font-mono ${
                          currentUnit === u.symbol
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted hover:bg-muted/80 text-foreground border-border/60'
                        }`}
                      >
                        {u.symbol}
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
                    <FieldLabel className="text-xs font-bold">
                      Harga Modal HPP (Opsional)
                    </FieldLabel>
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
                      className="h-10 text-sm font-mono font-bold"
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
                        <p className="text-xs font-semibold text-foreground">
                          Foto Produk Tersimpan
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Otomatis teroptimasi format WebP
                        </p>
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
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-bold text-foreground">Estimasi Laba Kotor</p>
                        <p className="text-muted-foreground text-[11px]">
                          Margin {marginPercentage}% per transaksi
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-primary font-mono text-sm">
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
                    <TabsTrigger value="basic" className="text-xs gap-1.5 font-bold">
                      <Info className="h-3.5 w-3.5" />
                      <span>Identitas</span>
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="text-xs gap-1.5 font-bold">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Harga & Stok</span>
                    </TabsTrigger>
                    <TabsTrigger value="variants" className="text-xs gap-1.5 font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Varian ({variantFields.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="modifiers" className="text-xs gap-1.5 font-bold">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Modifier ({modifierGroupFields.length})</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab 1: Identitas */}
                <TabsContent
                  value="basic"
                  className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0"
                >
                  {/* Product Type Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground mr-1">
                      Tipe Usaha:
                    </span>
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
                      className="h-10 text-sm font-semibold"
                    />
                    <FieldError errors={[{ message: errors.name?.message }]} />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field data-invalid={Boolean(errors.category)}>
                      <div className="flex items-center justify-between mb-1">
                        <FieldLabel htmlFor="adv-product-category" className="text-xs font-bold">
                          Kategori Utama *
                        </FieldLabel>
                        <button
                          type="button"
                          onClick={() => setIsQuickCategoryOpen(true)}
                          className="text-[11px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Kategori Baru</span>
                        </button>
                      </div>
                      <Input
                        id="adv-product-category"
                        placeholder="Kategori"
                        {...register('category')}
                        className="h-9 text-xs"
                      />
                      <FieldError errors={[{ message: errors.category?.message }]} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="adv-product-subtype" className="text-xs font-bold">
                        Sub-Kategori (Opsional)
                      </FieldLabel>
                      <Input
                        id="adv-product-subtype"
                        placeholder="Contoh: Kopi Susu / Snack"
                        {...register('subType')}
                        className="h-9 text-xs"
                      />
                    </Field>
                  </div>

                  {/* Quick Category / Subtype selector */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-muted-foreground mr-1">
                      Master Kategori:
                    </span>
                    {parentMasterCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setValue('category', cat.name, { shouldValidate: true })}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                          currentCategory === cat.name
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted hover:bg-muted/80 text-foreground border-border/60'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field>
                      <div className="flex items-center justify-between mb-1">
                        <FieldLabel htmlFor="adv-product-unit" className="text-xs font-bold">
                          Satuan Produk *
                        </FieldLabel>
                        <button
                          type="button"
                          onClick={() => setIsQuickUomOpen(true)}
                          className="text-[11px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Satuan</span>
                        </button>
                      </div>
                      <Input
                        id="adv-product-unit"
                        placeholder="pcs"
                        {...register('unit')}
                        className="h-9 text-xs font-mono font-semibold"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="adv-product-sku" className="text-xs font-bold">
                        SKU Produk
                      </FieldLabel>
                      <Input
                        id="adv-product-sku"
                        placeholder="Contoh: KOP-001"
                        {...register('sku')}
                        className="h-9 text-xs"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="adv-product-barcode" className="text-xs font-bold">
                        Barcode
                      </FieldLabel>
                      <Input
                        id="adv-product-barcode"
                        placeholder="Contoh: 89912345678"
                        {...register('barcode')}
                        className="h-9 text-xs"
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="adv-product-desc" className="text-xs font-bold">
                      Deskripsi Produk
                    </FieldLabel>
                    <Input
                      id="adv-product-desc"
                      placeholder="Rincian deskripsi produk..."
                      {...register('description')}
                      className="h-9 text-xs"
                    />
                  </Field>

                  {/* Foto Upload */}
                  <Field>
                    <FieldLabel className="text-xs font-bold">Foto Produk</FieldLabel>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {currentImageUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border">
                        <img
                          src={currentImageUrl}
                          alt="Preview"
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="text-destructive h-8 text-xs"
                        >
                          Hapus
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-12 border-dashed text-xs gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span>Upload Foto</span>
                      </Button>
                    )}
                  </Field>
                </TabsContent>

                {/* Tab 2: Harga & Stok */}
                <TabsContent
                  value="pricing"
                  className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field data-invalid={Boolean(errors.price)}>
                      <FieldLabel className="text-xs font-bold text-primary">
                        Harga Jual Dasar *
                      </FieldLabel>
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
                        <FieldLabel htmlFor="adv-product-stock" className="text-xs font-bold">
                          Stok Dasar *
                        </FieldLabel>
                        <Input
                          id="adv-product-stock"
                          type="number"
                          min="0"
                          {...register('stock')}
                          className="h-10 text-sm font-mono font-bold"
                        />
                        <FieldError errors={[{ message: errors.stock?.message }]} />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="adv-product-minstock" className="text-xs font-bold">
                          Batas Minimum Alert Stok
                        </FieldLabel>
                        <Input
                          id="adv-product-minstock"
                          type="number"
                          min="0"
                          {...register('minStock')}
                          className="h-10 text-sm font-mono"
                        />
                      </Field>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Multi-Level Variants (Hingga 3 Level) */}
                <TabsContent
                  value="variants"
                  className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Definisi Atribut Dimensi (Maks 3 Tingkat)
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Pilih dari Master Dimensi Varian atau buat dimensi khusus baru.
                      </p>
                    </div>
                    {dimensions.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddDimension}
                        className="text-xs h-8 gap-1 font-bold"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tambah Dimensi</span>
                      </Button>
                    )}
                  </div>

                  {/* Dimension Rows */}
                  {dimensions.map((dim, dimIdx) => (
                    <div key={dim.id} className="p-3.5 bg-muted/40 rounded-xl border space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <span className="text-xs font-bold text-primary shrink-0">
                            Tingkat {dimIdx + 1}:
                          </span>
                          <Input
                            value={dim.name}
                            onChange={(e) => handleUpdateDimensionName(dimIdx, e.target.value)}
                            placeholder="Nama Dimensi (Ukuran / Suhu)"
                            className="h-8 text-xs max-w-[160px] bg-background font-semibold"
                          />

                          {/* Quick Master Variant Template Selector */}
                          <Select
                            onValueChange={(val) => {
                              const selectedTemplate = masterVariantAttributes.find(
                                (m) => m.id === val
                              );
                              if (selectedTemplate) {
                                handleApplyMasterVariantTemplate(selectedTemplate, dimIdx);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-[11px] w-48 bg-background">
                              <SelectValue placeholder="Gunakan Master Template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {masterVariantAttributes.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name} ({m.presetOptions.length} opsi)
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveDimensionToMaster(dim)}
                            title="Simpan Dimensi ini ke Master Varian Toko"
                            className="h-7 px-2 text-[11px] text-primary gap-1"
                          >
                            <BookmarkPlus className="h-3 w-3" />
                            <span>Simpan Master</span>
                          </Button>
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
                      </div>

                      {/* Options Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {dim.options.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-background border text-xs font-medium"
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDimensionOption(dimIdx, optIdx)}
                              className="text-muted-foreground hover:text-destructive ml-1 cursor-pointer"
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
                              handleAddDimensionOption(
                                dimIdx,
                                (e.target as HTMLInputElement).value
                              );
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
                        <p className="text-xs font-semibold text-foreground">
                          Hasilkan Kombinasi Varian Otomatis
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleGenerateMatrix}
                        className="text-xs h-8 gap-1.5 font-bold"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>Buat Matriks Varian</span>
                      </Button>
                    </div>
                  )}

                  {/* Variants Table */}
                  {variantFields.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">
                          Daftar Kombinasi Varian ({variantFields.length})
                        </p>
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
                        <span className="font-bold text-muted-foreground mr-1">
                          Terapkan Massal:
                        </span>
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
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={handleApplyBulkValues}
                          className="h-7 px-2 text-xs font-semibold"
                        >
                          Terapkan ke Semua
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {variantFields.map((field, idx) => (
                          <div
                            key={field.id}
                            className="p-2.5 bg-card rounded-lg border flex items-center gap-2 text-xs"
                          >
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
                              className="h-8 w-16 text-xs font-mono font-bold"
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
                <TabsContent
                  value="modifiers"
                  className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 m-0"
                >
                  {/* Master Modifier Selector Panel */}
                  <div className="p-3.5 bg-muted/40 rounded-xl border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold text-foreground">
                          Pilih dari Master Modifier Toko
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {masterModifierGroups.length} Tersedia di Master
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {masterModifierGroups.map((masterMod) => {
                        const isAttached = watchedModifierGroups.some(
                          (m) => m.name.toLowerCase() === masterMod.name.toLowerCase()
                        );
                        return (
                          <div
                            key={masterMod.id}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${
                              isAttached
                                ? 'bg-primary/10 border-primary text-foreground'
                                : 'bg-background hover:bg-muted/60 text-muted-foreground'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground truncate">
                                {masterMod.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {masterMod.options.length} opsi
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant={isAttached ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleMasterModifier(masterMod)}
                              className="h-7 text-xs px-2 gap-1 cursor-pointer font-semibold"
                            >
                              {isAttached ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Aktif</span>
                                </>
                              ) : (
                                <span>+ Gunakan</span>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Modifier Groups Builder */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Grup Modifier yang Aktif pada Produk ({modifierGroupFields.length})
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Modifier yang dipilih akan muncul saat produk diklik di kasir.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendModifierGroup({
                          id: generateUUID(),
                          name: 'Modifier Baru',
                          required: false,
                          maxSelect: 1,
                          options: [{ id: generateUUID(), name: 'Opsi 1', price: 0 }],
                        })
                      }
                      className="text-xs h-8 gap-1 font-bold"
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Buat Grup Baru</span>
                    </Button>
                  </div>

                  {modifierGroupFields.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground text-xs">
                      Belum ada grup modifier aktif untuk produk ini.
                    </div>
                  ) : (
                    modifierGroupFields.map((groupField, gIdx) => (
                      <div
                        key={groupField.id}
                        className="p-3.5 bg-muted/30 rounded-xl border space-y-3"
                      >
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
                            onClick={() => handleSaveModifierToMaster(watchedModifierGroups[gIdx])}
                            title="Simpan Grup Modifier ini ke Master Toko"
                            className="h-7 px-2 text-[11px] text-primary gap-1 cursor-pointer"
                          >
                            <BookmarkPlus className="h-3 w-3" />
                            <span>Simpan Master</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModifierGroup(gIdx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Modifier Options List */}
                        <div className="space-y-1.5 pl-2 border-l-2 border-primary/30">
                          {(watchedModifierGroups[gIdx]?.options || []).map((_, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <Input
                                {...register(
                                  `modifierGroups.${gIdx}.options.${optIdx}.name` as const
                                )}
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
                                      className="h-7 text-xs font-bold"
                                    />
                                  )}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const currentOpts = [
                                    ...(watchedModifierGroups[gIdx]?.options || []),
                                  ];
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
                            className="h-6 px-2 text-[11px] text-primary gap-1 cursor-pointer font-bold"
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
                <span>
                  {isSubmitting
                    ? 'Menyimpan...'
                    : productToEdit
                      ? 'Simpan Perubahan'
                      : 'Simpan Produk'}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inline Mini Modal: Tambah Master Kategori Baru */}
      <Dialog open={isQuickCategoryOpen} onOpenChange={setIsQuickCategoryOpen}>
        <DialogContent className="sm:max-w-sm h-[85vh] max-h-[380px] min-h-[300px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-sm font-bold">Tambah Master Kategori Cepat</DialogTitle>
            <DialogDescription className="text-xs">
              Kategori baru akan langsung disimpan ke Master Data Toko.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSaveQuickCategory}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <Field>
                <FieldLabel className="text-xs font-bold">Nama Kategori *</FieldLabel>
                <Input
                  placeholder="Contoh: Kopi Spesialti, Snack, Aksesoris"
                  value={quickCategoryName}
                  onChange={(e) => setQuickCategoryName(e.target.value)}
                  required
                  className="h-9 text-xs"
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Kategori Induk (Parent)</FieldLabel>
                <Select
                  value={quickCategoryParentId}
                  onValueChange={(val) => setQuickCategoryParentId(val)}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Induk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="NONE">-- Kategori Utama --</SelectItem>
                      {parentMasterCategories.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row justify-between items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQuickCategoryOpen(false)}
                className="cursor-pointer text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!quickCategoryName.trim() || upsertCategoryMutation.isPending}
                className="font-bold cursor-pointer text-xs"
              >
                Simpan & Pilih
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inline Mini Modal: Tambah Master Satuan Baru */}
      <Dialog open={isQuickUomOpen} onOpenChange={setIsQuickUomOpen}>
        <DialogContent className="sm:max-w-sm h-[85vh] max-h-[380px] min-h-[300px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-sm font-bold">Tambah Master Satuan Cepat</DialogTitle>
            <DialogDescription className="text-xs">
              Satuan unit baru akan langsung tersimpan dan dapat dipakai di kasir.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSaveQuickUom}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <Field>
                <FieldLabel className="text-xs font-bold">Nama Satuan *</FieldLabel>
                <Input
                  placeholder="Contoh: Porsi Makanan, Dus Besar"
                  value={quickUomName}
                  onChange={(e) => setQuickUomName(e.target.value)}
                  required
                  className="h-9 text-xs"
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Simbol Singkat *</FieldLabel>
                <Input
                  placeholder="Contoh: porsi, dus, slop, mangkok"
                  value={quickUomSymbol}
                  onChange={(e) => setQuickUomSymbol(e.target.value)}
                  required
                  className="h-9 text-xs font-mono font-bold"
                />
              </Field>
            </div>

            <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row justify-between items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQuickUomOpen(false)}
                className="cursor-pointer text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  !quickUomName.trim() || !quickUomSymbol.trim() || upsertUomMutation.isPending
                }
                className="font-bold cursor-pointer text-xs"
              >
                Simpan & Pilih
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductFormDialog;
