import React, { useState } from 'react';
import {
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  CheckCircle2,
  Lock,
  History,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { db } from '@/lib/db';
import { formatCurrency } from '@/utils/format-currency';
import {
  useActiveShift,
  useCashMovements,
  useShiftHistory,
} from '@/features/shifts/hooks/use-shifts';
import { OpenShiftDialog } from '@/features/shifts/components/open-shift-dialog';
import { CloseShiftDialog } from '@/features/shifts/components/close-shift-dialog';
import { CashMovementDialog } from '@/features/shifts/components/cash-movement-dialog';
import { ShiftReportDialog } from '@/features/shifts/components/shift-report-dialog';
import type { Shift, CashMovementType } from '@/types/shift.types';

export const ShiftsPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  const { data: activeShift, isLoading: isActiveShiftLoading } = useActiveShift(
    settings?.activeOutletId
  );
  const { data: cashMovements = [] } = useCashMovements(activeShift?.id);
  const { data: shiftHistory = [] } = useShiftHistory({
    outletId: settings?.activeOutletId,
  });

  // Modal states
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [movementModalType, setMovementModalType] = useState<CashMovementType | null>(null);
  const [reportModalShift, setReportModalShift] = useState<{
    shift: Shift;
    type: 'X_REPORT' | 'Z_REPORT';
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'movements' | 'history'>('movements');

  const storeName = settings?.storeName || 'Tookoo Store';
  const cashierName = settings?.defaultCashier || t('auth.roles.cashier', 'Kasir 1');
  const terminalName =
    settings?.deviceName || t('settings.deviceProfile.deviceName', 'Terminal Utama');

  const currentCashInDrawer = activeShift
    ? activeShift.startingCash +
      (activeShift.totalCashSales || 0) +
      (activeShift.totalPaidIn || 0) -
      (activeShift.totalPaidOut || 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('shifts.title', 'Shift & Uang Kas')}
        description={t(
          'shifts.subtitle',
          'Pencatatan kas modal awal, serah terima shift staf, dan rekonsiliasi uang fisik laci kasir.'
        )}
        actions={
          activeShift ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setReportModalShift({
                    shift: activeShift,
                    type: 'X_REPORT',
                  })
                }
                className="gap-2 text-xs font-semibold cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>{t('shifts.printXReport', 'Cetak Laporan X')}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCloseShiftModalOpen(true)}
                className="gap-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
              >
                <Lock className="h-4 w-4" />
                <span>{t('shifts.closeShift', 'Tutup Shift Kasir')}</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="gap-2 text-xs font-bold cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{t('shifts.openNewShift', 'Buka Shift Baru')}</span>
            </Button>
          )
        }
      />

      {/* STATE 1: NO ACTIVE SHIFT (EMPTY STATE) */}
      {!isActiveShiftLoading && !activeShift && (
        <Card className="p-8 text-center rounded-xl border border-dashed space-y-4 bg-card shadow-none">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Clock className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-foreground">
              Belum Ada Shift Kasir yang Aktif
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Buka shift kasir baru dan masukkan modal kas awal untuk mulai mencatat transaksi penjualan serta pergerakan uang laci.
            </p>
          </div>
          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="gap-2 text-xs font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Buka Shift Kasir Sekarang</span>
            </Button>
          </div>
        </Card>
      )}

      {/* STATE 2: ACTIVE SHIFT DASHBOARD */}
      {activeShift && (
        <>
          {/* Active Shift Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Shift Status & Cashier */}
            <Card className="rounded-xl shadow-none border">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('shifts.currentShift', 'Shift Saat Ini')}
                  </span>
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  >
                    <CheckCircle2 className="size-3" />
                    <span>{activeShift.shiftNumber || 'Shift Aktif'}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="text-xl font-bold text-foreground">
                  {activeShift.cashierName || cashierName}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>
                    Dibuka:{' '}
                    {new Date(activeShift.openedAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('shifts.terminal', 'Terminal')}:{' '}
                  <span className="text-foreground font-medium">
                    {activeShift.terminalName || terminalName}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Cash Drawer Float & Physical Cash Balance */}
            <Card className="rounded-xl shadow-none border">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('shifts.cashDrawer', 'Saldo Kas Fisik Laci')}
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="text-2xl font-bold text-foreground font-mono">
                  {formatCurrency(currentCashInDrawer)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <span>{t('shifts.initialCash', 'Modal Kas Awal')}:</span>
                  <span className="font-medium text-foreground font-mono">
                    {formatCurrency(activeShift.startingCash)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('shifts.cashSales', 'Penjualan Tunai')}:</span>
                  <span className="font-medium text-foreground font-mono">
                    {formatCurrency(activeShift.totalCashSales || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Non-Cash & Order Statistics */}
            <Card className="rounded-xl shadow-none border">
              <CardHeader className="p-4 pb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('shifts.nonCashSales', 'Transaksi Non-Tunai & Omzet')}
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="text-2xl font-bold text-foreground font-mono">
                  {formatCurrency(activeShift.totalNonCashSales || 0)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <span>{t('shifts.shiftOrders', 'Total Transaksi Shift')}:</span>
                  <span className="font-medium text-foreground">
                    {t('shifts.ordersCount', '{{count}} Pesanan', {
                      count: activeShift.ordersCount || 0,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Omzet Keseluruhan:</span>
                  <span className="font-medium text-primary font-mono">
                    {formatCurrency(
                      (activeShift.totalCashSales || 0) + (activeShift.totalNonCashSales || 0)
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Drawer Operational Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 rounded-xl shadow-none border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {t('shifts.paidIn', 'Kas Masuk')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('shifts.paidInDesc', 'Tambah uang modal atau uang kembalian ke laci kasir.')}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMovementModalType('PAID_IN')}
                className="gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('shifts.paidInBtn', 'Kas Masuk')}</span>
              </Button>
            </Card>

            <Card className="p-4 rounded-xl shadow-none border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {t('shifts.paidOut', 'Kas Keluar')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('shifts.paidOutDesc', 'Ambil uang dari laci untuk kebutuhan operasional toko.')}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMovementModalType('PAID_OUT')}
                className="gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('shifts.paidOutBtn', 'Kas Keluar')}</span>
              </Button>
            </Card>
          </div>
        </>
      )}

      {/* Tabs: Cash Movements vs Shift History */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'movements' | 'history')}
        className="space-y-4"
      >
        <TabsList className="h-9 p-1 bg-muted/60">
          <TabsTrigger value="movements" className="gap-1.5 text-xs font-bold px-3 py-1">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Pergerakan Kas Shift Ini</span>
            {cashMovements.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {cashMovements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs font-bold px-3 py-1">
            <History className="h-3.5 w-3.5" />
            <span>Riwayat Shift Sebelumnya</span>
            {shiftHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {shiftHistory.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CASH MOVEMENTS */}
        <TabsContent value="movements" className="space-y-4 m-0">
          <Card className="rounded-xl shadow-none border">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold text-foreground">
                Daftar Kas Masuk & Keluar (Shift Berjalan)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Rincian penambahan modal dan pengeluaran operasional yang dicatat selama shift aktif ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {cashMovements.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Belum ada catatan kas masuk atau kas keluar pada shift ini.
                </div>
              ) : (
                <div className="divide-y">
                  {cashMovements.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                            m.type === 'PAID_IN'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {m.type === 'PAID_IN' ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {m.reason || m.category}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {m.category}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(m.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WIB • Oleh: {m.performedBy}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            m.type === 'PAID_IN'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          }`}
                        >
                          {m.type === 'PAID_IN' ? '+' : '-'}
                          {formatCurrency(m.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SHIFT HISTORY */}
        <TabsContent value="history" className="space-y-4 m-0">
          <Card className="rounded-xl shadow-none border">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold text-foreground">
                Riwayat Penutupan Shift Sebelumnya
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Daftar seluruh shift yang telah ditutup beserta laporan rekonsiliasi kas laci.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {shiftHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Belum ada riwayat shift yang tersimpan.
                </div>
              ) : (
                <div className="divide-y">
                  {shiftHistory.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-foreground text-sm">
                            {s.shiftNumber || 'Shift'}
                          </span>
                          <Badge
                            variant={s.status === 'OPEN' ? 'default' : 'secondary'}
                            className="text-[10px]"
                          >
                            {s.status === 'OPEN' ? 'Aktif' : 'Ditutup'}
                          </Badge>
                          {s.status === 'CLOSED' && s.cashDifference !== undefined && (
                            <Badge
                              variant={
                                s.cashDifference === 0
                                  ? 'outline'
                                  : s.cashDifference > 0
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-[10px]"
                            >
                              {s.cashDifference === 0
                                ? 'Kas Pas'
                                : s.cashDifference > 0
                                ? `+${formatCurrency(s.cashDifference)}`
                                : formatCurrency(s.cashDifference)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Kasir: <strong className="text-foreground">{s.cashierName}</strong> • Buka:{' '}
                          {new Date(s.openedAt).toLocaleString('id-ID')}
                          {s.closedAt && ` — Tutup: ${new Date(s.closedAt).toLocaleTimeString('id-ID')}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">
                            Total Penjualan:
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {formatCurrency((s.totalCashSales || 0) + (s.totalNonCashSales || 0))}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setReportModalShift({
                              shift: s,
                              type: 'Z_REPORT',
                            })
                          }
                          className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shrink-0"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Laporan Z</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: OPEN SHIFT DIALOG */}
      <OpenShiftDialog
        open={isOpenShiftModalOpen}
        onOpenChange={setIsOpenShiftModalOpen}
        defaultCashierName={cashierName}
        defaultTerminalName={terminalName}
      />

      {/* MODAL 2: CLOSE SHIFT DIALOG */}
      {activeShift && (
        <CloseShiftDialog
          open={isCloseShiftModalOpen}
          onOpenChange={setIsCloseShiftModalOpen}
          shift={activeShift}
          onSuccessClose={(closed) => {
            setReportModalShift({
              shift: closed,
              type: 'Z_REPORT',
            });
          }}
        />
      )}

      {/* MODAL 3: CASH MOVEMENT (PAID IN / PAID OUT) DIALOG */}
      {activeShift && (
        <CashMovementDialog
          open={Boolean(movementModalType)}
          onOpenChange={(open) => !open && setMovementModalType(null)}
          shiftId={activeShift.id}
          defaultType={movementModalType || 'PAID_IN'}
        />
      )}

      {/* MODAL 4: SHIFT REPORT (X-REPORT / Z-REPORT) SLIP DIALOG */}
      {reportModalShift && (
        <ShiftReportDialog
          open={Boolean(reportModalShift)}
          onOpenChange={(open) => !open && setReportModalShift(null)}
          shift={reportModalShift.shift}
          movements={cashMovements}
          storeName={storeName}
          reportType={reportModalShift.type}
        />
      )}
    </div>
  );
};

export default ShiftsPage;
