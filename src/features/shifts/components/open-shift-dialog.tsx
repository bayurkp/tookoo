import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Banknote, Sparkles, Loader2 } from 'lucide-react';
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
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { formatCurrency } from '@/utils/format-currency';
import { useOpenShift } from '../hooks/use-shifts';

interface OpenShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCashierName?: string;
  defaultTerminalName?: string;
}

const PRESET_AMOUNTS = [100000, 150000, 200000, 300000, 500000, 1000000];

export const OpenShiftDialog: React.FC<OpenShiftDialogProps> = ({
  open,
  onOpenChange,
  defaultCashierName = 'Kasir',
  defaultTerminalName = 'Terminal Utama',
}) => {
  const { t } = useTranslation();
  const openShiftMutation = useOpenShift();

  const [startingCash, setStartingCash] = useState<number>(200000);
  const [cashierName, setCashierName] = useState<string>(defaultCashierName);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (startingCash < 0) {
      setErrorMsg('Modal awal tidak boleh negatif.');
      return;
    }

    try {
      await openShiftMutation.mutateAsync({
        startingCash,
        cashierName: cashierName.trim() || defaultCashierName,
        terminalName: defaultTerminalName,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuka shift kasir.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {t('shifts.openModalTitle', 'Buka Shift Kasir Baru')}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t(
                  'shifts.openModalDesc',
                  'Catat modal kas awal di laci sebelum memulai melayani transaksi penjualan.'
                )}
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

          {/* Starting Cash Float */}
          <Field>
            <FieldLabel htmlFor="starting-cash-input" className="text-xs font-bold flex items-center justify-between">
              <span>{t('shifts.startingCashLabel', 'Modal Kas Awal Laci (Uang Pecahan/Kembalian)')}</span>
              <span className="font-mono text-primary font-bold">
                {formatCurrency(startingCash)}
              </span>
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                id="starting-cash-input"
                type="number"
                min="0"
                step="1000"
                value={startingCash || ''}
                onChange={(e) => setStartingCash(Number(e.target.value) || 0)}
                placeholder="0"
                className="pl-9 text-sm font-bold font-mono"
                required
              />
            </div>
            <FieldDescription>
              Jumlah uang fisik yang ditaruh di laci kasir saat toko mulai buka.
            </FieldDescription>
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
                  variant={startingCash === amt ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStartingCash(amt)}
                  className="h-7 text-[11px] font-semibold cursor-pointer"
                >
                  {formatCurrency(amt)}
                </Button>
              ))}
            </div>
          </div>

          {/* Cashier Name */}
          <Field>
            <FieldLabel htmlFor="cashier-name-input" className="text-xs font-bold">
              {t('shifts.cashierNameLabel', 'Nama Kasir Petugas')}
            </FieldLabel>
            <Input
              id="cashier-name-input"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              placeholder="Contoh: Kasir 1 / Budi"
              className="h-9 text-xs"
              required
            />
          </Field>

          {/* Notes */}
          <Field>
            <FieldLabel htmlFor="shift-notes-input" className="text-xs font-bold">
              {t('shifts.notesLabel', 'Catatan Pembukaan (Opsional)')}
            </FieldLabel>
            <Input
              id="shift-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Shift Pagi, laci kasir bersih..."
              className="h-9 text-xs"
            />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={openShiftMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={openShiftMutation.isPending}
              className="font-bold gap-1.5 cursor-pointer"
            >
              {openShiftMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Membuka Shift...</span>
                </>
              ) : (
                <>
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Buka Shift Kasir</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
