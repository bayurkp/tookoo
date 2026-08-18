export interface MasterCategory {
  id: string; // UUID v4
  name: string; // e.g. "Minuman", "Makanan", "Retail", "Pakaian", "Jasa"
  parentId?: string | null; // null if top-level parent category, or parent category UUID if sub-category
  parentName?: string | null;
  description?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface MasterUom {
  id: string; // UUID v4
  name: string; // e.g. "Porsi", "Gelas", "Cup", "Botol", "Kilogram", "Pieces"
  symbol: string; // e.g. "porsi", "gelas", "cup", "botol", "kg", "pcs", "pack"
  description?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface MasterVariantAttribute {
  id: string; // UUID v4
  name: string; // e.g. "Ukuran (Size)", "Suhu (Temperature)", "Level Gula", "Level Pedas", "Varian Rasa", "Warna"
  presetOptions: string[]; // e.g. ["Small", "Medium", "Large"] or ["Hot", "Ice"]
  description?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface MasterModifierOption {
  id: string; // UUID v4
  name: string; // e.g. "Ekstra Boba", "Less Ice", "Keju Mozzarella"
  price: number; // Additional price in currency smallest unit (e.g. 3000)
}

export interface MasterModifierGroup {
  id: string; // UUID v4
  name: string; // e.g. "Topping Tambahan", "Pilihan Susu", "Level Pedas", "Pilihan Sambal"
  required?: boolean;
  minSelect?: number;
  maxSelect?: number; // 1 for single choice (radio), >1 for multiple choices (checkbox)
  options: MasterModifierOption[];
  description?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

// Discount & Promo Master Types
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type DiscountScope = 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCT' | 'SPECIFIC_VARIANT';

export interface MasterDiscount {
  id: string; // UUID v4
  name: string; // e.g. "Diskon Pembukaan 10%", "Potongan Rp 5.000 Kopi Latte"
  code?: string; // e.g. "PROMO10", "LATTE5K"
  type: DiscountType; // 'PERCENTAGE' | 'FIXED'
  value: number; // e.g. 10 (for 10%) or 5000 (for Rp 5.000)
  scope: DiscountScope; // 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCT' | 'SPECIFIC_VARIANT'
  targetProductId?: string | null; // Selected product UUID if scope === 'SPECIFIC_PRODUCT' or 'SPECIFIC_VARIANT'
  targetProductName?: string | null;
  targetVariantId?: string | null; // Selected variant UUID if scope === 'SPECIFIC_VARIANT'
  targetVariantName?: string | null;
  hasExpiry: boolean; // false = Berlaku Selamanya / Tanpa Batas Waktu, true = Berdasarkan Tanggal
  startDate?: number | null; // Millisecond timestamp
  endDate?: number | null; // Millisecond timestamp
  minPurchaseAmount?: number | null; // Minimum belanja total in currency
  maxDiscountAmount?: number | null; // Maksimal potongan diskon (khusus tipe PERCENTAGE)
  isActive: boolean; // Aktif / Nonaktif
  description?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

// Tax & Service Charge Master Types
export type TaxType = 'PERCENTAGE' | 'FIXED';

export interface MasterTax {
  id: string; // UUID v4
  name: string; // e.g. "PB1 / Pajak Restoran (10%)", "PPN (11%)", "Service Charge (5%)"
  rate: number; // e.g. 10 (for 10%) or 2000 (for Rp 2.000)
  type: TaxType; // 'PERCENTAGE' | 'FIXED'
  inclusive: boolean; // true = Termasuk dalam harga menu (Nett), false = Ditambahkan di luar harga
  isDefault: boolean; // Otomatis aktif di kasir
  isActive: boolean; // Aktif / Nonaktif
  description?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}
