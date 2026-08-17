import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  category: z.string().min(1, 'Kategori produk wajib diisi'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  imageUrl: z.string().url('URL foto tidak valid').optional().or(z.literal('')),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
