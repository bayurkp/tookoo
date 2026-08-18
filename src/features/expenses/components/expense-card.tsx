import React from 'react';
import {
  Pencil,
  Trash2,
  Calendar,
  CreditCard,
  User,
  ShoppingBag,
  FileImage,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format-currency';
import { ExpenseCategoryIcon } from './expense-category-icon';
import {
  EXPENSE_CATEGORY_META,
  type Expense,
} from '@/types/expense.types';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onViewImage?: (imageUrl: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onEdit,
  onDelete,
  onViewImage,
}) => {
  const meta = EXPENSE_CATEGORY_META[expense.category] || EXPENSE_CATEGORY_META.LAINNYA;
  const isPurchase = expense.type === 'PURCHASE_STOCK';
  const formattedDate = new Date(expense.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getPaymentMethodLabel = (method: Expense['paymentMethod']) => {
    switch (method) {
      case 'CASH':
        return 'Kas Tunai';
      case 'TRANSFER':
        return 'Transfer Bank';
      case 'QRIS':
        return 'QRIS';
      default:
        return 'Lainnya';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-card/80 hover:bg-card transition-colors text-xs group">
      {/* Left info */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Category Icon */}
        <div className="h-9 w-9 rounded-xl bg-muted/60 text-primary flex items-center justify-center shrink-0 border border-border/60">
          <ExpenseCategoryIcon category={expense.category} className="h-4 w-4" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold ${meta.color}`}>
              {meta.label}
            </Badge>

            {isPurchase && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
              >
                <ShoppingBag className="h-2.5 w-2.5 mr-0.5" />
                Stok Barang
              </Badge>
            )}

            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              <span>{formattedDate}</span>
            </span>
          </div>

          <p className="font-bold text-foreground text-xs leading-snug">
            {expense.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CreditCard className="h-2.5 w-2.5" />
              <span>{getPaymentMethodLabel(expense.paymentMethod)}</span>
            </span>

            {expense.paidTo && (
              <span className="flex items-center gap-1">
                <User className="h-2.5 w-2.5" />
                <span>Penerima: {expense.paidTo}</span>
              </span>
            )}

            {expense.receiptImage && (
              <button
                type="button"
                onClick={() => onViewImage?.(expense.receiptImage!)}
                className="flex items-center gap-1 text-primary hover:underline cursor-pointer font-semibold"
              >
                <FileImage className="h-2.5 w-2.5" />
                <span>Lihat Nota</span>
              </button>
            )}
          </div>

          {/* Items breakdown snippet if purchase */}
          {expense.purchaseItems && expense.purchaseItems.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {expense.purchaseItems.map((it, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground font-mono"
                >
                  {it.productName || 'Barang'} x{it.quantity} ({formatCurrency(it.unitPrice)})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right nominal & actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <span className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
          -{formatCurrency(expense.amount)}
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(expense)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Edit Pengeluaran"
          >
            <Pencil className="h-3 w-3" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(expense)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Hapus Catatan"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
