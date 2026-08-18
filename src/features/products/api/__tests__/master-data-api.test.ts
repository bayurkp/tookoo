import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
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
} from '../master-data-api';

describe('Master Data API', () => {
  beforeEach(async () => {
    await db.masterCategories.clear();
    await db.masterUoms.clear();
    await db.masterVariantAttributes.clear();
    await db.masterModifierGroups.clear();
  });

  describe('Master Categories', () => {
    it('seeds default categories if empty', async () => {
      const categories = await getMasterCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some((c) => c.name === 'Minuman')).toBe(true);
    });

    it('creates and deletes master category with sub-categories', async () => {
      const parent = await upsertMasterCategory({
        name: 'Elektronik & Gadget',
        parentId: null,
      });

      const sub = await upsertMasterCategory({
        name: 'Aksesoris HP',
        parentId: parent.id,
        parentName: parent.name,
      });

      const all = await getMasterCategories();
      expect(all.some((c) => c.id === parent.id)).toBe(true);
      expect(all.some((c) => c.id === sub.id)).toBe(true);

      // Soft delete parent should soft delete sub as well
      await deleteMasterCategory(parent.id);

      const afterDelete = await getMasterCategories();
      expect(afterDelete.some((c) => c.id === parent.id)).toBe(false);
      expect(afterDelete.some((c) => c.id === sub.id)).toBe(false);
    });
  });

  describe('Master UOMs', () => {
    it('seeds default UOMs and allows adding custom UOM', async () => {
      const uoms = await getMasterUoms();
      expect(uoms.some((u) => u.symbol === 'pcs')).toBe(true);
      expect(uoms.some((u) => u.symbol === 'cup')).toBe(true);

      const custom = await upsertMasterUom({
        name: 'Karton Besar',
        symbol: 'karton',
        description: 'Kemasan karton isi 24 botol',
      });

      const all = await getMasterUoms();
      expect(all.some((u) => u.id === custom.id && u.symbol === 'karton')).toBe(true);

      await deleteMasterUom(custom.id);
      const afterDelete = await getMasterUoms();
      expect(afterDelete.some((u) => u.id === custom.id)).toBe(false);
    });
  });

  describe('Master Variant Attributes', () => {
    it('seeds default variant dimensions and allows managing custom attributes', async () => {
      const attributes = await getMasterVariantAttributes();
      expect(attributes.some((a) => a.name.includes('Ukuran'))).toBe(true);

      const customAttr = await upsertMasterVariantAttribute({
        name: 'Jenis Kemasan',
        presetOptions: ['Paper Cup', 'Botol Kaca', 'Tumbler Pribadi'],
      });

      const all = await getMasterVariantAttributes();
      expect(all.some((a) => a.id === customAttr.id)).toBe(true);

      await deleteMasterVariantAttribute(customAttr.id);
      const afterDelete = await getMasterVariantAttributes();
      expect(afterDelete.some((a) => a.id === customAttr.id)).toBe(false);
    });
  });

  describe('Master Modifier Groups', () => {
    it('seeds default modifier groups and allows managing custom groups with options', async () => {
      const groups = await getMasterModifierGroups();
      expect(groups.some((g) => g.name.includes('Topping'))).toBe(true);

      const customGroup = await upsertMasterModifierGroup({
        name: 'Pilihan Saus BBQ',
        required: false,
        maxSelect: 2,
        options: [
          { id: crypto.randomUUID(), name: 'Saus Honey BBQ', price: 2000 },
          { id: crypto.randomUUID(), name: 'Saus Spicy Buffalo', price: 3000 },
        ],
      });

      const all = await getMasterModifierGroups();
      const saved = all.find((g) => g.id === customGroup.id);
      expect(saved).toBeDefined();
      expect(saved?.options.length).toBe(2);
      expect(saved?.options[0].price).toBe(2000);

      await deleteMasterModifierGroup(customGroup.id);
      const afterDelete = await getMasterModifierGroups();
      expect(afterDelete.some((g) => g.id === customGroup.id)).toBe(false);
    });
  });
});
