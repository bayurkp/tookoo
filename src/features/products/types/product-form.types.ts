import { z } from 'zod';

export const variantOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama varian wajib diisi'),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga varian tidak boleh negatif'),
  stock: z.coerce.number().int().min(0, 'Stok varian tidak boleh negatif'),
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
  productType: z.enum(['FNB', 'RETAIL', 'SERVICE']).default('FNB'),
  subType: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('URL foto tidak valid').optional().or(z.literal('')),
  variants: z.array(variantOptionSchema).optional(),
  modifierGroups: z.array(modifierGroupSchema).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
