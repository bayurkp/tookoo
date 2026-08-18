import { db, seedMasterDefaultsIfEmpty } from '@/lib/db';
import type {
  MasterCategory,
  MasterUom,
  MasterVariantAttribute,
  MasterModifierGroup,
  MasterDiscount,
  MasterTax,
  DiscountType,
} from '@/types/master-data.types';

// ==========================================
// 1. MASTER CATEGORIES API
// ==========================================

export async function getMasterCategories(): Promise<MasterCategory[]> {
  await seedMasterDefaultsIfEmpty();
  const all = await db.masterCategories.toArray();
  return all.filter((c) => c.deletedAt === null).sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertMasterCategory(
  category: Partial<MasterCategory> & { name: string }
): Promise<MasterCategory> {
  const now = Date.now();
  const entity: MasterCategory = {
    id: category.id || crypto.randomUUID(),
    name: category.name.trim(),
    parentId: category.parentId ?? null,
    parentName: category.parentName ?? null,
    description: category.description?.trim() || '',
    createdAt: category.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.masterCategories.put(entity);
  return entity;
}

export async function deleteMasterCategory(id: string): Promise<void> {
  const existing = await db.masterCategories.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.masterCategories.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });

  // Soft delete any sub-categories belonging to this parent category as well
  const subCategories = await db.masterCategories.where('parentId').equals(id).toArray();
  for (const sub of subCategories) {
    if (sub.deletedAt === null) {
      await db.masterCategories.put({
        ...sub,
        deletedAt: now,
        updatedAt: now,
      });
    }
  }
}

// ==========================================
// 2. MASTER UOMS API
// ==========================================

export async function getMasterUoms(): Promise<MasterUom[]> {
  await seedMasterDefaultsIfEmpty();
  const all = await db.masterUoms.toArray();
  return all.filter((u) => u.deletedAt === null).sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertMasterUom(
  uom: Partial<MasterUom> & { name: string; symbol: string }
): Promise<MasterUom> {
  const now = Date.now();
  const entity: MasterUom = {
    id: uom.id || crypto.randomUUID(),
    name: uom.name.trim(),
    symbol: uom.symbol.trim().toLowerCase(),
    description: uom.description?.trim() || '',
    createdAt: uom.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.masterUoms.put(entity);
  return entity;
}

export async function deleteMasterUom(id: string): Promise<void> {
  const existing = await db.masterUoms.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.masterUoms.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });
}

// ==========================================
// 3. MASTER VARIANT ATTRIBUTES API
// ==========================================

export async function getMasterVariantAttributes(): Promise<MasterVariantAttribute[]> {
  await seedMasterDefaultsIfEmpty();
  const all = await db.masterVariantAttributes.toArray();
  return all.filter((v) => v.deletedAt === null).sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertMasterVariantAttribute(
  variantAttr: Partial<MasterVariantAttribute> & { name: string; presetOptions: string[] }
): Promise<MasterVariantAttribute> {
  const now = Date.now();
  const entity: MasterVariantAttribute = {
    id: variantAttr.id || crypto.randomUUID(),
    name: variantAttr.name.trim(),
    presetOptions: (variantAttr.presetOptions || []).map((o) => o.trim()).filter(Boolean),
    description: variantAttr.description?.trim() || '',
    createdAt: variantAttr.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.masterVariantAttributes.put(entity);
  return entity;
}

export async function deleteMasterVariantAttribute(id: string): Promise<void> {
  const existing = await db.masterVariantAttributes.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.masterVariantAttributes.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });
}

// ==========================================
// 4. MASTER MODIFIER GROUPS API
// ==========================================

export async function getMasterModifierGroups(): Promise<MasterModifierGroup[]> {
  await seedMasterDefaultsIfEmpty();
  const all = await db.masterModifierGroups.toArray();
  return all.filter((m) => m.deletedAt === null).sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertMasterModifierGroup(
  group: Partial<MasterModifierGroup> & { name: string }
): Promise<MasterModifierGroup> {
  const now = Date.now();
  const entity: MasterModifierGroup = {
    id: group.id || crypto.randomUUID(),
    name: group.name.trim(),
    required: Boolean(group.required),
    minSelect: group.minSelect ?? (group.required ? 1 : 0),
    maxSelect: group.maxSelect || 1,
    options: (group.options || []).map((opt) => ({
      id: opt.id || crypto.randomUUID(),
      name: opt.name.trim(),
      price: Math.max(0, opt.price || 0),
    })),
    description: group.description?.trim() || '',
    createdAt: group.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.masterModifierGroups.put(entity);
  return entity;
}

export async function deleteMasterModifierGroup(id: string): Promise<void> {
  const existing = await db.masterModifierGroups.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.masterModifierGroups.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });
}

// ==========================================
// 5. MASTER DISCOUNTS API
// ==========================================

export async function getMasterDiscounts(): Promise<MasterDiscount[]> {
  await seedMasterDefaultsIfEmpty();
  const all = await db.masterDiscounts.toArray();
  return all.filter((d) => d.deletedAt === null).sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertMasterDiscount(
  discount: Partial<MasterDiscount> & { name: string; type: DiscountType; value: number }
): Promise<MasterDiscount> {
  const now = Date.now();
  const entity: MasterDiscount = {
    id: discount.id || crypto.randomUUID(),
    name: discount.name.trim(),
    code: discount.code?.trim().toUpperCase() || undefined,
    type: discount.type || 'PERCENTAGE',
    value: Math.max(0, discount.value || 0),
    scope: discount.scope || 'ALL_PRODUCTS',
    targetProductId: discount.targetProductId ?? null,
    targetProductName: discount.targetProductName ?? null,
    targetVariantId: discount.targetVariantId ?? null,
    targetVariantName: discount.targetVariantName ?? null,
    hasExpiry: Boolean(discount.hasExpiry),
    startDate: discount.hasExpiry ? (discount.startDate ?? null) : null,
    endDate: discount.hasExpiry ? (discount.endDate ?? null) : null,
    minPurchaseAmount: discount.minPurchaseAmount ?? null,
    maxDiscountAmount: discount.maxDiscountAmount ?? null,
    isActive: discount.isActive !== false,
    description: discount.description?.trim() || '',
    createdAt: discount.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.masterDiscounts.put(entity);
  return entity;
}

export async function deleteMasterDiscount(id: string): Promise<void> {
  const existing = await db.masterDiscounts.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.masterDiscounts.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });
}

// ==========================================
// 6. MASTER TAXES & CHARGES API
// ==========================================

export async function getMasterTaxes(): Promise<MasterTax[]> {
  await seedMasterDefaultsIfEmpty();
  const all = await db.masterTaxes.toArray();
  return all.filter((t) => t.deletedAt === null).sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertMasterTax(
  tax: Partial<MasterTax> & { name: string; rate: number }
): Promise<MasterTax> {
  const now = Date.now();
  const entity: MasterTax = {
    id: tax.id || crypto.randomUUID(),
    name: tax.name.trim(),
    rate: Math.max(0, tax.rate || 0),
    type: tax.type || 'PERCENTAGE',
    inclusive: Boolean(tax.inclusive),
    isDefault: Boolean(tax.isDefault),
    isActive: tax.isActive !== false,
    description: tax.description?.trim() || '',
    createdAt: tax.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.masterTaxes.put(entity);
  return entity;
}

export async function deleteMasterTax(id: string): Promise<void> {
  const existing = await db.masterTaxes.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.masterTaxes.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });
}
