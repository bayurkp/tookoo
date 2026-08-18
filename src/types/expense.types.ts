export type ExpenseCategory =
  | 'BAHAN_BAKU' // Bahan Baku / Kulakan Stok
  | 'OPERASIONAL' // Operasional Harian / Kemasan / Plastik
  | 'GAJI_KARYAWAN' // Gaji & Upah Staff
  | 'SEWA_TEMPAT' // Sewa Ruko / Lapak / Tempat
  | 'LISTRIK_AIR' // Listrik PLN, Air PDAM, Internet Wifi
  | 'MARKETING' // Promosi, Iklan, Banner
  | 'PERALATAN' // Pembelian Alat / Mesin / Aset
  | 'PERAWATAN' // Servis & Perbaikan Toko
  | 'LAINNYA'; // Pengeluaran Lain-lain

export type ExpenseType = 'EXPENSE' | 'PURCHASE_STOCK';

export type ExpensePaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS' | 'OTHER';

export interface PurchaseItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Expense {
  id: string; // UUID v4
  type: ExpenseType; // 'EXPENSE' (Biaya Operasional) | 'PURCHASE_STOCK' (Kulakan Stok)
  category: ExpenseCategory;
  customCategory?: string;
  amount: number; // Nominal Pengeluaran (IDR)
  description: string; // Catatan / Keterangan (e.g. "Beli Biji Kopi 5kg dari Supplier A")
  paymentMethod: ExpensePaymentMethod; // Metode Pembayaran
  paidTo?: string; // Penerima / Vendor / Supplier / Nama Toko
  date: number; // Tanggal transaksi (Timestamp ms)
  receiptImage?: string; // Foto struk / bukti transfer (Base64 data URL)
  tags?: string[];
  purchaseItems?: PurchaseItem[]; // Jika pembelian stok barang
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export const EXPENSE_CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; color: string }
> = {
  BAHAN_BAKU: {
    label: 'Bahan Baku & Kulakan',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  OPERASIONAL: {
    label: 'Operasional & Kemasan',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  GAJI_KARYAWAN: {
    label: 'Gaji & Upah Karyawan',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  SEWA_TEMPAT: {
    label: 'Sewa Tempat & Lapak',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  LISTRIK_AIR: {
    label: 'Listrik, Air & Wifi',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  },
  MARKETING: {
    label: 'Marketing & Promosi',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
  },
  PERALATAN: {
    label: 'Peralatan & Aset Toko',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  PERAWATAN: {
    label: 'Servis & Perbaikan',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  LAINNYA: {
    label: 'Lain-lain',
    color: 'bg-muted text-muted-foreground border-border',
  },
};
