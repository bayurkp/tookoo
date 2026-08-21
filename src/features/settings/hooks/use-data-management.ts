import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDataSummary,
  clearOrdersData,
  clearProductsAndStockData,
  clearTablesData,
  clearDiscountsAndTaxesData,
  clearExpensesData,
  clearCustomersAndSuppliersData,
  resetMasterDataToDefaults,
  resetFullDatabase,
  type DataCountSummary,
} from '../api/data-management-api';

export const DATA_SUMMARY_QUERY_KEY = ['data-summary'] as const;

export const useDataSummary = () => {
  return useQuery<DataCountSummary>({
    queryKey: DATA_SUMMARY_QUERY_KEY,
    queryFn: getDataSummary,
  });
};

export const useClearOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearOrdersData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: DATA_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['reports-analytics'] });
    },
  });
};

export const useClearProductsAndStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearProductsAndStockData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: DATA_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useClearTables = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearTablesData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: DATA_SUMMARY_QUERY_KEY });
    },
  });
};

export const useClearDiscountsAndTaxes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearDiscountsAndTaxesData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['master-taxes'] });
      queryClient.invalidateQueries({ queryKey: DATA_SUMMARY_QUERY_KEY });
    },
  });
};

export const useClearExpenses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearExpensesData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: DATA_SUMMARY_QUERY_KEY });
    },
  });
};

export const useClearCustomersAndSuppliers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearCustomersAndSuppliersData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: DATA_SUMMARY_QUERY_KEY });
    },
  });
};

export const useResetMasterDataToDefaults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetMasterDataToDefaults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-categories'] });
      queryClient.invalidateQueries({ queryKey: ['master-uoms'] });
      queryClient.invalidateQueries({ queryKey: ['master-variant-attributes'] });
      queryClient.invalidateQueries({ queryKey: ['master-modifier-groups'] });
      queryClient.invalidateQueries({ queryKey: ['master-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['master-taxes'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: DATA_SUMMARY_QUERY_KEY });
    },
  });
};

export const useResetFullDatabase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: { newStoreName?: string; reseedMasterDefaults?: boolean }) =>
      resetFullDatabase(options),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
