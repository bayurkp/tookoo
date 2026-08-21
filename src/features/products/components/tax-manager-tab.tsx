import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Pencil,
  Trash2,
  Percent,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
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
import { useMasterTaxes, useUpsertMasterTax, useDeleteMasterTax } from '../hooks/use-master-data';
import { formatCurrency } from '@/utils/format-currency';
import type { MasterTax, TaxType } from '@/types/master-data.types';

export const TaxManagerTab: React.FC = () => {
  const { data: taxes = [] } = useMasterTaxes();
  const upsertMutation = useUpsertMasterTax();
  const deleteMutation = useDeleteMasterTax();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taxToEdit, setTaxToEdit] = useState<MasterTax | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<MasterTax | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<TaxType>('PERCENTAGE');
  const [rate, setRate] = useState<number>(10);
  const [inclusive, setInclusive] = useState<boolean>(false);
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTaxes = useMemo(() => {
    return taxes.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    });
  }, [taxes, searchQuery]);

  const handleOpenCreate = () => {
    setTaxToEdit(null);
    setName('');
    setType('PERCENTAGE');
    setRate(10);
    setInclusive(false);
    setIsDefault(false);
    setIsActive(true);
    setDescription('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (tax: MasterTax) => {
    setTaxToEdit(tax);
    setName(tax.name);
    setType(tax.type);
    setRate(tax.rate);
    setInclusive(Boolean(tax.inclusive));
    setIsDefault(Boolean(tax.isDefault));
    setIsActive(tax.isActive !== false);
    setDescription(tax.description || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rate < 0) return;

    setIsSubmitting(true);
    try {
      await upsertMutation.mutateAsync({
        id: taxToEdit?.id,
        name: name.trim(),
        type,
        rate,
        inclusive,
        isDefault,
        isActive,
        description: description.trim() || undefined,
      });

      setIsDialogOpen(false);
    } catch (err) {
      console.error('Failed to save tax:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (taxToDelete) {
      await deleteMutation.mutateAsync(taxToDelete.id);
      setTaxToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama pajak atau biaya layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="gap-1.5 font-bold cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pajak / Biaya</span>
        </Button>
      </div>

      {/* Taxes List Cards */}
      {filteredTaxes.length === 0 ? (
        <Card className="border bg-card rounded-xl shadow-none p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Receipt className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-foreground">Belum ada pengaturan pajak atau biaya</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Klik tombol &ldquo;+ Tambah Pajak / Biaya&rdquo; untuk menetapkan PB1, PPN, atau service
            charge.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTaxes.map((tax) => {
            const isPercentage = tax.type === 'PERCENTAGE';
            return (
              <Card
                key={tax.id}
                className="border bg-card rounded-xl shadow-none hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <CardTitle className="text-sm font-bold truncate">{tax.name}</CardTitle>
                        {tax.isActive ? (
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
                      {tax.isDefault && (
                        <span className="text-[10px] font-semibold text-primary mt-0.5 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Otomatis Aktif di Kasir</span>
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-foreground">
                        {isPercentage ? `${tax.rate}%` : formatCurrency(tax.rate)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2 text-xs flex-1">
                  {/* Calculation mode badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Skema Perhitungan:</span>
                    <Badge variant="outline" className="text-[10px] py-0 font-medium">
                      {tax.inclusive ? 'Termasuk Harga (Nett)' : 'Ditambahkan di Checkout'}
                    </Badge>
                  </div>

                  {tax.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 pt-1">
                      {tax.description}
                    </p>
                  )}
                </CardContent>

                {/* Card Footer Actions */}
                <div className="p-2.5 px-4 border-t bg-muted/20 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {isPercentage ? 'Tarif Persen' : 'Tarif Nominal'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(tax)}
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
                        setTaxToDelete(tax);
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

      {/* Add / Edit Tax Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md h-[85vh] max-h-[560px] min-h-[440px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-base font-bold">
              {taxToEdit ? 'Edit Pajak & Biaya' : 'Tambah Pajak / Biaya Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfigurasikan tarif persen atau nominal biaya layanan restoran / toko.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <Field>
                <FieldLabel className="text-xs font-bold">Nama Pajak / Biaya *</FieldLabel>
                <Input
                  placeholder="Contoh: PB1 Restoran (10%) / Service Charge (5%)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9 text-xs font-semibold"
                  autoFocus
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Jenis Tarif *</FieldLabel>
                  <Select value={type} onValueChange={(val) => setType(val as TaxType)}>
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
                    {type === 'PERCENTAGE' ? 'Tarif Persen (%) *' : 'Nominal Biaya (Rp) *'}
                  </FieldLabel>
                  {type === 'PERCENTAGE' ? (
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value) || 0)}
                        required
                        className="h-9 text-xs font-bold pr-8"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  ) : (
                    <CurrencyInput
                      value={rate}
                      onValueChange={(val: number) => setRate(val)}
                      placeholder="2.000"
                      className="h-9 text-xs font-bold"
                    />
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-xs font-bold">Model Perhitungan Pajak</FieldLabel>
                <Select
                  value={inclusive ? 'INCLUSIVE' : 'EXCLUSIVE'}
                  onValueChange={(val) => setInclusive(val === 'INCLUSIVE')}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Model Perhitungan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="EXCLUSIVE">
                        Ditambahkan di Luar Harga Menu (Exclusive / Added on Subtotal)
                      </SelectItem>
                      <SelectItem value="INCLUSIVE">
                        Sudah Termasuk dalam Harga Menu (Inclusive / Nett Price)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Keterangan / Catatan</FieldLabel>
                <Input
                  placeholder="Contoh: Pajak daerah 10% sesuai peraturan pemda"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-xs"
                />
              </Field>

              <div className="p-3.5 bg-muted/30 rounded-xl border border-border/80 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is-default-checkbox"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
                  />
                  <label
                    htmlFor="is-default-checkbox"
                    className="text-xs font-bold text-foreground cursor-pointer select-none"
                  >
                    Otomatis Diterapkan di Setiap Transaksi Kasir (Default)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is-active-tax-checkbox"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                  />
                  <label
                    htmlFor="is-active-tax-checkbox"
                    className="text-xs font-bold text-foreground cursor-pointer select-none"
                  >
                    Aktifkan Pajak / Biaya Layanan ini
                  </label>
                </div>
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
                disabled={!name.trim() || rate < 0 || isSubmitting}
                className="font-bold gap-1.5 cursor-pointer text-xs shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{taxToEdit ? 'Simpan Perubahan' : 'Tambah Pajak'}</span>
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
            <AlertDialogTitle>Hapus {taxToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Pajak / Biaya layanan ini akan dihapus dari daftar master.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaxManagerTab;
