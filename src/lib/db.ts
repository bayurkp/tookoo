import Dexie, { type Table } from 'dexie';
import type { Product } from '@/types/product.types';
import type { Order } from '@/types/order.types';
import type { StoreSettings, Outlet, Staff } from '@/types/store.types';
import type { StockAdjustment } from '@/types/stock-adjustment.types';
import type {
  MasterCategory,
  MasterUom,
  MasterVariantAttribute,
  MasterModifierGroup,
  MasterDiscount,
  MasterTax,
} from '@/types/master-data.types';
import type { StoreTable } from '@/types/table.types';
import type { Expense } from '@/types/expense.types';
import type { Customer } from '@/types/customer.types';
import type { Supplier } from '@/types/supplier.types';
import type { Shift, CashMovement } from '@/types/shift.types';

export class TookooDatabase extends Dexie {
  products!: Table<Product, string>;
  orders!: Table<Order, string>;
  settings!: Table<StoreSettings, string>;
  stockAdjustments!: Table<StockAdjustment, string>;
  masterCategories!: Table<MasterCategory, string>;
  masterUoms!: Table<MasterUom, string>;
  masterVariantAttributes!: Table<MasterVariantAttribute, string>;
  masterModifierGroups!: Table<MasterModifierGroup, string>;
  masterDiscounts!: Table<MasterDiscount, string>;
  masterTaxes!: Table<MasterTax, string>;
  expenses!: Table<Expense, string>;
  customers!: Table<Customer, string>;
  suppliers!: Table<Supplier, string>;
  outlets!: Table<Outlet, string>;
  staff!: Table<Staff, string>;
  shifts!: Table<Shift, string>;
  cashMovements!: Table<CashMovement, string>;

  get restaurantTables(): Table<StoreTable, string> {
    return this.table<StoreTable, string>('tables');
  }

  constructor() {
    super('TookooDB');

    this.version(1).stores({
      products: 'id, name, category, price, stock, createdAt, updatedAt, deletedAt',
      orders:
        'id, orderNumber, totalAmount, paymentMethod, cashierName, createdAt, updatedAt, deletedAt',
      settings: 'id, storeName, passphrase, createdAt, updatedAt, deletedAt',
      stockAdjustments: 'id, adjustmentNumber, adjustedBy, createdAt, updatedAt, deletedAt',
    });

    this.version(2).stores({
      masterCategories: 'id, name, parentId, createdAt, updatedAt, deletedAt',
      masterUoms: 'id, name, symbol, createdAt, updatedAt, deletedAt',
      masterVariantAttributes: 'id, name, createdAt, updatedAt, deletedAt',
      masterModifierGroups: 'id, name, createdAt, updatedAt, deletedAt',
    });

    this.version(3).stores({
      tables: 'id, name, zone, status, createdAt, updatedAt, deletedAt',
    });

    this.version(4).stores({
      masterDiscounts: 'id, name, code, scope, isActive, createdAt, updatedAt, deletedAt',
      masterTaxes: 'id, name, type, isActive, createdAt, updatedAt, deletedAt',
    });

    this.version(5).stores({
      products: 'id, name, category, price, stock, createdAt, updatedAt, deletedAt',
      orders:
        'id, orderNumber, totalAmount, paymentMethod, cashierName, createdAt, updatedAt, deletedAt',
      settings: 'id, storeName, passphrase, createdAt, updatedAt, deletedAt',
      stockAdjustments: 'id, adjustmentNumber, adjustedBy, createdAt, updatedAt, deletedAt',
      masterCategories: 'id, name, parentId, createdAt, updatedAt, deletedAt',
      masterUoms: 'id, name, symbol, createdAt, updatedAt, deletedAt',
      masterVariantAttributes: 'id, name, createdAt, updatedAt, deletedAt',
      masterModifierGroups: 'id, name, createdAt, updatedAt, deletedAt',
      tables: 'id, name, zone, status, createdAt, updatedAt, deletedAt',
      masterDiscounts: 'id, name, code, scope, isActive, createdAt, updatedAt, deletedAt',
      masterTaxes: 'id, name, type, isActive, createdAt, updatedAt, deletedAt',
    });

    this.version(6).stores({
      products: 'id, name, category, price, stock, createdAt, updatedAt, deletedAt',
      orders:
        'id, orderNumber, totalAmount, paymentMethod, cashierName, createdAt, updatedAt, deletedAt',
      settings: 'id, storeName, passphrase, createdAt, updatedAt, deletedAt',
      stockAdjustments: 'id, adjustmentNumber, adjustedBy, createdAt, updatedAt, deletedAt',
      masterCategories: 'id, name, parentId, createdAt, updatedAt, deletedAt',
      masterUoms: 'id, name, symbol, createdAt, updatedAt, deletedAt',
      masterVariantAttributes: 'id, name, createdAt, updatedAt, deletedAt',
      masterModifierGroups: 'id, name, createdAt, updatedAt, deletedAt',
      tables: 'id, name, zone, status, createdAt, updatedAt, deletedAt',
      masterDiscounts: 'id, name, code, scope, isActive, createdAt, updatedAt, deletedAt',
      masterTaxes: 'id, name, type, isActive, createdAt, updatedAt, deletedAt',
      expenses: 'id, category, type, date, paymentMethod, createdAt, updatedAt, deletedAt',
    });

    this.version(7).stores({
      products: 'id, name, category, price, stock, createdAt, updatedAt, deletedAt',
      orders:
        'id, orderNumber, totalAmount, paymentMethod, cashierName, customerId, createdAt, updatedAt, deletedAt',
      settings: 'id, storeName, passphrase, createdAt, updatedAt, deletedAt',
      stockAdjustments: 'id, adjustmentNumber, adjustedBy, createdAt, updatedAt, deletedAt',
      masterCategories: 'id, name, parentId, createdAt, updatedAt, deletedAt',
      masterUoms: 'id, name, symbol, createdAt, updatedAt, deletedAt',
      masterVariantAttributes: 'id, name, createdAt, updatedAt, deletedAt',
      masterModifierGroups: 'id, name, createdAt, updatedAt, deletedAt',
      tables: 'id, name, zone, status, createdAt, updatedAt, deletedAt',
      masterDiscounts: 'id, name, code, scope, isActive, createdAt, updatedAt, deletedAt',
      masterTaxes: 'id, name, type, isActive, createdAt, updatedAt, deletedAt',
      expenses:
        'id, category, type, date, paymentMethod, supplierId, createdAt, updatedAt, deletedAt',
      customers: 'id, name, phone, email, tier, createdAt, updatedAt, deletedAt',
      suppliers: 'id, name, phone, email, contactPerson, createdAt, updatedAt, deletedAt',
    });

    this.version(8).stores({
      products: 'id, name, category, price, stock, createdAt, updatedAt, deletedAt',
      orders:
        'id, orderNumber, totalAmount, paymentMethod, cashierName, customerId, outletId, staffId, createdAt, updatedAt, deletedAt',
      settings:
        'id, storeName, passphrase, activeOutletId, activeStaffId, createdAt, updatedAt, deletedAt',
      stockAdjustments:
        'id, adjustmentNumber, adjustedBy, outletId, staffId, createdAt, updatedAt, deletedAt',
      masterCategories: 'id, name, parentId, createdAt, updatedAt, deletedAt',
      masterUoms: 'id, name, symbol, createdAt, updatedAt, deletedAt',
      masterVariantAttributes: 'id, name, createdAt, updatedAt, deletedAt',
      masterModifierGroups: 'id, name, createdAt, updatedAt, deletedAt',
      tables: 'id, name, zone, status, outletId, createdAt, updatedAt, deletedAt',
      masterDiscounts: 'id, name, code, scope, isActive, createdAt, updatedAt, deletedAt',
      masterTaxes: 'id, name, type, isActive, createdAt, updatedAt, deletedAt',
      expenses:
        'id, category, type, date, paymentMethod, supplierId, outletId, staffId, createdAt, updatedAt, deletedAt',
      customers: 'id, name, phone, email, tier, createdAt, updatedAt, deletedAt',
      suppliers: 'id, name, phone, email, contactPerson, createdAt, updatedAt, deletedAt',
      outlets: 'id, storeId, name, isHQ, createdAt, updatedAt, deletedAt',
      staff: 'id, storeId, name, role, hasAllOutlets, isActive, createdAt, updatedAt, deletedAt',
    });

    this.version(9).stores({
      products: 'id, name, category, price, stock, createdAt, updatedAt, deletedAt',
      orders:
        'id, orderNumber, totalAmount, paymentMethod, cashierName, customerId, outletId, staffId, createdAt, updatedAt, deletedAt',
      settings:
        'id, storeName, passphrase, activeOutletId, activeStaffId, createdAt, updatedAt, deletedAt',
      stockAdjustments:
        'id, adjustmentNumber, adjustedBy, outletId, staffId, createdAt, updatedAt, deletedAt',
      masterCategories: 'id, name, parentId, createdAt, updatedAt, deletedAt',
      masterUoms: 'id, name, symbol, createdAt, updatedAt, deletedAt',
      masterVariantAttributes: 'id, name, createdAt, updatedAt, deletedAt',
      masterModifierGroups: 'id, name, createdAt, updatedAt, deletedAt',
      tables: 'id, name, zone, status, outletId, createdAt, updatedAt, deletedAt',
      masterDiscounts: 'id, name, code, scope, isActive, createdAt, updatedAt, deletedAt',
      masterTaxes: 'id, name, type, isActive, createdAt, updatedAt, deletedAt',
      expenses:
        'id, category, type, date, paymentMethod, supplierId, outletId, staffId, createdAt, updatedAt, deletedAt',
      customers: 'id, name, phone, email, tier, createdAt, updatedAt, deletedAt',
      suppliers: 'id, name, phone, email, contactPerson, createdAt, updatedAt, deletedAt',
      outlets: 'id, storeId, name, isHQ, createdAt, updatedAt, deletedAt',
      staff: 'id, storeId, name, role, hasAllOutlets, isActive, createdAt, updatedAt, deletedAt',
      shifts:
        'id, cashierName, status, outletId, staffId, openedAt, closedAt, createdAt, updatedAt, deletedAt',
      cashMovements:
        'id, shiftId, type, category, performedBy, outletId, createdAt, updatedAt, deletedAt',
    });
  }
}

export const db = new TookooDatabase();

// Default Indonesian Retail & F&B seeds
export const DEFAULT_MASTER_CATEGORIES: Omit<
  MasterCategory,
  'createdAt' | 'updatedAt' | 'deletedAt'
>[] = [
  {
    id: 'cat-minuman',
    name: 'Minuman',
    parentId: null,
    description: 'Aneka minuman segar, kopi, dan teh',
  },
  { id: 'cat-kopi', name: 'Kopi & Espresso', parentId: 'cat-minuman', parentName: 'Minuman' },
  { id: 'cat-non-kopi', name: 'Teh & Cokelat', parentId: 'cat-minuman', parentName: 'Minuman' },
  {
    id: 'cat-makanan',
    name: 'Makanan & Kuliner',
    parentId: null,
    description: 'Makanan utama dan olahan dapur',
  },
  {
    id: 'cat-makanan-utama',
    name: 'Makanan Utama',
    parentId: 'cat-makanan',
    parentName: 'Makanan & Kuliner',
  },
  {
    id: 'cat-snack',
    name: 'Camilan & Snack',
    parentId: 'cat-makanan',
    parentName: 'Makanan & Kuliner',
  },
  {
    id: 'cat-retail',
    name: 'Retail & Sembako',
    parentId: null,
    description: 'Barang kemasan dan kebutuhan harian',
  },
  {
    id: 'cat-jasa',
    name: 'Jasa & Servis',
    parentId: null,
    description: 'Layanan jasa dan ongkos pengerjaan',
  },
];

export const DEFAULT_MASTER_UOMS: Omit<MasterUom, 'createdAt' | 'updatedAt' | 'deletedAt'>[] = [
  {
    id: 'uom-pcs',
    name: 'Pieces / Buah',
    symbol: 'pcs',
    description: 'Satuan per satuan barang fisik',
  },
  {
    id: 'uom-porsi',
    name: 'Porsi Makanan',
    symbol: 'porsi',
    description: 'Satuan sajian makanan matang',
  },
  { id: 'uom-cup', name: 'Cup Gelas', symbol: 'cup', description: 'Satuan minuman kemasan cup' },
  { id: 'uom-gelas', name: 'Gelas Minum', symbol: 'gelas', description: 'Satuan minuman dine-in' },
  {
    id: 'uom-botol',
    name: 'Botol',
    symbol: 'botol',
    description: 'Satuan kemasan botol kaca / plastik',
  },
  { id: 'uom-pack', name: 'Pack / Bungkus', symbol: 'pack', description: 'Satuan kemasan bungkus' },
  {
    id: 'uom-box',
    name: 'Kotak / Box',
    symbol: 'box',
    description: 'Satuan kemasan kardus / kotak',
  },
  { id: 'uom-kg', name: 'Kilogram', symbol: 'kg', description: 'Satuan berat kilogram' },
  { id: 'uom-gram', name: 'Gram', symbol: 'gram', description: 'Satuan berat gram' },
  { id: 'uom-liter', name: 'Liter', symbol: 'liter', description: 'Satuan volume cairan liter' },
];

export const DEFAULT_MASTER_VARIANT_ATTRIBUTES: Omit<
  MasterVariantAttribute,
  'createdAt' | 'updatedAt' | 'deletedAt'
>[] = [
  {
    id: 'attr-ukuran',
    name: 'Ukuran (Size)',
    presetOptions: ['Small (S)', 'Medium (M)', 'Large (L)', 'Extra Large (XL)'],
    description: 'Pilihan dimensi ukuran pakaian atau minuman',
  },
  {
    id: 'attr-suhu',
    name: 'Suhu Penyajian',
    presetOptions: ['Dingin (Iced)', 'Panas (Hot)', 'Normal (Warm)'],
    description: 'Pilihan suhu penyajian minuman',
  },
  {
    id: 'attr-gula',
    name: 'Tingkat Kemanisan (Sugar Level)',
    presetOptions: [
      'No Sugar (0%)',
      'Less Sugar (50%)',
      'Normal Sugar (100%)',
      'Extra Sugar (120%)',
    ],
    description: 'Pengaturan kadar gula pada minuman',
  },
  {
    id: 'attr-pedas',
    name: 'Level Kepedasan',
    presetOptions: [
      'Level 0 (Tidak Pedas)',
      'Level 1 (Sedang)',
      'Level 2 (Pedas)',
      'Level 3 (Ekstra Pedas)',
    ],
    description: 'Tingkat cabai atau kepedasan makanan',
  },
  {
    id: 'attr-rasa',
    name: 'Varian Rasa',
    presetOptions: ['Original', 'Cokelat', 'Vanilla', 'Matcha Green Tea', 'Keju Mozzarella'],
    description: 'Pilihan aroma dan rasa produk',
  },
  {
    id: 'attr-warna',
    name: 'Pilihan Warna',
    presetOptions: ['Hitam', 'Putih', 'Abu-abu', 'Navy Blue', 'Merah Marun'],
    description: 'Pilihan warna retail / pakaian',
  },
];

export const DEFAULT_MASTER_MODIFIER_GROUPS: Omit<
  MasterModifierGroup,
  'createdAt' | 'updatedAt' | 'deletedAt'
>[] = [
  {
    id: 'mod-topping-minuman',
    name: 'Topping Minuman Tambahan',
    required: false,
    minSelect: 0,
    maxSelect: 5,
    description: 'Pilihan ekstra topping minuman manis',
    options: [
      { id: 'opt-boba', name: 'Ekstra Boba Brown Sugar', price: 3000 },
      { id: 'opt-jelly', name: 'Grass Jelly / Cincau', price: 3000 },
      { id: 'opt-pudding', name: 'Egg Pudding Lembut', price: 4000 },
      { id: 'opt-espresso', name: 'Extra Shot Espresso', price: 4000 },
      { id: 'opt-cheese', name: 'Cheese Foam Cream', price: 5000 },
    ],
  },
  {
    id: 'mod-susu',
    name: 'Pilihan Jenis Susu (Dairy Option)',
    required: false,
    minSelect: 0,
    maxSelect: 1,
    description: 'Substitusi susu nabati / fresh milk',
    options: [
      { id: 'opt-fresh-milk', name: 'Fresh Milk Sapi (Reguler)', price: 0 },
      { id: 'opt-oat-milk', name: 'Oat Milk (Oatside)', price: 6000 },
      { id: 'opt-almond-milk', name: 'Almond Milk Organik', price: 7000 },
      { id: 'opt-soy-milk', name: 'Soy Milk (Kedelai)', price: 4000 },
    ],
  },
  {
    id: 'mod-sambal',
    name: 'Pilihan Sambal & Saus',
    required: false,
    minSelect: 0,
    maxSelect: 1,
    description: 'Pilihan bumbu pelengkap makanan',
    options: [
      { id: 'opt-sambal-bawang', name: 'Sambal Bawang Korek', price: 0 },
      { id: 'opt-sambal-matah', name: 'Sambal Matah Bali', price: 2000 },
      { id: 'opt-sambal-ijo', name: 'Sambal Ijo Padang', price: 0 },
      { id: 'opt-saus-keju', name: 'Saus Keju Melted', price: 3000 },
    ],
  },
];

export const DEFAULT_STORE_TABLES: Omit<StoreTable, 'createdAt' | 'updatedAt' | 'deletedAt'>[] = [
  {
    id: 'table-01',
    name: 'Meja 01',
    zone: 'Area Utama (Indoor)',
    x: 40,
    y: 40,
    width: 100,
    height: 80,
    capacity: 4,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-02',
    name: 'Meja 02',
    zone: 'Area Utama (Indoor)',
    x: 180,
    y: 40,
    width: 100,
    height: 80,
    capacity: 4,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-03',
    name: 'Meja 03',
    zone: 'Area Utama (Indoor)',
    x: 320,
    y: 40,
    width: 100,
    height: 80,
    capacity: 4,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-04',
    name: 'Meja 04',
    zone: 'Area Utama (Indoor)',
    x: 460,
    y: 40,
    width: 140,
    height: 80,
    capacity: 6,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-05',
    name: 'Meja 05',
    zone: 'Area Utama (Indoor)',
    x: 40,
    y: 160,
    width: 80,
    height: 80,
    capacity: 2,
    shape: 'SQUARE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-06',
    name: 'Meja 06',
    zone: 'Area Utama (Indoor)',
    x: 160,
    y: 160,
    width: 80,
    height: 80,
    capacity: 2,
    shape: 'SQUARE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-07',
    name: 'Meja 07',
    zone: 'Area Utama (Indoor)',
    x: 280,
    y: 160,
    width: 100,
    height: 80,
    capacity: 4,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-08',
    name: 'Meja VIP',
    zone: 'VIP Room',
    x: 40,
    y: 40,
    width: 180,
    height: 100,
    capacity: 8,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-out-01',
    name: 'Outdoor 01',
    zone: 'Area Outdoor (Smoking)',
    x: 40,
    y: 40,
    width: 80,
    height: 80,
    capacity: 2,
    shape: 'SQUARE',
    status: 'AVAILABLE',
  },
  {
    id: 'table-out-02',
    name: 'Outdoor 02',
    zone: 'Area Outdoor (Smoking)',
    x: 160,
    y: 40,
    width: 100,
    height: 80,
    capacity: 4,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
  },
];

export const DEFAULT_MASTER_DISCOUNTS: Omit<
  MasterDiscount,
  'createdAt' | 'updatedAt' | 'deletedAt'
>[] = [
  {
    id: 'disc-grand-opening',
    name: 'Promo Grand Opening 10%',
    code: 'OPENING10',
    type: 'PERCENTAGE',
    value: 10,
    scope: 'ALL_PRODUCTS',
    hasExpiry: false,
    isActive: true,
    description: 'Diskon 10% untuk seluruh produk menu',
  },
  {
    id: 'disc-weekend-hemat',
    name: 'Voucher Hemat Rp 5.000',
    code: 'HEMAT5K',
    type: 'FIXED',
    value: 5000,
    scope: 'ALL_PRODUCTS',
    minPurchaseAmount: 30000,
    hasExpiry: false,
    isActive: true,
    description: 'Potongan Rp 5.000 dengan min. belanja Rp 30.000',
  },
];

export const DEFAULT_MASTER_TAXES: Omit<MasterTax, 'createdAt' | 'updatedAt' | 'deletedAt'>[] = [
  {
    id: 'tax-pb1',
    name: 'PB1 / Pajak Restoran (10%)',
    rate: 10,
    type: 'PERCENTAGE',
    inclusive: false,
    isDefault: false,
    isActive: true,
    description: 'Pajak pembangunan daerah 1 untuk makanan & minuman',
  },
  {
    id: 'tax-service',
    name: 'Biaya Layanan (Service Charge 5%)',
    rate: 5,
    type: 'PERCENTAGE',
    inclusive: false,
    isDefault: false,
    isActive: true,
    description: 'Biaya operasional pelayanan dan kebersihan restoran',
  },
];

/**
 * Auto-populates default Indonesian retail/F&B presets into IndexedDB if master tables are empty.
 */
export async function seedMasterDefaultsIfEmpty(): Promise<void> {
  try {
    const now = Date.now();

    if (db.masterCategories && typeof db.masterCategories.count === 'function') {
      const catCount = await db.masterCategories.count();
      if (catCount === 0) {
        await db.masterCategories.bulkPut(
          DEFAULT_MASTER_CATEGORIES.map((c) => ({
            ...c,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );
      }
    }

    if (db.masterUoms && typeof db.masterUoms.count === 'function') {
      const uomCount = await db.masterUoms.count();
      if (uomCount === 0) {
        await db.masterUoms.bulkPut(
          DEFAULT_MASTER_UOMS.map((u) => ({
            ...u,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );
      }
    }

    if (db.masterVariantAttributes && typeof db.masterVariantAttributes.count === 'function') {
      const variantCount = await db.masterVariantAttributes.count();
      if (variantCount === 0) {
        await db.masterVariantAttributes.bulkPut(
          DEFAULT_MASTER_VARIANT_ATTRIBUTES.map((v) => ({
            ...v,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );
      }
    }

    if (db.masterModifierGroups && typeof db.masterModifierGroups.count === 'function') {
      const modCount = await db.masterModifierGroups.count();
      if (modCount === 0) {
        await db.masterModifierGroups.bulkPut(
          DEFAULT_MASTER_MODIFIER_GROUPS.map((m) => ({
            ...m,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );
      }
    }

    if (db.masterDiscounts && typeof db.masterDiscounts.count === 'function') {
      const discountCount = await db.masterDiscounts.count();
      if (discountCount === 0) {
        await db.masterDiscounts.bulkPut(
          DEFAULT_MASTER_DISCOUNTS.map((d) => ({
            ...d,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );
      }
    }

    if (db.masterTaxes && typeof db.masterTaxes.count === 'function') {
      const taxCount = await db.masterTaxes.count();
      if (taxCount === 0) {
        await db.masterTaxes.bulkPut(
          DEFAULT_MASTER_TAXES.map((tx) => ({
            ...tx,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          }))
        );
      }
    }
  } catch (err) {
    console.error('Failed to seed master defaults:', err);
  }
}
