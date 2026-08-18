import React, { useState, useMemo } from 'react';
import { Plus, ShoppingBag, Receipt, Search, FileImage, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
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
  const { data: expenses = [], isLoading } = useExpenses();
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
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialType, setFormInitialType] = useState<ExpenseType>('EXPENSE');
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
      const matchSearch =
        !searchQuery.trim() ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (e.paidTo && e.paidTo.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (e.customCategory &&
          e.customCategory.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      return matchDate && matchType && matchCategory && matchSearch;
    });
  }, [expenses, filterDateTimestamp, selectedType, selectedCategory, searchQuery]);

  // Filtered Revenue in the same period
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.createdAt >= filterDateTimestamp)
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }, [orders, filterDateTimestamp]);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('expenses.title', 'Pengeluaran & Pembelian')}
        description={t(
          'expenses.subtitle',
          'Kelola pos biaya operasional harian, kulakan stok barang, dan pantau arus kas laba toko.'
        )}
        actions={
          <>
            <Button
              onClick={() => handleOpenCreateExpense('PURCHASE_STOCK')}
              variant="outline"
              size="sm"
              className="gap-1.5 font-bold cursor-pointer text-xs"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />
              <span>{t('expenses.purchaseStock', '+ Beli Stok / Kulakan')}</span>
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
        }
      />

      {/* Cash Flow Summary Cards */}
      <CashFlowSummaryCard
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        totalPurchases={totalPurchases}
        expenseCount={filteredExpenses.length}
      />

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
          {/* Type Filter */}
          <Select value={selectedType} onValueChange={(val) => setSelectedType(val)}>
            <SelectTrigger className="h-8 text-xs w-36 bg-background">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Semua Tipe</SelectItem>
                <SelectItem value="EXPENSE">Biaya Operasional</SelectItem>
                <SelectItem value="PURCHASE_STOCK">Kulakan Stok</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

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

      {/* Main Content Layout: List on Left, Category Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Expenses List (2 Cols on Large) */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Daftar Transaksi ({filteredExpenses.length})
            </p>
            <span className="text-xs font-mono font-bold text-foreground">
              Total: -{formatCurrency(totalExpenses + totalPurchases)}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Memuat data pengeluaran...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <Card className="border border-dashed p-8 rounded-2xl text-center space-y-3 bg-card/60">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <Receipt className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="text-sm font-bold text-foreground">Belum ada catatan pengeluaran</p>
                <p className="text-xs text-muted-foreground">
                  Catat biaya belanja bahan baku, operasional listrik, gaji, atau sewa toko Anda
                  untuk mengetahui profit bersih harian.
                </p>
              </div>
              <Button
                onClick={() => handleOpenCreateExpense('EXPENSE')}
                size="sm"
                className="gap-1.5 font-bold cursor-pointer text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Catat Pengeluaran Pertama</span>
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
