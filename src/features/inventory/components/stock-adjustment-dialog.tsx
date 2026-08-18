import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateStockAdjustment } from '../hooks/use-stock-adjustments';
import { useProducts } from '@/features/products/hooks/use-products';
import { useAuthStore } from '@/stores/auth-store';
import type { StockAdjustmentReason } from '@/types/stock-adjustment.types';
import {
  PackagePlus,
  AlertTriangle,
  Clock,
  Coffee,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REASONS: {
  value: StockAdjustmentReason;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    value: 'RESTOCK',
    label: 'Kulakan / Stok Masuk',
    desc: 'Pembelian barang baru dari supplier/pasar',
    icon: PackagePlus,
  },
  {
    value: 'PHYSICAL_COUNT',
    label: 'Koreksi Hitung Fisik',
    desc: 'Menyamakan selisih stok riil di toko',
    icon: CheckCircle2,
  },
  {
    value: 'DAMAGED',
    label: 'Barang Rusak / Pecah',
    desc: 'Barang cacat atau tidak layak jual',
    icon: AlertTriangle,
  },
  {
    value: 'EXPIRED',
    label: 'Kadaluarsa / Basi',
    desc: 'Bahan/produk melewati tanggal expired',
    icon: Clock,
  },
  {
    value: 'INTERNAL_USE',
    label: 'Pemakaian Sendiri / Toko',
    desc: 'Dipakai untuk konsumsi atau operasional toko',
    icon: Coffee,
  },
  {
    value: 'OTHER',
    label: 'Alasan Lainnya',
    desc: 'Penyesuaian stok lainnya dengan catatan',
    icon: HelpCircle,
  },
];

export const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: products = [] } = useProducts();
  const createMutation = useCreateStockAdjustment();
  const currentRole = useAuthStore((state) => state.role);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [reason, setReason] = useState<StockAdjustmentReason>('RESTOCK');
  const [mode, setMode] = useState<'NEW_VALUE' | 'DELTA'>('NEW_VALUE');
  const [valueInput, setValueInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedVariant = selectedProduct?.variants?.find((v) => v.id === selectedVariantId);

  // Determine current stock
  const currentStock = selectedVariant
    ? selectedVariant.stock
    : selectedProduct?.stock ?? 0;

  // Compute final adjusted stock & difference
  const numInput = Number(valueInput) || 0;
  const finalStock =
    mode === 'NEW_VALUE' ? Math.max(0, numInput) : Math.max(0, currentStock + numInput);
  const diff = finalStock - currentStock;

  const handleReset = () => {
    setSelectedProductId('');
    setSelectedVariantId('');
    setValueInput('');
    setNotes('');
    setReason('RESTOCK');
    setMode('NEW_VALUE');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await createMutation.mutateAsync({
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name,
            previousStock: currentStock,
            adjustedStock: finalStock,
            difference: diff,
            reason,
            notes,
          },
        ],
        adjustedBy: currentRole === 'OWNER' ? 'Pemilik Toko' : 'Kasir',
        notes,
      });

      handleReset();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create stock adjustment:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleReset();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md h-[85vh] max-h-[640px] min-h-[480px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
          <DialogTitle className="text-base font-bold">Penyesuaian Stok (Adjustment)</DialogTitle>
          <DialogDescription className="text-xs">
            Catat barang masuk (kulakan), barang rusak, atau koreksi hitung fisik toko.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
            {/* 1. Select Product with shadcn Select */}
            <Field>
              <FieldLabel className="text-xs font-bold">Pilih Produk *</FieldLabel>
              <Select
                value={selectedProductId}
                onValueChange={(val) => {
                  setSelectedProductId(val);
                  setSelectedVariantId('');
                }}
              >
                <SelectTrigger className="w-full h-10 text-xs font-medium">
                  <SelectValue placeholder="-- Pilih Produk yang Disesuaikan --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {products
                      .filter((p) => p.productType !== 'SERVICE')
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} (Stok: {p.stock} {p.unit || 'pcs'})
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* 2. Select Variant (if any) with shadcn Select */}
            {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
              <Field>
                <FieldLabel className="text-xs font-bold">Pilih Varian Khusus *</FieldLabel>
                <Select
                  value={selectedVariantId}
                  onValueChange={(val) => setSelectedVariantId(val)}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-medium">
                    <SelectValue placeholder="-- Pilih Varian --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectedProduct.variants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} (Stok: {v.stock} {selectedProduct.unit || 'pcs'})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            {/* Current Stock Banner */}
            {selectedProduct && (
              <div className="p-3 bg-muted/40 rounded-xl border border-border/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Stok Tercatat di Sistem</p>
                  <p className="text-base font-extrabold text-foreground">{currentStock} unit</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Hasil Stok Akhir</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-base font-extrabold text-primary">{finalStock} unit</span>
                    {diff !== 0 && (
                      <Badge
                        variant={diff > 0 ? 'secondary' : 'destructive'}
                        className="text-[10px] px-1.5 py-0 font-bold"
                      >
                        {diff > 0 ? `+${diff}` : `${diff}`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Adjustment Mode */}
            <div className="space-y-1.5">
              <FieldLabel className="text-xs font-bold">Cara Input Penyesuaian *</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('NEW_VALUE');
                    setValueInput('');
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'NEW_VALUE'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>Set Jumlah Akhir</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('DELTA');
                    setValueInput('');
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'DELTA'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>Tambah / Kurang (+/-)</span>
                </button>
              </div>
            </div>

            {/* 4. Value Input */}
            <Field>
              <FieldLabel className="text-xs font-bold">
                {mode === 'NEW_VALUE' ? 'Jumlah Stok Fisik Riil Sekarang *' : 'Jumlah Penambahan / Pengurangan (+/-) *'}
              </FieldLabel>
              <Input
                type="number"
                placeholder={mode === 'NEW_VALUE' ? String(currentStock) : 'Contoh: 10 atau -2'}
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                required
                className="h-10 text-sm font-bold"
              />
            </Field>

            {/* 5. Reason Selection */}
            <div className="space-y-1.5">
              <FieldLabel className="text-xs font-bold">Alasan Penyesuaian *</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => {
                  const IconComponent = r.icon;
                  const isSelected = reason === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setReason(r.value)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                          : 'border-border hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <IconComponent className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="line-clamp-1">{r.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                        {r.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Notes */}
            <Field>
              <FieldLabel className="text-xs font-bold">Catatan / Keterangan (Opsional)</FieldLabel>
              <Input
                placeholder="Contoh: Kulakan dari Agen Jaya / 2 botol pecah saat bongkar muat"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>
          </div>

          <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!selectedProduct || createMutation.isPending}
              className="font-bold gap-1.5 cursor-pointer text-xs"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Penyesuaian</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentDialog;
