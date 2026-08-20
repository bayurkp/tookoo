export type StockAdjustmentReason =
  | 'RESTOCK' // Kulakan / Stok Masuk
  | 'DAMAGED' // Barang Rusak / Cacat
  | 'EXPIRED' // Kadaluarsa / Basi
  | 'INTERNAL_USE' // Pemakaian Pribadi / Operasional Toko
  | 'PHYSICAL_COUNT' // Koreksi Hitung Fisik (Penyesuaian)
  | 'OTHER'; // Lainnya

export interface StockAdjustmentItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  previousStock: number;
  adjustedStock: number;
  difference: number; // e.g. +10 or -3
  reason: StockAdjustmentReason;
  notes?: string;
}

export interface StockAdjustment {
  id: string; // UUID v4
  adjustmentNumber: string; // e.g. "ADJ-20260818-1234"
  items: StockAdjustmentItem[];
  adjustedBy: string; // Cashier / Owner name
  staffId?: string; // UUID Staff who adjusted stock
  outletId?: string; // UUID Outlet
  outletName?: string; // Snapshot of outlet name
  notes?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}
