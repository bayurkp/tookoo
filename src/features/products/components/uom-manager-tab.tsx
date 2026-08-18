import React, { useState, useMemo } from 'react';
import { Scale, Plus, Search, Pencil, Trash2, Loader2, Package } from 'lucide-react';
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
import { useMasterUoms, useUpsertMasterUom, useDeleteMasterUom } from '../hooks/use-master-data';
import type { Product } from '@/types/product.types';
import type { MasterUom } from '@/types/master-data.types';

interface UomManagerTabProps {
  products: Product[];
}

export const UomManagerTab: React.FC<UomManagerTabProps> = ({ products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<MasterUom | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');

  const { data: masterUoms = [] } = useMasterUoms();
  const upsertMutation = useUpsertMasterUom();
  const deleteMutation = useDeleteMasterUom();

  // Compute products count per UOM symbol
  const uomsWithStats = useMemo(() => {
    return masterUoms.map((u) => {
      const matchingProducts = products.filter(
        (p) => (p.unit || 'pcs').toLowerCase() === u.symbol.toLowerCase()
      );
      return {
        ...u,
        productCount: matchingProducts.length,
      };
    });
  }, [masterUoms, products]);

  const filteredUoms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return uomsWithStats;
    return uomsWithStats.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.symbol.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q))
    );
  }, [uomsWithStats, searchQuery]);

  const handleOpenCreate = () => {
    setEditingUom(null);
    setName('');
    setSymbol('');
    setDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (uom: MasterUom) => {
    setEditingUom(uom);
    setName(uom.name);
    setSymbol(uom.symbol);
    setDescription(uom.description || '');
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) return;

    await upsertMutation.mutateAsync({
      id: editingUom?.id,
      name: name.trim(),
      symbol: symbol.trim().toLowerCase(),
      description: description.trim(),
    });

    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari satuan unit (misal: pcs, porsi, cup, kg)..."
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
          <span>Tambah Satuan</span>
        </Button>
      </div>

      {/* UOM Cards Grid */}
      {filteredUoms.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <Scale className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Belum ada satuan terdaftar</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Satuan unit memudahkan kasir dan pelanggan melihat takaran penjualan.
          </p>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5 font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Satuan Sekarang</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUoms.map((uom) => (
            <Card
              key={uom.id}
              className="border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between rounded-xl shadow-none"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0 font-mono">
                    {uom.symbol}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{uom.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Simbol:{' '}
                      <span className="font-mono font-bold text-foreground">{uom.symbol}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(uom)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Edit Satuan"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Hapus Satuan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Satuan &ldquo;{uom.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                          Satuan ini akan dihapus dari daftar pilihan cepat master.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(uom.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                        >
                          Ya, Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-2">
                {uom.description ? (
                  <p className="text-xs text-muted-foreground line-clamp-2">{uom.description}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">
                    Tanpa keterangan tambahan
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <span>{uom.productCount} Produk aktif</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {uom.symbol}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Master UOM Modal Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md h-[85vh] max-h-[500px] min-h-[380px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-base font-bold">
              {editingUom ? 'Edit Master Satuan' : 'Tambah Master Satuan'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tentukan nama satuan dan simbol singkatnya untuk ditampilkan di kasir dan struk.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitForm}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
              <Field>
                <FieldLabel className="text-xs font-bold">Nama Satuan Lengkap *</FieldLabel>
                <Input
                  placeholder="Contoh: Porsi Makanan, Gelas Minum, Kilogram, Cup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Simbol / Kode Singkat *</FieldLabel>
                <Input
                  placeholder="Contoh: porsi, cup, gelas, kg, pcs, pack"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  required
                  className="h-9 text-xs font-mono font-bold"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Simbol singkat akan dicetak di samping kuantitas struk (misal: 2 porsi, 1 cup).
                </p>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">
                  Keterangan / Deskripsi (Opsional)
                </FieldLabel>
                <Input
                  placeholder="Keterangan peruntukan satuan..."
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
                disabled={!name.trim() || !symbol.trim() || upsertMutation.isPending}
                className="font-bold gap-1.5 cursor-pointer text-xs"
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingUom ? 'Simpan Perubahan' : 'Tambah Satuan'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UomManagerTab;
