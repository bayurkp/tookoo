import React, { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Percent, Layers, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { DatePicker } from '@/components/date-n-time';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  useMasterDiscounts,
  useUpsertMasterDiscount,
  useDeleteMasterDiscount,
} from '../hooks/use-master-data';
import { useProducts } from '../hooks/use-products';
import { formatCurrency } from '@/utils/format-currency';
import type { MasterDiscount, DiscountType, DiscountScope } from '@/types/master-data.types';

export const DiscountManagerTab: React.FC = () => {
  const { data: discounts = [] } = useMasterDiscounts();
  const { data: products = [] } = useProducts();
  const upsertMutation = useUpsertMasterDiscount();
  const deleteMutation = useDeleteMasterDiscount();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [discountToEdit, setDiscountToEdit] = useState<MasterDiscount | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<MasterDiscount | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<DiscountType>('PERCENTAGE');
  const [value, setValue] = useState<number>(10);
  const [scope, setScope] = useState<DiscountScope>('ALL_PRODUCTS');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [hasExpiry, setHasExpiry] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected product object for variants dropdown
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        d.name.toLowerCase().includes(q) ||
        (d.code && d.code.toLowerCase().includes(q)) ||
        (d.targetProductName && d.targetProductName.toLowerCase().includes(q))
      );
    });
  }, [discounts, searchQuery]);

  const handleOpenCreate = () => {
    setDiscountToEdit(null);
    setName('');
    setCode('');
    setType('PERCENTAGE');
    setValue(10);
    setScope('ALL_PRODUCTS');
    setSelectedProductId('');
    setSelectedVariantId('');
    setHasExpiry(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setMinPurchaseAmount(0);
    setMaxDiscountAmount(0);
    setIsActive(true);
    setDescription('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (d: MasterDiscount) => {
    setDiscountToEdit(d);
    setName(d.name);
    setCode(d.code || '');
    setType(d.type);
    setValue(d.value);
    setScope(d.scope);
    setSelectedProductId(d.targetProductId || '');
    setSelectedVariantId(d.targetVariantId || '');
    setHasExpiry(Boolean(d.hasExpiry));
    setStartDate(d.startDate ? new Date(d.startDate) : undefined);
    setEndDate(d.endDate ? new Date(d.endDate) : undefined);
    setMinPurchaseAmount(d.minPurchaseAmount || 0);
    setMaxDiscountAmount(d.maxDiscountAmount || 0);
    setIsActive(d.isActive !== false);
    setDescription(d.description || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || value <= 0) return;

    setIsSubmitting(true);
    try {
      const targetProd = products.find((p) => p.id === selectedProductId);
      const targetVar = targetProd?.variants?.find((v) => v.id === selectedVariantId);

      const startMs = hasExpiry && startDate ? startDate.getTime() : null;
      const endMs =
        hasExpiry && endDate
          ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime()
          : null;

      await upsertMutation.mutateAsync({
        id: discountToEdit?.id,
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        type,
        value,
        scope,
        targetProductId: scope !== 'ALL_PRODUCTS' ? selectedProductId || null : null,
        targetProductName: scope !== 'ALL_PRODUCTS' ? targetProd?.name || null : null,
        targetVariantId: scope === 'SPECIFIC_VARIANT' ? selectedVariantId || null : null,
        targetVariantName: scope === 'SPECIFIC_VARIANT' ? targetVar?.name || null : null,
        hasExpiry,
        startDate: startMs,
        endDate: endMs,
        minPurchaseAmount: minPurchaseAmount > 0 ? minPurchaseAmount : null,
        maxDiscountAmount:
          type === 'PERCENTAGE' && maxDiscountAmount > 0 ? maxDiscountAmount : null,
        isActive,
        description: description.trim() || undefined,
      });

      setIsDialogOpen(false);
    } catch (err) {
      console.error('Failed to save discount:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (discountToDelete) {
      await deleteMutation.mutateAsync(discountToDelete.id);
      setDiscountToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Master Diskon & Promo</h3>
          <p className="text-muted-foreground text-xs">
            Atur promo diskon toko untuk semua produk, produk tertentu, atau varian tertentu dengan
            batas waktu fleksibel.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="gap-1.5 font-bold cursor-pointer text-xs shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Diskon Baru</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Cari diskon atau kode voucher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-xs bg-card"
        />
      </div>

      {/* Discounts Grid */}
      {filteredDiscounts.length === 0 ? (
        <Card className="border bg-card rounded-xl shadow-none p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Percent className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-foreground">Belum ada promo diskon</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Buat diskon persen atau nominal rupiah untuk menarik pelanggan belanja lebih banyak.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDiscounts.map((discount) => {
            const isPercentage = discount.type === 'PERCENTAGE';
            return (
              <Card
                key={discount.id}
                className="border bg-card rounded-xl shadow-none hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <CardTitle className="text-sm font-bold truncate">
                          {discount.name}
                        </CardTitle>
                        {discount.isActive ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold"
                          >
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 text-muted-foreground"
                          >
                            Nonaktif
                          </Badge>
                        )}
                      </div>
                      {discount.code && (
                        <span className="font-mono text-[11px] font-bold text-primary mt-0.5 inline-block">
                          Kode: {discount.code}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-foreground">
                        {isPercentage ? `${discount.value}%` : formatCurrency(discount.value)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2 text-xs flex-1">
                  {/* Scope description */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {discount.scope === 'ALL_PRODUCTS' && 'Semua Produk Menu (Global)'}
                      {discount.scope === 'SPECIFIC_PRODUCT' && (
                        <>
                          Produk:{' '}
                          <strong className="text-foreground">{discount.targetProductName}</strong>{' '}
                          (Semua Varian)
                        </>
                      )}
                      {discount.scope === 'SPECIFIC_VARIANT' && (
                        <>
                          Varian:{' '}
                          <strong className="text-foreground">
                            {discount.targetProductName} ({discount.targetVariantName})
                          </strong>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Expiry period */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {discount.hasExpiry && discount.startDate && discount.endDate ? (
                        <>
                          {new Date(discount.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          s/d{' '}
                          {new Date(discount.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </>
                      ) : (
                        'Berlaku Selamanya (Tanpa Batas Waktu)'
                      )}
                    </span>
                  </div>

                  {/* Requirements / Min purchase */}
                  {discount.minPurchaseAmount && discount.minPurchaseAmount > 0 ? (
                    <p className="text-[11px] text-muted-foreground">
                      Min. Belanja:{' '}
                      <strong className="text-foreground">
                        {formatCurrency(discount.minPurchaseAmount)}
                      </strong>
                    </p>
                  ) : null}

                  {discount.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 pt-1">
                      {discount.description}
                    </p>
                  )}
                </CardContent>

                {/* Card Footer Actions */}
                <div className="p-2.5 px-4 border-t bg-muted/20 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {isPercentage ? 'Tipe: Persentase' : 'Tipe: Nominal Tetap'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(discount)}
                      className="h-7 text-xs px-2 cursor-pointer"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDiscountToDelete(discount);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      <span>Hapus</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Discount Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg h-[85vh] max-h-[640px] min-h-[500px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-base font-bold">
              {discountToEdit ? 'Edit Promo Diskon' : 'Tambah Promo Diskon Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tentukan jenis potongan, cakupan produk/varian, dan periode aktif promo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              {/* Promo Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Nama Promo / Diskon *</FieldLabel>
                  <Input
                    placeholder="Contoh: Diskon Pelajar 10%"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 text-xs font-semibold"
                    autoFocus
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Kode Voucher (Opsional)</FieldLabel>
                  <Input
                    placeholder="Contoh: PROMO10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </Field>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Jenis Potongan *</FieldLabel>
                  <Select value={type} onValueChange={(val) => setType(val as DiscountType)}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Pilih Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                        <SelectItem value="FIXED">Nominal Tetap (Rp)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">
                    {type === 'PERCENTAGE' ? 'Nilai Diskon (%) *' : 'Nominal Potongan (Rp) *'}
                  </FieldLabel>
                  {type === 'PERCENTAGE' ? (
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value) || 0)}
                        required
                        className="h-9 text-xs font-bold pr-8"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  ) : (
                    <CurrencyInput
                      value={value}
                      onValueChange={(val: number) => setValue(val)}
                      placeholder="5.000"
                      className="h-9 text-xs font-bold"
                    />
                  )}
                </Field>
              </div>

              {/* Scope of Discount */}
              <Field>
                <FieldLabel className="text-xs font-bold">Cakupan Berlakunya Diskon *</FieldLabel>
                <Select value={scope} onValueChange={(val) => setScope(val as DiscountScope)}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Cakupan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ALL_PRODUCTS">Semua Produk (Seluruh Pesanan)</SelectItem>
                      <SelectItem value="SPECIFIC_PRODUCT">
                        1 Produk Tertentu (Semua Varian Produk)
                      </SelectItem>
                      <SelectItem value="SPECIFIC_VARIANT">
                        1 Varian Spesifik dari Suatu Produk
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* Product selector if scope is SPECIFIC_PRODUCT or SPECIFIC_VARIANT */}
              {scope !== 'ALL_PRODUCTS' && (
                <div className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-3">
                  <Field>
                    <FieldLabel className="text-xs font-bold">Pilih Produk Sasaran *</FieldLabel>
                    <Select
                      value={selectedProductId}
                      onValueChange={(val) => {
                        setSelectedProductId(val);
                        setSelectedVariantId('');
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Pilih Produk dari Katalog" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({formatCurrency(p.price)})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  {scope === 'SPECIFIC_VARIANT' &&
                    selectedProduct &&
                    selectedProduct.variants &&
                    selectedProduct.variants.length > 0 && (
                      <Field>
                        <FieldLabel className="text-xs font-bold">
                          Pilih Varian Spesifik *
                        </FieldLabel>
                        <Select
                          value={selectedVariantId}
                          onValueChange={(val) => setSelectedVariantId(val)}
                        >
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue placeholder="Pilih Varian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {selectedProduct.variants.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.name} ({formatCurrency(v.price)})
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                </div>
              )}

              {/* Expiry Period Controls */}
              <div className="p-3.5 bg-muted/30 rounded-xl border border-border/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has-expiry-checkbox"
                    checked={hasExpiry}
                    onCheckedChange={(checked) => setHasExpiry(Boolean(checked))}
                  />
                  <label
                    htmlFor="has-expiry-checkbox"
                    className="text-xs font-bold text-foreground cursor-pointer select-none"
                  >
                    Tentukan Batas Waktu (Periode Tanggal Aktif)
                  </label>
                </div>

                {hasExpiry ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Field>
                      <FieldLabel className="text-[11px] font-semibold">Tanggal Mulai</FieldLabel>
                      <DatePicker
                        date={startDate}
                        onSelect={setStartDate}
                        placeholder="Pilih Tanggal Mulai"
                        className="h-8"
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-[11px] font-semibold">
                        Tanggal Berakhir
                      </FieldLabel>
                      <DatePicker
                        date={endDate}
                        onSelect={setEndDate}
                        placeholder="Pilih Tanggal Berakhir"
                        className="h-8"
                      />
                    </Field>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    Diskon akan berlaku selamanya tanpa tanggal kedaluwarsa hingga dinonaktifkan
                    manual.
                  </p>
                )}
              </div>

              {/* Minimum Purchase & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Min. Belanja (Opsional)</FieldLabel>
                  <CurrencyInput
                    value={minPurchaseAmount}
                    onValueChange={(val: number) => setMinPurchaseAmount(val)}
                    placeholder="Contoh: 50.000"
                    className="h-9 text-xs"
                  />
                </Field>

                {type === 'PERCENTAGE' && (
                  <Field>
                    <FieldLabel className="text-xs font-bold">Maks. Potongan (Opsional)</FieldLabel>
                    <CurrencyInput
                      value={maxDiscountAmount}
                      onValueChange={(val: number) => setMaxDiscountAmount(val)}
                      placeholder="Contoh: 20.000"
                      className="h-9 text-xs"
                    />
                  </Field>
                )}
              </div>

              {/* Description */}
              <Field>
                <FieldLabel className="text-xs font-bold">Catatan / Keterangan Promo</FieldLabel>
                <Input
                  placeholder="Contoh: Khusus pembelian dine-in atau take-away"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-xs"
                />
              </Field>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="is-active-checkbox"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                />
                <label
                  htmlFor="is-active-checkbox"
                  className="text-xs font-bold text-foreground cursor-pointer select-none"
                >
                  Aktifkan promo ini di kasir
                </label>
              </div>
            </div>

            <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row justify-between items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="cursor-pointer text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || value <= 0 || isSubmitting}
                className="font-bold gap-1.5 cursor-pointer text-xs shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{discountToEdit ? 'Simpan Perubahan' : 'Tambah Diskon'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {discountToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Promo diskon ini akan dihapus dari daftar master dan tidak dapat dipilih lagi saat
              kasir memproses pesanan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Ya, Hapus Diskon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DiscountManagerTab;
