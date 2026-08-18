import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, upsertExpense, deleteExpense } from '../api/expenses-api';
import type { Expense } from '@/types/expense.types';

export const EXPENSES_QUERY_KEY = ['expenses'];

export function useExpenses() {
  return useQuery<Expense[]>({
    queryKey: EXPENSES_QUERY_KEY,
    queryFn: getExpenses,
  });
}

export function useUpsertExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      expense: Partial<Expense> & {
        amount: number;
        description: string;
        category: Expense['category'];
      }
    ) => upsertExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });
}
