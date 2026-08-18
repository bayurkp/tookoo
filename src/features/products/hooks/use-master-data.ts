import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMasterCategories,
  upsertMasterCategory,
  deleteMasterCategory,
  getMasterUoms,
  upsertMasterUom,
  deleteMasterUom,
  getMasterVariantAttributes,
  upsertMasterVariantAttribute,
  deleteMasterVariantAttribute,
  getMasterModifierGroups,
  upsertMasterModifierGroup,
  deleteMasterModifierGroup,
  getMasterDiscounts,
  upsertMasterDiscount,
  deleteMasterDiscount,
  getMasterTaxes,
  upsertMasterTax,
  deleteMasterTax,
} from '../api/master-data-api';

// ==========================================
// 1. MASTER CATEGORIES HOOKS
// ==========================================

export function useMasterCategories() {
  return useQuery({
    queryKey: ['master-categories'],
    queryFn: getMasterCategories,
  });
}

export function useUpsertMasterCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertMasterCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteMasterCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasterCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ==========================================
// 2. MASTER UOMS HOOKS
// ==========================================

export function useMasterUoms() {
  return useQuery({
    queryKey: ['master-uoms'],
    queryFn: getMasterUoms,
  });
}

export function useUpsertMasterUom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertMasterUom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-uoms'] });
    },
  });
}

export function useDeleteMasterUom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasterUom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-uoms'] });
    },
  });
}

// ==========================================
// 3. MASTER VARIANT ATTRIBUTES HOOKS
// ==========================================

export function useMasterVariantAttributes() {
  return useQuery({
    queryKey: ['master-variant-attributes'],
    queryFn: getMasterVariantAttributes,
  });
}

export function useUpsertMasterVariantAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertMasterVariantAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-variant-attributes'] });
    },
  });
}

export function useDeleteMasterVariantAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasterVariantAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-variant-attributes'] });
    },
  });
}

// ==========================================
// 4. MASTER MODIFIER GROUPS HOOKS
// ==========================================

export function useMasterModifierGroups() {
  return useQuery({
    queryKey: ['master-modifier-groups'],
    queryFn: getMasterModifierGroups,
  });
}

export function useUpsertMasterModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertMasterModifierGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-modifier-groups'] });
    },
  });
}

export function useDeleteMasterModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasterModifierGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-modifier-groups'] });
    },
  });
}

// ==========================================
// 5. MASTER DISCOUNTS HOOKS
// ==========================================

export function useMasterDiscounts() {
  return useQuery({
    queryKey: ['master-discounts'],
    queryFn: getMasterDiscounts,
  });
}

export function useUpsertMasterDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertMasterDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-discounts'] });
    },
  });
}

export function useDeleteMasterDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasterDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-discounts'] });
    },
  });
}

// ==========================================
// 6. MASTER TAXES & CHARGES HOOKS
// ==========================================

export function useMasterTaxes() {
  return useQuery({
    queryKey: ['master-taxes'],
    queryFn: getMasterTaxes,
  });
}

export function useUpsertMasterTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertMasterTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-taxes'] });
    },
  });
}

export function useDeleteMasterTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasterTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-taxes'] });
    },
  });
}
