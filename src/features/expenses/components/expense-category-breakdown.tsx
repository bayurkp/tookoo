import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format-currency';
import { ExpenseCategoryIcon } from './expense-category-icon';
import { EXPENSE_CATEGORY_META, type Expense, type ExpenseCategory } from '@/types/expense.types';

interface ExpenseCategoryBreakdownProps {
  expenses: Expense[];
}

export const ExpenseCategoryBreakdown: React.FC<ExpenseCategoryBreakdownProps> = ({ expenses }) => {
  const total = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Group by category
  const categoryTotals = React.useMemo(() => {
    const map: Partial<Record<ExpenseCategory, number>> = {};
    for (const exp of expenses) {
      map[exp.category] = (map[exp.category] || 0) + (exp.amount || 0);
    }
    return Object.entries(map)
      .map(([cat, amount]) => ({
        category: cat as ExpenseCategory,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, total]);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <Card className="border bg-card rounded-xl shadow-none">
      <CardHeader className="p-4 pb-2 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-foreground">
              Alokasi Pengeluaran per Kategori
            </CardTitle>
            <CardDescription className="text-[11px]">
              Distribusi pos biaya operasional dan pembelian toko
            </CardDescription>
          </div>
          <span className="text-xs font-mono font-extrabold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {categoryTotals.map(({ category, amount, percentage }) => {
          const meta = EXPENSE_CATEGORY_META[category] || EXPENSE_CATEGORY_META.LAINNYA;
          return (
            <div key={category} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ExpenseCategoryIcon
                    category={category}
                    className="h-3.5 w-3.5 text-primary shrink-0"
                  />
                  <span className="font-semibold text-foreground truncate">{meta.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                  <span className="font-bold text-foreground">{formatCurrency(amount)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryBreakdown;
