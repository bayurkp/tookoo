import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Search, Pencil, Trash2, Loader2, Package, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
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
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  useMasterModifierGroups,
  useUpsertMasterModifierGroup,
  useDeleteMasterModifierGroup,
} from '../hooks/use-master-data';
import { formatCurrency } from '@/utils/format-currency';
import type { Product } from '@/types/product.types';
import type { MasterModifierGroup, MasterModifierOption } from '@/types/master-data.types';

interface ModifierManagerTabProps {
  products: Product[];
  onOpenEditProduct: (product: Product) => void;
  onOpenCreateProduct: () => void;
}

export const ModifierManagerTab: React.FC<ModifierManagerTabProps> = ({
  products,
  onOpenEditProduct,
  onOpenCreateProduct: _onOpenCreateProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MasterModifierGroup | null>(null);

  // Form State
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(false);
  const [maxSelect, setMaxSelect] = useState<number>(1);
  const [options, setOptions] = useState<MasterModifierOption[]>([
    { id: crypto.randomUUID(), name: '', price: 0 },
  ]);

  const { data: masterGroups = [] } = useMasterModifierGroups();
  const upsertMutation = useUpsertMasterModifierGroup();
  const deleteMutation = useDeleteMasterModifierGroup();

  // Compute products using this modifier group
  const groupsWithUsage = useMemo(() => {
    return masterGroups.map((g) => {
      const usedInProducts = products.filter((p) =>
        p.modifierGroups?.some(
          (pmg) => pmg.name.trim().toLowerCase() === g.name.trim().toLowerCase()
        )
      );
      return {
        ...g,
        usedInProducts,
      };
    });
  }, [masterGroups, products]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groupsWithUsage;
    return groupsWithUsage.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.options.some((opt) => opt.name.toLowerCase().includes(q))
    );
  }, [groupsWithUsage, searchQuery]);

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setGroupName('');
    setDescription('');
    setRequired(false);
    setMaxSelect(1);
    setOptions([
      { id: crypto.randomUUID(), name: '', price: 0 },
      { id: crypto.randomUUID(), name: '', price: 0 },
    ]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (group: MasterModifierGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setDescription(group.description || '');
    setRequired(Boolean(group.required));
    setMaxSelect(group.maxSelect || 1);
    setOptions(
      group.options.length > 0
        ? group.options.map((o) => ({ ...o }))
        : [{ id: crypto.randomUUID(), name: '', price: 0 }]
    );
    setIsFormOpen(true);
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { id: crypto.randomUUID(), name: '', price: 0 }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'name' | 'price', value: string | number) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const validOptions = options
      .map((o) => ({
        id: o.id || crypto.randomUUID(),
        name: o.name.trim(),
        price: Math.max(0, o.price || 0),
      }))
      .filter((o) => o.name.length > 0);

    if (validOptions.length === 0) {
      alert('Harap masukkan minimal 1 opsi modifier/topping.');
      return;
    }

    await upsertMutation.mutateAsync({
      id: editingGroup?.id,
      name: groupName.trim(),
      description: description.trim(),
      required,
      minSelect: required ? 1 : 0,
      maxSelect: Math.max(1, maxSelect || 1),
      options: validOptions,
    });

    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari grup master modifier atau topping..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="gap-1.5 font-bold cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Modifier</span>
          </Button>
        </div>
      </div>

      {/* Modifier Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">
            Belum ada master modifier terdaftar
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Grup modifier (seperti ekstra topping, pilihan susu, atau level pedas) dapat dipilih
            saat membuat produk.
          </p>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5 font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Modifier Sekarang</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between rounded-xl shadow-none"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {group.name}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {group.maxSelect > 1
                        ? `Pilihan Bebas (Maks ${group.maxSelect})`
                        : 'Pilihan Tunggal (Pilih 1)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px] px-2 font-semibold">
                    {group.options.length} Opsi
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(group)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Edit Master Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Hapus Master Modifier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Hapus Master Modifier &ldquo;{group.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                          Grup modifier ini akan dihapus dari daftar master pilihan cepat toko.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(group.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                        >
                          Ya, Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* Option list with prices */}
                <div className="space-y-1.5 p-2.5 bg-muted/30 rounded-lg border border-border/50">
                  {group.options.map((opt) => (
                    <div
                      key={opt.id || opt.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-foreground">{opt.name}</span>
                      <span className="font-bold text-primary font-mono">
                        {opt.price > 0 ? `+${formatCurrency(opt.price)}` : 'Gratis (Rp0)'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Used in products */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Digunakan Pada ({group.usedInProducts.length} Produk):
                  </p>
                  {group.usedInProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {group.usedInProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onOpenEditProduct(p)}
                          className="text-[11px] bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded-md font-medium border border-border/50 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Package className="h-3 w-3 text-primary" />
                          <span>{p.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/60 italic">
                      Belum dikaitkan ke produk
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Master Modifier Modal Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg h-[85vh] max-h-[640px] min-h-[480px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-base font-bold">
              {editingGroup ? 'Edit Master Modifier Toko' : 'Tambah Master Modifier Toko'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Buat grup pilihan topping, susu, atau level rasa yang dapat digunakan berulang di
              berbagai produk.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitForm}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <Field>
                <FieldLabel className="text-xs font-bold">Nama Grup Modifier *</FieldLabel>
                <Input
                  placeholder="Contoh: Topping Tambahan, Pilihan Susu, Level Pedas"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Maksimal Pilihan</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={maxSelect}
                    onChange={(e) => setMaxSelect(Number(e.target.value) || 1)}
                    className="h-9 text-xs font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    1 = Radio (Pilih 1), &gt;1 = Checkbox (Banyak)
                  </p>
                </Field>

                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="modifier-required"
                    checked={required}
                    onCheckedChange={(checked) => setRequired(Boolean(checked))}
                  />
                  <label
                    htmlFor="modifier-required"
                    className="text-xs font-semibold cursor-pointer select-none"
                  >
                    Wajib Dipilih Kasir
                  </label>
                </div>
              </div>

              {/* Dynamic Options List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-xs font-bold">
                    Daftar Opsi & Biaya Tambahan *
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="h-7 text-xs font-semibold gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Baris</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div key={opt.id || index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Nama Opsi ${index + 1} (misal: Ekstra Boba)`}
                        value={opt.name}
                        onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                        className="h-9 text-xs flex-1"
                        required
                      />
                      <div className="w-36">
                        <CurrencyInput
                          value={opt.price}
                          onValueChange={(val) => handleOptionChange(index, 'price', val)}
                          placeholder="Harga (+Rp)"
                          className="h-9 text-xs font-bold"
                        />
                      </div>
                      {options.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                          title="Hapus Baris"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Field>
                <FieldLabel className="text-xs font-bold">
                  Keterangan Tambahan (Opsional)
                </FieldLabel>
                <Input
                  placeholder="Catatan peruntukan grup modifier..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-xs"
                />
              </Field>
            </div>

            <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row justify-between items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="cursor-pointer text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!groupName.trim() || upsertMutation.isPending}
                className="font-bold gap-1.5 cursor-pointer text-xs"
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingGroup ? 'Simpan Perubahan' : 'Tambah Master Modifier'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModifierManagerTab;
