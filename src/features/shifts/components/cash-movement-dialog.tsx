import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Loader2, Sparkles } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { formatCurrency } from '@/utils/format-currency';
import { useRecordCashMovement } from '../hooks/use-shifts';
import type { CashMovementType } from '@/types/shift.types';

interface CashMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftId: string;
  defaultType?: CashMovementType;
}

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

const PAID_IN_CATEGORIES = [
  'Modal Tambahan',
  'Uang Kembalian Receh',
  'Pengembalian Kasbon',
  'Penerimaan Lainnya',
];

const PAID_OUT_CATEGORIES = [
  'Biaya Operasional Toko',
  'Beli Perlengkapan & Bahan Kasir',
  'Pengambilan Kas Pemilik (Prive)',
  'Pembayaran Kurir / Logistik',
  'Pembayaran Supplier',
  'Pengeluaran Darurat',
  'Pengeluaran Lainnya',
];

export const CashMovementDialog: React.FC<CashMovementDialogProps> = ({
  open,
  onOpenChange,
  shiftId,
  defaultType = 'PAID_IN',
}) => {
  const recordMovementMutation = useRecordCashMovement();

  const [type, setType] = useState<CashMovementType>(defaultType);
  const [amount, setAmount] = useState<number>(50000);
  const [category, setCategory] = useState<string>(
    defaultType === 'PAID_IN' ? PAID_IN_CATEGORIES[0] : PAID_OUT_CATEGORIES[0]
  );
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = type === 'PAID_IN' ? PAID_IN_CATEGORIES : PAID_OUT_CATEGORIES;

  const handleTypeChange = (newType: CashMovementType) => {
    setType(newType);
    setCategory(newType === 'PAID_IN' ? PAID_IN_CATEGORIES[0] : PAID_OUT_CATEGORIES[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (amount <= 0) {
      setErrorMsg('Nominal uang kas harus lebih besar dari Rp 0.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Harap masukkan alasan atau keterangan pergerakan kas.');
      return;
    }

    try {
      await recordMovementMutation.mutateAsync({
        shiftId,
        type,
        amount,
        category,
        reason: reason.trim(),
      });
      onOpenChange(false);
      setReason('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencatat pergerakan kas.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                type === 'PAID_IN'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              {type === 'PAID_IN' ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {type === 'PAID_IN' ? 'Catat Kas Masuk (Paid In)' : 'Catat Kas Keluar (Paid Out)'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {type === 'PAID_IN'
                  ? 'Tambah uang modal atau uang pecahan kembalian ke laci kasir.'
                  : 'Ambil uang tunai dari laci untuk kebutuhan operasional kasir.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs font-semibold text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Type Toggle Tabs */}
          <Tabs
            value={type}
            onValueChange={(val) => handleTypeChange(val as CashMovementType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="PAID_IN" className="gap-1.5 text-xs font-bold">
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                <span>Kas Masuk (+ Masuk)</span>
              </TabsTrigger>
              <TabsTrigger value="PAID_OUT" className="gap-1.5 text-xs font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" />
                <span>Kas Keluar (- Keluar)</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount Field */}
          <Field>
            <FieldLabel htmlFor="movement-amount-input" className="text-xs font-bold flex items-center justify-between">
              <span>Nominal Kas *</span>
              <span className="font-mono text-primary font-bold">{formatCurrency(amount)}</span>
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                id="movement-amount-input"
                type="number"
                min="1000"
                step="1000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                placeholder="0"
                className="pl-9 text-base font-bold font-mono"
                required
                autoFocus
              />
            </div>
          </Field>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Pilihan Cepat Nominal:</span>
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant={amount === amt ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(amt)}
                  className="h-7 text-[11px] font-semibold cursor-pointer"
                >
                  {formatCurrency(amt)}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <Field>
            <FieldLabel htmlFor="movement-category-select" className="text-xs font-bold">Kategori Pergerakan Kas</FieldLabel>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="movement-category-select" className="h-9 text-xs">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Reason / Note */}
          <Field>
            <FieldLabel htmlFor="movement-reason-input" className="text-xs font-bold">Keterangan / Alasan *</FieldLabel>
            <Input
              id="movement-reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                type === 'PAID_IN'
                  ? 'Contoh: Tambah uang kembalian pecahan 2rb & 5rb...'
                  : 'Contoh: Beli kertas thermal printer kasir...'
              }
              className="h-9 text-xs"
              required
            />
            <FieldDescription>
              Tuliskan tujuan pencatatan kas agar pembukuan tetap transparan dan akurat.
            </FieldDescription>
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={recordMovementMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={recordMovementMutation.isPending}
              className={`font-bold gap-1.5 cursor-pointer ${
                type === 'PAID_IN' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
            >
              {recordMovementMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Pergerakan Kas</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
