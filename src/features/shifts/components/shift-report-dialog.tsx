import React, { useRef } from 'react';
import { Printer, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-currency';
import type { Shift, CashMovement } from '@/types/shift.types';

interface ShiftReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  movements?: CashMovement[];
  storeName?: string;
  reportType?: 'X_REPORT' | 'Z_REPORT';
}

export const ShiftReportDialog: React.FC<ShiftReportDialogProps> = ({
  open,
  onOpenChange,
  shift,
  movements = [],
  storeName = 'Tookoo Store',
  reportType = 'X_REPORT',
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const isZReport = reportType === 'Z_REPORT' || shift.status === 'CLOSED';
  const expectedCash =
    shift.startingCash +
    (shift.totalCashSales || 0) +
    (shift.totalPaidIn || 0) -
    (shift.totalPaidOut || 0);

  const actualCash = isZReport && shift.actualEndingCash !== undefined ? shift.actualEndingCash : expectedCash;
  const difference = isZReport && shift.cashDifference !== undefined ? shift.cashDifference : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{isZReport ? 'Laporan Z (Tutup Shift)' : 'Laporan X (Shift Berjalan)'}</span>
                <Badge
                  variant={isZReport ? 'default' : 'outline'}
                  className={`text-[10px] ${
                    isZReport
                      ? 'bg-amber-600 text-white font-bold'
                      : 'border-primary text-primary font-bold'
                  }`}
                >
                  {isZReport ? 'Laporan Z' : 'Laporan X'}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isZReport
                  ? 'Rekapitulasi final transaksi dan rekonsiliasi kas saat shift ditutup.'
                  : 'Ringkasan penjualan dan saldo laci kas saat shift masih berjalan.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Thermal Receipt Slip Card */}
        <div
          ref={printAreaRef}
          className="p-4 bg-zinc-50 dark:bg-zinc-900 border rounded-xl font-mono text-xs text-zinc-900 dark:text-zinc-100 space-y-3 print:m-0 print:p-0 print:border-none"
        >
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700 space-y-0.5">
            <h3 className="font-bold text-sm uppercase tracking-wide">{storeName}</h3>
            <p className="text-[11px] font-bold text-muted-foreground">
              {isZReport ? 'LAPORAN PENUTUPAN SHIFT (Z)' : 'LAPORAN AUDIT SHIFT (X)'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {shift.shiftNumber || 'SH-001'} • {shift.terminalName}
            </p>
          </div>

          {/* Shift Metadata */}
          <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kasir:</span>
              <span className="font-bold">{shift.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu Buka:</span>
              <span>{new Date(shift.openedAt).toLocaleString('id-ID')}</span>
            </div>
            {shift.closedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu Tutup:</span>
                <span>{new Date(shift.closedAt).toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status Shift:</span>
              <span className="font-bold">{shift.status === 'OPEN' ? 'SEDANG AKTIF' : 'DITUTUP'}</span>
            </div>
          </div>

          {/* Sales Breakdown */}
          <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="font-bold text-xs pb-1">RINGKASAN PENJUALAN:</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pesanan:</span>
              <span className="font-bold">{shift.ordersCount || 0} Transaksi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penjualan Tunai:</span>
              <span className="font-bold">{formatCurrency(shift.totalCashSales || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penjualan Non-Tunai:</span>
              <span className="font-bold">{formatCurrency(shift.totalNonCashSales || 0)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-bold">
              <span>Total Omzet Shift:</span>
              <span className="text-primary">
                {formatCurrency((shift.totalCashSales || 0) + (shift.totalNonCashSales || 0))}
              </span>
            </div>
          </div>

          {/* Cash Drawer Reconciliation */}
          <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="font-bold text-xs pb-1">REKONSILIASI KAS LACI:</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">(+) Modal Kas Awal:</span>
              <span>{formatCurrency(shift.startingCash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">(+) Penjualan Tunai:</span>
              <span>+{formatCurrency(shift.totalCashSales || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">(+) Total Kas Masuk:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(shift.totalPaidIn || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">(-) Total Kas Keluar:</span>
              <span className="text-destructive">-{formatCurrency(shift.totalPaidOut || 0)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-bold">
              <span>Kas Seharusnya di Laci:</span>
              <span>{formatCurrency(expectedCash)}</span>
            </div>

            {isZReport && (
              <>
                <div className="flex justify-between pt-1 font-bold">
                  <span>Kas Fisik Dihitung Kasir:</span>
                  <span>{formatCurrency(actualCash)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Selisih Kas (Over/Short):</span>
                  <span
                    className={
                      difference === 0
                        ? 'text-emerald-600'
                        : difference > 0
                        ? 'text-blue-600'
                        : 'text-destructive'
                    }
                  >
                    {difference > 0
                      ? `+${formatCurrency(difference)}`
                      : formatCurrency(difference)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Cash Movements Breakdown (if any) */}
          {movements.length > 0 && (
            <div className="text-[10px] space-y-1 pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="font-bold text-xs pb-1">RINCIAN KAS MASUK & KELUAR:</div>
              {movements.map((m) => (
                <div key={m.id} className="flex justify-between">
                  <span className="truncate max-w-[200px] text-muted-foreground">
                    {m.type === 'PAID_IN' ? '[+]' : '[-]'} {m.reason || m.category}
                  </span>
                  <span className={m.type === 'PAID_IN' ? 'text-emerald-600' : 'text-destructive'}>
                    {m.type === 'PAID_IN' ? '+' : '-'}
                    {formatCurrency(m.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Notes if present */}
          {shift.notes && (
            <div className="text-[10px] text-muted-foreground italic pb-1">
              Catatan: {shift.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 text-center text-[10px] text-muted-foreground gap-4">
            <div className="space-y-8">
              <span>Kasir Bertugas,</span>
              <span className="border-t border-zinc-400 dark:border-zinc-600 block pt-1 font-bold text-foreground">
                ( {shift.cashierName} )
              </span>
            </div>
            <div className="space-y-8">
              <span>Supervisor / Owner,</span>
              <span className="border-t border-zinc-400 dark:border-zinc-600 block pt-1 font-bold text-foreground">
                ( .................... )
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-1.5 font-bold cursor-pointer">
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak Struk Laporan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
