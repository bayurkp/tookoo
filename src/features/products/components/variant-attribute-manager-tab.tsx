import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Table as TableIcon,
  Tag,
  X,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  useMasterVariantAttributes,
  useUpsertMasterVariantAttribute,
  useDeleteMasterVariantAttribute,
} from '../hooks/use-master-data';
import { VariantTableTab } from './variant-table-tab';
import type { Product } from '@/types/product.types';
import type { MasterVariantAttribute } from '@/types/master-data.types';

interface VariantAttributeManagerTabProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
}

export const VariantAttributeManagerTab: React.FC<VariantAttributeManagerTabProps> = ({
  products,
  onEditProduct,
}) => {
  const [viewMode, setViewMode] = useState<'TEMPLATES' | 'TABLE'>('TEMPLATES');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<MasterVariantAttribute | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [presetOptions, setPresetOptions] = useState<string[]>([]);

  const { data: masterAttributes = [] } = useMasterVariantAttributes();
  const upsertMutation = useUpsertMasterVariantAttribute();
  const deleteMutation = useDeleteMasterVariantAttribute();

  const filteredAttributes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return masterAttributes;
    return masterAttributes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.presetOptions.some((opt) => opt.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }, [masterAttributes, searchQuery]);

  const handleOpenCreate = () => {
    setEditingAttr(null);
    setName('');
    setDescription('');
    setTagInput('');
    setPresetOptions(['Pilihan 1', 'Pilihan 2']);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (attr: MasterVariantAttribute) => {
    setEditingAttr(attr);
    setName(attr.name);
    setDescription(attr.description || '');
    setTagInput('');
    setPresetOptions([...attr.presetOptions]);
    setIsFormOpen(true);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !presetOptions.includes(val)) {
        setPresetOptions((prev) => [...prev, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (optionToRemove: string) => {
    setPresetOptions((prev) => prev.filter((opt) => opt !== optionToRemove));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalOptions = [...presetOptions];
    if (tagInput.trim() && !finalOptions.includes(tagInput.trim())) {
      finalOptions.push(tagInput.trim());
    }

    if (finalOptions.length === 0) {
      alert('Harap masukkan minimal 1 opsi nilai varian.');
      return;
    }

    await upsertMutation.mutateAsync({
      id: editingAttr?.id,
      name: name.trim(),
      description: description.trim(),
      presetOptions: finalOptions,
    });

    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      {/* Sub-view switcher & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('TEMPLATES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'TEMPLATES'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Master Dimensi Varian</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'TABLE'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5 text-primary" />
              <span>Tabel Flat Varian Toko</span>
            </button>
          </div>
        </div>

        {viewMode === 'TEMPLATES' && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari atribut varian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="gap-1.5 font-bold cursor-pointer shrink-0 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Master Varian</span>
            </Button>
          </div>
        )}
      </div>

      {/* Render View Mode */}
      {viewMode === 'TABLE' ? (
        <VariantTableTab products={products} onEditProduct={onEditProduct} />
      ) : filteredAttributes.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <Layers className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Belum ada master varian terdaftar</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Master varian seperti Ukuran, Warna, dan Suhu dapat dipilih langsung saat membuat produk
            varian.
          </p>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5 font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Master Varian</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttributes.map((attr) => (
            <Card
              key={attr.id}
              className="border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between rounded-xl shadow-none"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{attr.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {attr.presetOptions.length} Opsi bawaan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(attr)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Edit Master Varian"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Hapus Master Varian"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Hapus Master Varian &ldquo;{attr.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                          Template varian ini akan dihapus dari daftar pilihan cepat produk.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(attr.id)}
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
                {/* Preset Option Chips */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Nilai Opsi Bawaan:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {attr.presetOptions.map((opt) => (
                      <span
                        key={opt}
                        className="inline-flex items-center text-[11px] bg-muted px-2 py-0.5 rounded-md text-foreground font-medium border border-border/50"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1 text-primary shrink-0" />
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                {attr.description && (
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border/60 line-clamp-1">
                    {attr.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Master Variant Attribute Modal Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md h-[85vh] max-h-[560px] min-h-[420px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-base font-bold">
              {editingAttr ? 'Edit Master Dimensi Varian' : 'Tambah Master Dimensi Varian'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Buat template dimensi (seperti Ukuran, Warna, Suhu) dengan opsi nilainya untuk dipakai
              ulang di produk.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitForm}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <Field>
                <FieldLabel htmlFor="dim-manager-name" className="text-xs font-bold">Nama Atribut Dimensi *</FieldLabel>
                <Input
                  id="dim-manager-name"
                  placeholder="Contoh: Ukuran, Suhu, Level Gula, Warna, Bahan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </Field>

              {/* Tag / Chip values editor */}
              <Field>
                <FieldLabel htmlFor="dim-manager-tag-input" className="text-xs font-bold">
                  Nilai Opsi Preset * (Ketik lalu tekan Enter)
                </FieldLabel>
                <Input
                  id="dim-manager-tag-input"
                  placeholder="Ketik nama opsi lalu tekan Enter (misal: Small, Medium, Large)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="h-9 text-xs"
                />

                <div className="flex flex-wrap gap-1.5 pt-1.5 min-h-[40px] p-2 bg-muted/30 rounded-lg border border-border/60">
                  {presetOptions.map((opt) => (
                    <Badge
                      key={opt}
                      variant="secondary"
                      className="gap-1 text-xs px-2 py-0.5 bg-background border border-border text-foreground"
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(opt)}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {presetOptions.length === 0 && (
                    <span className="text-xs text-muted-foreground/60 italic">
                      Belum ada opsi ditambahkan.
                    </span>
                  )}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="dim-manager-desc" className="text-xs font-bold">
                  Keterangan / Deskripsi (Opsional)
                </FieldLabel>
                <Input
                  id="dim-manager-desc"
                  placeholder="Deskripsi atribut varian..."
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
                disabled={!name.trim() || upsertMutation.isPending}
                className="font-bold gap-1.5 cursor-pointer text-xs"
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingAttr ? 'Simpan Perubahan' : 'Tambah Master Varian'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariantAttributeManagerTab;
