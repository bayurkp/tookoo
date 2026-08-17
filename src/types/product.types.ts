export type ProductType = 'FNB' | 'RETAIL' | 'SERVICE';

export interface ProductVariantOption {
  id: string; // UUID v4
  name: string; // e.g. "Ukuran Reguler", "Ukuran Large", "Warna Merah", "Size XL"
  sku?: string;
  price: number; // Base price for this variant
  stock: number; // Available inventory stock for this variant
}

export interface ProductModifierOption {
  id: string; // UUID v4
  name: string; // e.g. "Ekstra Boba", "Less Ice", "Keju Mozzarella"
  price: number; // Additional price (e.g. +3000 or 0)
}

export interface ProductModifierGroup {
  id: string; // UUID v4
  name: string; // e.g. "Topping Tambahan", "Level Gula", "Level Pedas"
  required?: boolean; // Must choose at least 1?
  minSelect?: number; // Minimum number of options (default 0 or 1 if required)
  maxSelect?: number; // 1 for single-choice (radio), >1 for multiple-choice (checkbox)
  options: ProductModifierOption[];
}

export interface Product {
  id: string; // UUID v4
  name: string;
  category: string;
  productType?: ProductType;
  subType?: string; // Sub-category e.g. "Kopi Susu", "Snack", "Aksesoris"
  price: number; // Base price
  stock: number; // Base stock
  sku?: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
  variants?: ProductVariantOption[];
  modifierGroups?: ProductModifierGroup[];
  createdAt: number; // Timestamp ms
  updatedAt: number; // Timestamp ms
  deletedAt: number | null; // null if active, timestamp if soft deleted
}
