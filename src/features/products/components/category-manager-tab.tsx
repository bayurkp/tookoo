import React, { useState, useMemo } from 'react';
import { Folder, Plus, Search, Tag, ArrowRight, Pencil, Trash2, Loader2 } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useMasterCategories,
  useUpsertMasterCategory,
  useDeleteMasterCategory,
} from '../hooks/use-master-data';
import type { Product } from '@/types/product.types';
import type { MasterCategory } from '@/types/master-data.types';

interface CategoryManagerTabProps {
  products: Product[];
  onSelectCategoryFilter: (categoryName: string) => void;
  onOpenCreateProduct: (prefilledCategory?: string) => void;
}

export const CategoryManagerTab: React.FC<CategoryManagerTabProps> = ({
  products,
  onSelectCategoryFilter,
  onOpenCreateProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(null);

  // Form State
  const [categoryName, setCategoryName] = useState('');
  const [parentId, setParentId] = useState<string>('NONE');
  const [description, setDescription] = useState('');

  const { data: masterCategories = [] } = useMasterCategories();
  const upsertMutation = useUpsertMasterCategory();
  const deleteMutation = useDeleteMasterCategory();

  // Top level parent categories
  const parentCategories = useMemo(() => {
    return masterCategories.filter((c) => !c.parentId);
  }, [masterCategories]);

  // Hierarchical categories structure
  const hierarchicalCategories = useMemo(() => {
    return parentCategories.map((parent) => {
      const children = masterCategories.filter((c) => c.parentId === parent.id);
      const parentProducts = products.filter((p) => p.category === parent.name);
      const totalStock = parentProducts.reduce(
        (sum, p) => sum + (p.productType === 'SERVICE' ? 0 : p.stock),
        0
      );

      return {
        ...parent,
        subCategories: children,
        productCount: parentProducts.length,
        totalStock,
      };
    });
  }, [parentCategories, masterCategories, products]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return hierarchicalCategories;
    return hierarchicalCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.subCategories.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [hierarchicalCategories, searchQuery]);

  const handleOpenCreate = (prefilledParentId?: string) => {
    setEditingCategory(null);
    setCategoryName('');
    setParentId(prefilledParentId || 'NONE');
    setDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: MasterCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setParentId(category.parentId || 'NONE');
    setDescription(category.description || '');
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const parent = parentCategories.find((p) => p.id === parentId);

    await upsertMutation.mutateAsync({
      id: editingCategory?.id,
      name: categoryName.trim(),
      parentId: parentId === 'NONE' ? null : parentId,
      parentName: parentId === 'NONE' ? null : parent?.name,
      description: description.trim(),
    });

    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      {/* Category Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kategori atau sub-kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Button
          onClick={() => handleOpenCreate()}
          size="sm"
          className="gap-1.5 font-bold cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      {/* Category Cards Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <Folder className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Belum ada kategori terdaftar</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Buat kategori baru untuk mengelompokkan produk di katalog dan kasir.
          </p>
          <Button
            onClick={() => handleOpenCreate()}
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5 font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kategori Sekarang</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              className="border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between rounded-xl shadow-none"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Folder className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{cat.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {cat.productCount} Produk terdaftar
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs px-2 font-bold">
                    {cat.totalStock} Stok
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(cat)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Edit Kategori"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Hapus Kategori &ldquo;{cat.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                          Kategori ini dan seluruh sub-kategori di bawahnya akan dihapus dari daftar
                          pilihan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(cat.id)}
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
                {/* Sub-categories section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Sub-Kategori ({cat.subCategories.length}):
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenCreate(cat.id)}
                      className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Sub-Kategori</span>
                    </button>
                  </div>

                  {cat.subCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subCategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="group inline-flex items-center text-[11px] bg-muted/60 hover:bg-muted border border-border/60 px-2 py-0.5 rounded-lg text-foreground font-medium transition-colors"
                        >
                          <Tag className="h-2.5 w-2.5 mr-1 text-primary shrink-0" />
                          <span>{sub.name}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sub)}
                            className="ml-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      Belum ada sub-kategori
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectCategoryFilter(cat.name)}
                    className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                  >
                    <span>Lihat Produk</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenCreateProduct(cat.name)}
                    className="h-7 px-2 text-[11px] font-medium gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Produk</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Master Category Modal Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md h-[85vh] max-h-[500px] min-h-[380px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-base font-bold">
              {editingCategory ? 'Edit Master Kategori' : 'Tambah Master Kategori'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kategori memudahkan kasir menemukan produk dan menyusun laporan penjualan.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitForm}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <Field>
                <FieldLabel className="text-xs font-bold">Nama Kategori *</FieldLabel>
                <Input
                  placeholder="Contoh: Minuman Dingin, Snack Ringan, Kopi Susu"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">
                  Kategori Induk (Parent Category)
                </FieldLabel>
                <Select
                  value={parentId}
                  onValueChange={(val) => setParentId(val)}
                  disabled={Boolean(
                    editingCategory &&
                    parentCategories.some(
                      (p) =>
                        p.id === editingCategory.id &&
                        masterCategories.some((c) => c.parentId === editingCategory.id)
                    )
                  )}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium">
                    <SelectValue placeholder="Pilih Kategori Induk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="NONE">-- Kategori Utama (Tanpa Induk) --</SelectItem>
                      {parentCategories
                        .filter((p) => !editingCategory || p.id !== editingCategory.id)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pilih &ldquo;Kategori Utama&rdquo; jika ini kategori puncak, atau pilih induknya
                  jika merupakan sub-kategori.
                </p>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">
                  Keterangan / Deskripsi (Opsional)
                </FieldLabel>
                <Input
                  placeholder="Deskripsi singkat kategori produk..."
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
                disabled={!categoryName.trim() || upsertMutation.isPending}
                className="font-bold gap-1.5 cursor-pointer text-xs"
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagerTab;
