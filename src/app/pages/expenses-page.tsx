import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  ShoppingBag,
  Receipt,
  Search,
  FileImage,
  Sparkles,
  Wallet,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { ExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog';
import { ExpenseCard } from '@/features/expenses/components/expense-card';
import { ExpenseCategoryIcon } from '@/features/expenses/components/expense-category-icon';
import { CashFlowSummaryCard } from '@/features/expenses/components/cash-flow-summary-card';
import { ExpenseCategoryBreakdown } from '@/features/expenses/components/expense-category-breakdown';
import {
  useExpenses,
  useUpsertExpense,
  useDeleteExpense,
} from '@/features/expenses/hooks/use-expenses';
import { useOutlets } from '@/features/outlets/hooks/use-outlets';
import { Building2 } from 'lucide-react';
import { db } from '@/lib/db';
import { sounds } from '@/utils/audio';
import { formatCurrency } from '@/utils/format-currency';
import {
  EXPENSE_CATEGORY_META,
  type Expense,
  type ExpenseCategory,
  type ExpenseType,
} from '@/types/expense.types';

export const ExpensesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as ExpenseType | null;

  const { data: expenses = [], isLoading } = useExpenses();
  const { data: outlets = [] } = useOutlets();
  const [selectedOutletId, setSelectedOutletId] = useState<string>('ALL');
  const upsertMutation = useUpsertExpense();
  const deleteMutation = useDeleteExpense();

  // Fetch Orders to calculate revenue for net cash flow
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const all = await db.orders.toArray();
      return all.filter((o) => o.deletedAt === null && (o.status === 'PAID' || !o.status));
    },
  });

  // Filter States
  const [datePreset, setDatePreset] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('MONTH');
  const [selectedType, setSelectedType] = useState<string>(typeParam || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync selectedType with URL typeParam
  useEffect(() => {
    if (typeParam) {
      setSelectedType(typeParam);
    } else {
      setSelectedType('ALL');
    }
  }, [typeParam]);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialType, setFormInitialType] = useState<ExpenseType>(
    typeParam === 'PURCHASE_STOCK' ? 'PURCHASE_STOCK' : 'EXPENSE'
  );
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Date Filter calculations
  const filterDateTimestamp = useMemo(() => {
    const now = new Date();
    if (datePreset === 'TODAY') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return startOfDay;
    }
    if (datePreset === 'WEEK') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
      return sevenDaysAgo;
    }
    if (datePreset === 'MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return startOfMonth;
    }
    return 0; // ALL
  }, [datePreset]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchDate = e.date >= filterDateTimestamp;
      const matchType = selectedType === 'ALL' || e.type === selectedType;
      const matchCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchOutlet = selectedOutletId === 'ALL' || e.outletId === selectedOutletId;
      const matchSearch =
        !searchQuery.trim() ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (e.paidTo && e.paidTo.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (e.customCategory &&
          e.customCategory.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      return matchDate && matchType && matchCategory && matchOutlet && matchSearch;
    });
  }, [
    expenses,
    filterDateTimestamp,
    selectedType,
    selectedCategory,
    selectedOutletId,
    searchQuery,
  ]);

  // Filtered Revenue in the same period
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => {
        const matchDate = o.createdAt >= filterDateTimestamp;
        const matchOutlet = selectedOutletId === 'ALL' || o.outletId === selectedOutletId;
        return matchDate && matchOutlet;
      })
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }, [orders, filterDateTimestamp, selectedOutletId]);

  // Expense Totals
  const { totalExpenses, totalPurchases } = useMemo(() => {
    let exp = 0;
    let pur = 0;
    for (const e of filteredExpenses) {
      if (e.type === 'PURCHASE_STOCK') {
        pur += e.amount || 0;
      } else {
        exp += e.amount || 0;
      }
    }
    return { totalExpenses: exp, totalPurchases: pur };
  }, [filteredExpenses]);

  // Handlers
  const handleOpenCreateExpense = (type: ExpenseType = 'EXPENSE') => {
    setExpenseToEdit(null);
    setFormInitialType(type);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setFormInitialType(expense.type);
    setIsFormOpen(true);
  };

  const handleSaveExpense = async (
    expenseData: Parameters<typeof upsertMutation.mutateAsync>[0]
  ) => {
    await upsertMutation.mutateAsync(expenseData);
    sounds.playSuccess();
  };

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      await deleteMutation.mutateAsync(expenseToDelete.id);
      setExpenseToDelete(null);
      sounds.playDelete();
    }
  };

  // Determine Page Title, Subtitle, and Actions based on Active Mode
  const isPurchasesMode = typeParam === 'PURCHASE_STOCK';
  const isExpensesMode = typeParam === 'EXPENSE';

  const pageTitle = isPurchasesMode
    ? t('purchases.title', 'Pembelian Stok (PO)')
    : isExpensesMode
      ? t('expenses.title', 'Pengeluaran Kas Operasional')
      : t('expenses.allTitle', 'Pengeluaran Kas & Pembelian');

  const pageDescription = isPurchasesMode
    ? t(
        'purchases.subtitle',
        'Catat nota belanja kulakan barang, penerimaan inventaris dari pemasok, dan penambahan stok otomatis.'
      )
    : isExpensesMode
      ? t(
          'expenses.subtitle',
          'Catat pos biaya operasional toko harian seperti gaji karyawan, listrik, air, sewa tempat, dan utilitas.'
        )
      : t(
          'expenses.allSubtitle',
          'Kelola pos biaya operasional harian, kulakan stok barang, dan pantau arus kas laba toko.'
        );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {outlets.length > 1 && (
              <div className="w-48">
                <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
                  <SelectTrigger className="h-8 text-xs bg-background font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-primary mr-1.5 shrink-0" />
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ALL">Semua Cabang (Gabungan)</SelectItem>
                      {outlets.map((outlet) => (
                        <SelectItem key={outlet.id} value={outlet.id}>
                          {outlet.name} {outlet.isHQ ? '(Pusat)' : ''}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isPurchasesMode ? (
              <Button
                onClick={() => handleOpenCreateExpense('PURCHASE_STOCK')}
                size="sm"
                className="gap-1.5 font-bold cursor-pointer text-xs shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('purchases.create', 'Tambah Pembelian Stok')}</span>
              </Button>
            ) : isExpensesMode ? (
              <Button
                onClick={() => handleOpenCreateExpense('EXPENSE')}
                size="sm"
                className="gap-1.5 font-bold cursor-pointer text-xs shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('expenses.create', 'Catat Pengeluaran Kas')}</span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => handleOpenCreateExpense('PURCHASE_STOCK')}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-bold cursor-pointer text-xs"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />
                  <span>{t('expenses.purchaseStock', '+ Beli Stok')}</span>
                </Button>

                <Button
                  onClick={() => handleOpenCreateExpense('EXPENSE')}
                  size="sm"
                  className="gap-1.5 font-bold cursor-pointer text-xs shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('expenses.recordExpense', 'Catat Pengeluaran')}</span>
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Cash Flow Summary Cards / Mode-Specific Stat Cards */}
      {isPurchasesMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Pembelian Stok"
            value={formatCurrency(totalPurchases)}
            icon={ShoppingBag}
            variant="info"
            subtitle="Total belanja persediaan barang"
          />
          <StatCard
            title="Transaksi Kulakan"
            value={`${filteredExpenses.length} faktur`}
            icon={Receipt}
            variant="default"
            subtitle="Nota pembelian tercatat"
          />
          <StatCard
            title="Rata-rata Kulakan"
            value={formatCurrency(
              filteredExpenses.length > 0 ? totalPurchases / filteredExpenses.length : 0
            )}
            icon={TrendingUp}
            variant="primary"
            subtitle="Nilai rata-rata per transaksi kulakan"
          />
          <StatCard
            title="Arus Kas Bersih (Laba)"
            value={`${totalRevenue - totalExpenses - totalPurchases >= 0 ? '+' : ''}${formatCurrency(totalRevenue - totalExpenses - totalPurchases)}`}
            icon={Scale}
            variant={totalRevenue - totalExpenses - totalPurchases >= 0 ? 'success' : 'danger'}
            subtitle="Omzet dikurangi semua pengeluaran"
          />
        </div>
      ) : isExpensesMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Biaya Operasional"
            value={formatCurrency(totalExpenses)}
            icon={Wallet}
            variant="danger"
            subtitle="Biaya harian & utilitas toko"
          />
          <StatCard
            title="Transaksi Biaya"
            value={`${filteredExpenses.length} catatan`}
            icon={Receipt}
            variant="default"
            subtitle="Total pos pengeluaran tercatat"
          />
          <StatCard
            title="Rata-rata Biaya"
            value={formatCurrency(
              filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0
            )}
            icon={TrendingUp}
            variant="warning"
            subtitle="Rata-rata per transaksi biaya"
          />
          <StatCard
            title="Arus Kas Bersih (Laba)"
            value={`${totalRevenue - totalExpenses - totalPurchases >= 0 ? '+' : ''}${formatCurrency(totalRevenue - totalExpenses - totalPurchases)}`}
            icon={Scale}
            variant={totalRevenue - totalExpenses - totalPurchases >= 0 ? 'success' : 'danger'}
            subtitle="Omzet dikurangi semua pengeluaran"
          />
        </div>
      ) : (
        <CashFlowSummaryCard
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          totalPurchases={totalPurchases}
          expenseCount={filteredExpenses.length}
        />
      )}

      {/* Mode Switcher Tabs & Filter Bar */}
      <div className="space-y-3">
        {/* Navigation Mode Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSearchParams({ type: 'EXPENSE' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 text-xs flex items-center gap-1.5 ${
              isExpensesMode
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Pengeluaran Kas</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ type: 'PURCHASE_STOCK' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 text-xs flex items-center gap-1.5 ${
              isPurchasesMode
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Pembelian Stok</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 text-xs flex items-center gap-1.5 ${
              !isPurchasesMode && !isExpensesMode
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Semua Arus Kas Keluar</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 bg-card rounded-xl border text-xs">
          {/* Date Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none">
            {(
              [
                { id: 'TODAY', label: 'Hari Ini' },
                { id: 'WEEK', label: '7 Hari Terakhir' },
                { id: 'MONTH', label: 'Bulan Ini' },
                { id: 'ALL', label: 'Semua Waktu' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 text-xs ${
                  datePreset === preset.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
              <SelectTrigger className="h-8 text-xs w-40 bg-background">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  {(Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-1.5">
                        <ExpenseCategoryIcon
                          category={cat}
                          className="h-3.5 w-3.5 text-primary shrink-0"
                        />
                        <span>{EXPENSE_CATEGORY_META[cat].label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Search Box */}
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari biaya / supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: List on Left, Category Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Expenses List (2 Cols on Large) */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isPurchasesMode
                ? `Faktur Pembelian Stok (${filteredExpenses.length})`
                : isExpensesMode
                  ? `Daftar Biaya Operasional (${filteredExpenses.length})`
                  : `Daftar Transaksi (${filteredExpenses.length})`}
            </p>
            <span className="text-xs font-mono font-bold text-foreground">
              Total: -{formatCurrency(totalExpenses + totalPurchases)}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data...</div>
          ) : filteredExpenses.length === 0 ? (
            <Card className="border border-dashed p-8 rounded-2xl text-center space-y-3 bg-card/60">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                {isPurchasesMode ? (
                  <ShoppingBag className="h-6 w-6" />
                ) : (
                  <Wallet className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="text-sm font-bold text-foreground">
                  {isPurchasesMode
                    ? 'Belum ada catatan pembelian stok'
                    : isExpensesMode
                      ? 'Belum ada catatan pengeluaran kas'
                      : 'Belum ada catatan transaksi'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPurchasesMode
                    ? 'Catat nota belanja kulakan barang atau penerimaan inventaris dari supplier untuk menambah stok toko.'
                    : isExpensesMode
                      ? 'Catat biaya belanja utilitas listrik, air, sewa tempat, atau gaji karyawan tokomu.'
                      : 'Catat biaya operasional harian atau kulakan persediaan barang tokomu.'}
                </p>
              </div>
              <Button
                onClick={() =>
                  handleOpenCreateExpense(isPurchasesMode ? 'PURCHASE_STOCK' : 'EXPENSE')
                }
                size="sm"
                className="gap-1.5 font-bold cursor-pointer text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>
                  {isPurchasesMode ? 'Tambah Pembelian Stok Pertama' : 'Catat Pengeluaran Pertama'}
                </span>
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleOpenEdit}
                  onDelete={(e) => setExpenseToDelete(e)}
                  onViewImage={(url) => setPreviewImage(url)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Breakdown & Quick Stats */}
        <div className="space-y-4">
          <ExpenseCategoryBreakdown expenses={filteredExpenses} />

          {/* Quick Cash Flow Tips Card */}
          <Card className="border bg-card rounded-xl shadow-none p-4 space-y-2 text-xs">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Tips Manajemen Keuangan POS</span>
            </p>
            <ul className="space-y-1.5 text-muted-foreground text-[11px] list-disc list-inside">
              <li>
                Pilih <strong className="text-foreground">Kulakan / Beli Stok</strong> saat membeli
                persediaan barang agar stok otomatis bertambah di sistem.
              </li>
              <li>
                Unggah foto struk belanja untuk memudahkan pencocokan nota fisik saat tutup buku.
              </li>
              <li>
                Laba bersih dihitung otomatis dari (Total Penjualan Kasir - Total Semua
                Pengeluaran).
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Add / Edit Expense Dialog */}
      <ExpenseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        expenseToEdit={expenseToEdit}
        initialType={formInitialType}
        onSave={handleSaveExpense}
      />

      {/* Image Preview Modal Dialog */}
      {previewImage && (
        <Dialog open={Boolean(previewImage)} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="sm:max-w-md p-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <FileImage className="h-4 w-4 text-primary" />
                <span>Foto Struk / Bukti Pembayaran</span>
              </DialogTitle>
            </DialogHeader>
            <div className="rounded-xl overflow-hidden border max-h-[70vh] flex items-center justify-center bg-black/5">
              <img
                src={previewImage}
                alt="Nota Preview"
                className="max-h-[70vh] object-contain w-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(expenseToDelete)}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Catatan Pengeluaran?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Pengeluaran &ldquo;{expenseToDelete?.description}&rdquo; sebesar{' '}
              {formatCurrency(expenseToDelete?.amount || 0)} akan dihapus dari riwayat pembukuan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpensesPage;
