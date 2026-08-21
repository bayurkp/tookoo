import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Lock,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { formatCurrency } from '@/utils/format-currency';
import { useCloseShift } from '../hooks/use-shifts';
import type { Shift } from '@/types/shift.types';

interface CloseShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  onSuccessClose?: (closedShift: Shift) => void;
}

export const CloseShiftDialog: React.FC<CloseShiftDialogProps> = ({
  open,
  onOpenChange,
  shift,
  onSuccessClose,
}) => {
  const { t } = useTranslation();
  const closeShiftMutation = useCloseShift();

  const expectedEndingCash =
    shift.startingCash +
    (shift.totalCashSales || 0) +
    (shift.totalPaidIn || 0) -
    (shift.totalPaidOut || 0);

  const [actualCash, setActualCash] = useState<number>(expectedEndingCash);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync actual cash with expected ending cash when modal opens
  useEffect(() => {
    if (open) {
      setActualCash(expectedEndingCash);
      setNotes('');
      setErrorMsg(null);
    }
  }, [open, expectedEndingCash]);

  const difference = actualCash - expectedEndingCash;

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (actualCash < 0) {
      setErrorMsg('Jumlah uang kas fisik tidak boleh negatif.');
      return;
    }

    try {
      const closed = await closeShiftMutation.mutateAsync({
        shiftId: shift.id,
        actualEndingCash: actualCash,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      onSuccessClose?.(closed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menutup shift kasir.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {t('shifts.closeModalTitle', 'Tutup Shift & Rekonsiliasi Kas')}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Hitung uang fisik di laci kasir dan bandingkan dengan catatan transaksi sistem.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCloseSubmit} className="space-y-4 py-1">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs font-semibold text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Shift Details Summary Box */}
          <div className="p-3.5 bg-muted/40 border rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-muted-foreground">Nomor Shift:</span>
              <span className="font-mono font-bold text-foreground">
                {shift.shiftNumber || 'Shift 1'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Modal Awal:</span>
                <span className="font-semibold text-foreground font-mono">
                  {formatCurrency(shift.startingCash)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Penjualan Tunai:</span>
                <span className="font-semibold text-foreground font-mono">
                  {formatCurrency(shift.totalCashSales || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kas Masuk:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  +{formatCurrency(shift.totalPaidIn || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kas Keluar:</span>
                <span className="font-semibold text-destructive font-mono">
                  -{formatCurrency(shift.totalPaidOut || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between font-bold text-xs bg-background/80 p-2 rounded-lg">
              <span className="text-foreground">Ekspektasi Uang di Laci:</span>
              <span className="font-mono text-primary text-sm">
                {formatCurrency(expectedEndingCash)}
              </span>
            </div>
          </div>

          {/* Actual Physical Cash Counted */}
          <Field>
            <FieldLabel htmlFor="actual-cash-input" className="text-xs font-bold flex items-center justify-between">
              <span>Uang Fisik Dihitung (Hasil Hitung Kasir) *</span>
              <span className="font-mono text-foreground font-bold">
                {formatCurrency(actualCash)}
              </span>
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                id="actual-cash-input"
                type="number"
                min="0"
                step="1000"
                value={actualCash || ''}
                onChange={(e) => setActualCash(Number(e.target.value) || 0)}
                placeholder="0"
                className="pl-9 text-base font-bold font-mono"
                required
                autoFocus
              />
            </div>
            <FieldDescription>
              Hitung uang kertas dan koin yang ada di dalam laci secara teliti.
            </FieldDescription>
          </Field>

          {/* Difference Status Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              difference === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : difference > 0
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {difference === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Uang Kas Pas (Sesuai Sistem)</span>
                </>
              ) : difference > 0 ? (
                <>
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Kas Lebih (+Surplus)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Kas Kurang (-Shortage)</span>
                </>
              )}
            </div>

            <Badge
              variant={difference === 0 ? 'default' : difference > 0 ? 'secondary' : 'destructive'}
              className="font-mono text-xs font-bold px-2 py-0.5"
            >
              {difference > 0 ? `+${formatCurrency(difference)}` : formatCurrency(difference)}
            </Badge>
          </div>

          {/* Notes */}
          <Field>
            <FieldLabel htmlFor="close-notes-input" className="text-xs font-bold">
              Catatan Penutupan Shift (Opsional)
            </FieldLabel>
            <Input
              id="close-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Selisih uang tip kasir / uang kembalian receh..."
              className="h-9 text-xs"
            />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={closeShiftMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={closeShiftMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 cursor-pointer"
            >
              {closeShiftMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menutup Shift...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Konfirmasi & Tutup Shift</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
