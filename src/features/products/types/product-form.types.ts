import { z } from 'zod';

export const variantOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama varian wajib diisi'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga jual varian tidak boleh negatif'),
  costPrice: z.coerce.number().min(0, 'Harga modal HPP tidak boleh negatif').optional(),
  stock: z.coerce.number().int().min(0, 'Stok varian tidak boleh negatif'),
  minStock: z.coerce.number().int().min(0, 'Batas stok tidak boleh negatif').optional(),
});

export const modifierOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama opsi modifier wajib diisi'),
  price: z.coerce.number().min(0, 'Harga tambahan tidak boleh negatif'),
});

export const modifierGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama grup modifier wajib diisi'),
  required: z.boolean().default(false),
  maxSelect: z.coerce.number().int().min(1).default(1),
  options: z.array(modifierOptionSchema).default([]),
});

export const productFormSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  category: z.string().min(1, 'Kategori produk wajib diisi'),
  unit: z.string().default('pcs').optional(),
  productType: z.enum(['FNB', 'RETAIL', 'SERVICE']).default('FNB'),
  subType: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga jual tidak boleh negatif'),
  costPrice: z.coerce.number().min(0, 'Harga modal HPP tidak boleh negatif').optional(),
  stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  minStock: z.coerce.number().int().min(0, 'Batas stok tidak boleh negatif').optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('URL foto tidak valid').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  variants: z.array(variantOptionSchema).optional(),
  modifierGroups: z.array(modifierGroupSchema).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

