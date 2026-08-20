import { db } from '@/lib/db';
import { generateUUID } from '@/utils/uuid';
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

/**
 * Loads a rich, complete, professional Indonesian POS demo dataset into Dexie/IndexedDB.
 */
export async function loadProfessionalDemoData(options?: { resetFirst?: boolean }): Promise<void> {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (options?.resetFirst) {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
      }
    });
  }

  const storeId = 'store-demo-tookoo';
  const hqOutletId = 'outlet-hq-jkt';
  const branchOutletId = 'outlet-bdg-riau';

  // 1. Outlets
  const outlets: Outlet[] = [
    {
      id: hqOutletId,
      storeId,
      name: 'Cabang Utama (Senopati)',
      address: 'Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan',
      phone: '0812-3456-7890',
      isHQ: true,
      createdAt: now - 30 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: branchOutletId,
      storeId,
      name: 'Cabang Bandung (Riau)',
      address: 'Jl. L.L.R.E Martadinata No. 18, Citarum, Bandung',
      phone: '0813-9876-5432',
      isHQ: false,
      createdAt: now - 15 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 2. Staff
  const ownerStaffId = generateUUID();
  const managerStaffId = generateUUID();
  const cashierStaffId = generateUUID();

  const staffList: Staff[] = [
    {
      id: ownerStaffId,
      storeId,
      name: 'Budi Pratama',
      role: 'OWNER',
      pin: '1234',
      hasAllOutlets: true,
      outletIds: [],
      phone: '0812-3456-7890',
      isActive: true,
      createdAt: now - 30 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: managerStaffId,
      storeId,
      name: 'Siti Rahmawati',
      role: 'MANAGER',
      pin: '2233',
      hasAllOutlets: true,
      outletIds: [],
      phone: '0812-1111-2222',
      isActive: true,
      createdAt: now - 20 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: cashierStaffId,
      storeId,
      name: 'Andi Saputra',
      role: 'CASHIER',
      pin: '1122',
      hasAllOutlets: false,
      outletIds: [hqOutletId],
      phone: '0813-3333-4444',
      isActive: true,
      createdAt: now - 10 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 3. Settings
  const existingSettings = await db.settings.toCollection().first();
  const demoSettings: StoreSettings = {
    id: existingSettings?.id || storeId,
    storeName: 'Kopi & Resto Nusantara',
    storeAddress: 'Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan',
    receiptFooter:
      'Terima kasih atas kunjungan Anda!\nFollow IG: @kopi.resto.nusantara\nPassword WiFi: nusantara2026',
    defaultCashier: 'Budi Pratama',
    activeStaffId: ownerStaffId,
    activeOutletId: hqOutletId,
    currency: 'IDR',
    appMode: 'ADVANCED',
    activeRole: 'OWNER',
    ownerPin: '1234',
    soundEnabled: true,
    autoPrint: false,
    isSetupComplete: true,
    passphrase:
      existingSettings?.passphrase ||
      'kopi resto nusantara rasa mantap segar nikmat jaya abadi sukses barokah',
    storeSecretKey: existingSettings?.storeSecretKey || generateUUID(),
    createdAt: existingSettings?.createdAt || now - 30 * dayMs,
    updatedAt: now,
    deletedAt: null,
  };

  // 4. Master Categories
  const catCoffeeId = generateUUID();
  const catNonCoffeeId = generateUUID();
  const catFoodId = generateUUID();
  const catSnackId = generateUUID();
  const catComboId = generateUUID();

  const masterCategories: MasterCategory[] = [
    {
      id: catCoffeeId,
      name: 'Kopi & Espresso',
      description: 'Minuman kopi berbahan biji espresso arabika pilihan',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: catNonCoffeeId,
      name: 'Non-Coffee & Teh',
      description: 'Teh artisan, matcha, cokelat, dan mocktail segar',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: catFoodId,
      name: 'Makanan Utama',
      description: 'Menu hidangan khas nusantara mengenyangkan',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: catSnackId,
      name: 'Camilan & Pastry',
      description: 'Pastry fresh oven, roti toast, dan snack gurih',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: catComboId,
      name: 'Paket Hemat',
      description: 'Kombinasi makanan dan minuman harga spesial',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 5. Master UOMs
  const masterUoms: MasterUom[] = [
    {
      id: generateUUID(),
      name: 'Cup',
      symbol: 'cup',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Porsi',
      symbol: 'porsi',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Pcs',
      symbol: 'pcs',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Botol',
      symbol: 'btl',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Piring',
      symbol: 'prg',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 6. Master Variant Attributes
  const masterVariantAttributes: MasterVariantAttribute[] = [
    {
      id: generateUUID(),
      name: 'Ukuran',
      presetOptions: ['Reguler', 'Large (+Rp 5.000)'],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Suhu',
      presetOptions: ['Dingin (Ice)', 'Panas (Hot)'],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Level Pedas',
      presetOptions: ['Sedang (Level 1)', 'Pedas (Level 2)', 'Ekstra Pedas (Level 3)'],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 7. Master Modifier Groups
  const masterModifierGroups: MasterModifierGroup[] = [
    {
      id: generateUUID(),
      name: 'Topping Minuman',
      required: false,
      minSelect: 0,
      maxSelect: 3,
      options: [
        { id: generateUUID(), name: 'Boba Gula Aren', price: 4000 },
        { id: generateUUID(), name: 'Grass Jelly (Cincau)', price: 3000 },
        { id: generateUUID(), name: 'Extra Espresso Shot', price: 5000 },
        { id: generateUUID(), name: 'Susu Oat (Oatmilk)', price: 6000 },
      ],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Ekstra Makanan',
      required: false,
      minSelect: 0,
      maxSelect: 2,
      options: [
        { id: generateUUID(), name: 'Telur Mata Sapi', price: 4000 },
        { id: generateUUID(), name: 'Sambal Matah', price: 3000 },
        { id: generateUUID(), name: 'Sambal Bawang Pedas', price: 3000 },
        { id: generateUUID(), name: 'Keju Mozzarella Melt', price: 6000 },
      ],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 8. Master Discounts
  const masterDiscounts: MasterDiscount[] = [
    {
      id: generateUUID(),
      name: 'Diskon Member VIP',
      code: 'MEMBERVIP',
      type: 'PERCENTAGE',
      value: 10,
      maxDiscountAmount: 50000,
      scope: 'ALL_PRODUCTS',
      hasExpiry: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Promo Grand Opening',
      code: 'OPENING5K',
      type: 'FIXED',
      value: 5000,
      minPurchaseAmount: 35000,
      scope: 'ALL_PRODUCTS',
      hasExpiry: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Jum’at Berkah 15%',
      code: 'JUMATBERKAH',
      type: 'PERCENTAGE',
      value: 15,
      scope: 'ALL_PRODUCTS',
      hasExpiry: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 9. Master Taxes
  const masterTaxes: MasterTax[] = [
    {
      id: generateUUID(),
      name: 'PB1 (Pajak Restoran 10%)',
      type: 'PERCENTAGE',
      rate: 10,
      inclusive: false,
      isDefault: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Biaya Layanan (Service 5%)',
      type: 'PERCENTAGE',
      rate: 5,
      inclusive: false,
      isDefault: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 10. Products Catalog
  const products: Product[] = [
    {
      id: 'prod-kopsus-aren',
      name: 'Kopi Susu Gula Aren',
      category: 'Kopi & Espresso',
      productType: 'FNB',
      unit: 'cup',
      price: 18000,
      costPrice: 7500,
      stock: 85,
      minStock: 10,
      sku: 'KOP-01',
      barcode: '8991001001',
      description: 'Espresso blend pilihan dipadu susu creamy dan sirup gula aren murni',
      imageUrl:
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      variantDimensions: [{ id: generateUUID(), name: 'Ukuran', options: ['Reguler', 'Large'] }],
      variants: [
        { id: generateUUID(), name: 'Reguler', price: 18000, costPrice: 7500, stock: 50 },
        { id: generateUUID(), name: 'Large', price: 23000, costPrice: 9500, stock: 35 },
      ],
      modifierGroups: [
        {
          id: generateUUID(),
          name: 'Topping Tambahan',
          options: [
            { id: generateUUID(), name: 'Boba Brown Sugar', price: 4000 },
            { id: generateUUID(), name: 'Grass Jelly', price: 3000 },
            { id: generateUUID(), name: 'Extra Shot Espresso', price: 5000 },
          ],
        },
      ],
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-iced-americano',
      name: 'Iced Americano (Double Shot)',
      category: 'Kopi & Espresso',
      productType: 'FNB',
      unit: 'cup',
      price: 16000,
      costPrice: 4500,
      stock: 95,
      minStock: 10,
      sku: 'KOP-02',
      barcode: '8991001002',
      description: 'Double espresso arabika dengan es batu jernih yang menyegarkan',
      imageUrl:
        'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-caramel-macchiato',
      name: 'Caramel Macchiato Creamy',
      category: 'Kopi & Espresso',
      productType: 'FNB',
      unit: 'cup',
      price: 25000,
      costPrice: 10000,
      stock: 45,
      minStock: 5,
      sku: 'KOP-03',
      barcode: '8991001003',
      description: 'Kopi susu lembut dengan saus karamel lezat dan foam susu',
      imageUrl:
        'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-matcha-latte',
      name: 'Matcha Green Tea Latte',
      category: 'Non-Coffee & Teh',
      productType: 'FNB',
      unit: 'cup',
      price: 22000,
      costPrice: 9000,
      stock: 60,
      minStock: 8,
      sku: 'TEA-01',
      barcode: '8991002001',
      description: 'Bubuk matcha Uji premium dipadukan susu segar lembut',
      imageUrl:
        'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-earl-grey-tea',
      name: 'Es Teh Melati Jasmine Segar',
      category: 'Non-Coffee & Teh',
      productType: 'FNB',
      unit: 'cup',
      price: 8000,
      costPrice: 2000,
      stock: 120,
      minStock: 15,
      sku: 'TEA-02',
      barcode: '8991002002',
      description: 'Teh melati wangi aroma nusantara manis menyegarkan',
      imageUrl:
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-nasgor-spesial',
      name: 'Nasi Goreng Spesial + Telur',
      category: 'Makanan Utama',
      productType: 'FNB',
      unit: 'porsi',
      price: 28000,
      costPrice: 12500,
      stock: 40,
      minStock: 10,
      sku: 'FOD-01',
      barcode: '8991003001',
      description: 'Nasi goreng bumbu rempah dengan potongan ayam, bakso, kerupuk & telur',
      imageUrl:
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      modifierGroups: [
        {
          id: generateUUID(),
          name: 'Pilihan Sambal & Ekstra',
          options: [
            { id: generateUUID(), name: 'Telur Mata Sapi Ekstra', price: 4000 },
            { id: generateUUID(), name: 'Sambal Matah Bali', price: 3000 },
            { id: generateUUID(), name: 'Kerupuk Kaleng Tambahan', price: 2000 },
          ],
        },
      ],
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-ayam-bakar',
      name: 'Ayam Bakar Madu Komplit',
      category: 'Makanan Utama',
      productType: 'FNB',
      unit: 'porsi',
      price: 32000,
      costPrice: 15000,
      stock: 35,
      minStock: 5,
      sku: 'FOD-02',
      barcode: '8991003002',
      description: 'Ayam bakar bumbu kecap madu gurih manis dengan nasi, tahu tempe & sambal',
      imageUrl:
        'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-miegor-seafood',
      name: 'Mie Goreng Seafood Spesial',
      category: 'Makanan Utama',
      productType: 'FNB',
      unit: 'porsi',
      price: 29000,
      costPrice: 13500,
      stock: 30,
      minStock: 5,
      sku: 'FOD-03',
      barcode: '8991003003',
      description: 'Mie kuning kenyal dengan udang, cumi, telur dan bumbu khas oriental',
      imageUrl:
        'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-croissant',
      name: 'Butter Croissant Almond',
      category: 'Camilan & Pastry',
      productType: 'FNB',
      unit: 'pcs',
      price: 22000,
      costPrice: 11000,
      stock: 25,
      minStock: 5,
      sku: 'SNK-01',
      barcode: '8991004001',
      description: 'Croissant renyah berlapis butter prancis dengan taburan almond panggang',
      imageUrl:
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-french-fries',
      name: 'French Fries Cheese & Herbs',
      category: 'Camilan & Pastry',
      productType: 'FNB',
      unit: 'porsi',
      price: 19000,
      costPrice: 8000,
      stock: 50,
      minStock: 10,
      sku: 'SNK-02',
      barcode: '8991004002',
      description: 'Kentang goreng renyah bumbu keju gurih dengan saus cocolan mayo',
      imageUrl:
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-toast-cokelat',
      name: 'Roti Toast Cokelat Keju Melt',
      category: 'Camilan & Pastry',
      productType: 'FNB',
      unit: 'pcs',
      price: 18000,
      costPrice: 7000,
      stock: 30,
      minStock: 5,
      sku: 'SNK-03',
      barcode: '8991004003',
      description: 'Roti tebal panggang dengan lumeran cokelat belgia dan parutan keju cheddar',
      imageUrl:
        'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'prod-paket-kenyang',
      name: 'Paket Hemat (Nasi Goreng + Es Teh)',
      category: 'Paket Hemat',
      productType: 'FNB',
      unit: 'porsi',
      price: 32000,
      costPrice: 14500,
      stock: 40,
      minStock: 5,
      sku: 'CMB-01',
      barcode: '8991005001',
      description: 'Paket super hemat 1 Porsi Nasi Goreng Spesial dan 1 Cup Es Teh Manis Segar',
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 11. Restaurant Tables
  const restaurantTables: StoreTable[] = [
    {
      id: generateUUID(),
      name: 'Meja 01',
      zone: 'Area Utama (Indoor)',
      capacity: 4,
      status: 'AVAILABLE',
      x: 80,
      y: 80,
      width: 100,
      height: 80,
      shape: 'RECTANGLE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Meja 02',
      zone: 'Area Utama (Indoor)',
      capacity: 4,
      status: 'OCCUPIED',
      x: 220,
      y: 80,
      width: 100,
      height: 80,
      shape: 'RECTANGLE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Meja 03',
      zone: 'Area Utama (Indoor)',
      capacity: 2,
      status: 'AVAILABLE',
      x: 360,
      y: 80,
      width: 80,
      height: 80,
      shape: 'SQUARE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Meja 04',
      zone: 'Area Utama (Indoor)',
      capacity: 6,
      status: 'AVAILABLE',
      x: 120,
      y: 220,
      width: 140,
      height: 80,
      shape: 'RECTANGLE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Meja 05',
      zone: 'Area Outdoor (Smoking)',
      capacity: 4,
      status: 'AVAILABLE',
      x: 80,
      y: 80,
      width: 100,
      height: 80,
      shape: 'RECTANGLE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'Meja 06',
      zone: 'Area Outdoor (Smoking)',
      capacity: 4,
      status: 'AVAILABLE',
      x: 220,
      y: 80,
      width: 100,
      height: 80,
      shape: 'RECTANGLE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      name: 'VIP 01',
      zone: 'VIP Room',
      capacity: 8,
      status: 'AVAILABLE',
      x: 100,
      y: 100,
      width: 160,
      height: 100,
      shape: 'RECTANGLE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 12. Customers
  const customers: Customer[] = [
    {
      id: 'cust-dewi',
      name: 'Dewi Lestari',
      phone: '0813-8899-0011',
      email: 'dewi.lestari@gmail.com',
      tier: 'VIP',
      points: 150,
      totalSpent: 620000,
      totalOrders: 14,
      address: 'Jl. Wijaya No. 12, Kebayoran Baru, Jakarta Selatan',
      createdAt: now - 30 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'cust-rian',
      name: 'Rian Hidayat',
      phone: '0812-7788-9900',
      email: 'rian.hidayat@yahoo.com',
      tier: 'MEMBER_DISCOUNT',
      discountPercentage: 5,
      points: 80,
      totalSpent: 340000,
      totalOrders: 8,
      address: 'Jl. Bangka Raya No. 5, Jaksel',
      createdAt: now - 20 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'cust-maya',
      name: 'Maya Anggraini',
      phone: '0819-2233-4455',
      email: 'maya.anggraini@outlook.com',
      tier: 'VIP',
      points: 220,
      totalSpent: 940000,
      totalOrders: 21,
      address: 'Jl. Gandaria I No. 8, Jaksel',
      createdAt: now - 25 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'cust-agus',
      name: 'Agus Setiawan',
      phone: '0857-1122-3344',
      email: 'agus.setiawan@gmail.com',
      tier: 'REGULAR',
      points: 35,
      totalSpent: 145000,
      totalOrders: 3,
      createdAt: now - 10 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 13. Suppliers
  const suppliers: Supplier[] = [
    {
      id: 'sup-kopi-nusantara',
      name: 'PT Kopi Nusantara Abadi',
      contactPerson: 'Hendra Saputra',
      phone: '0811-2233-4455',
      email: 'sales@kopinusantara.co.id',
      address: 'Kawasan Industri Pulogadung Blok C No. 4, Jakarta Timur',
      suppliedItems: 'Biji Kopi Arabika Gayo & Sirup Artisan',
      createdAt: now - 30 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'sup-sembako-segar',
      name: 'CV Sembako Segar Makmur',
      contactPerson: 'Ibu Ratna',
      phone: '0812-9988-7766',
      email: 'order@sembakosegar.com',
      address: 'Pasar Induk Kramat Jati Kios A-12, Jakarta Timur',
      suppliedItems: 'Bahan Makanan Pokok, Daging Ayam & Telur',
      createdAt: now - 30 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'sup-packaging-mitra',
      name: 'Mitra Packaging Nusantara',
      contactPerson: 'Dimas Aditya',
      phone: '0818-5566-7788',
      email: 'info@mitrapackaging.id',
      address: 'Jl. Daan Mogot KM 12 No. 88, Jakarta Barat',
      suppliedItems: 'Paper Cup, Box Lunch Kraft & Sedotan',
      createdAt: now - 30 * dayMs,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // 14. Expenses
  const expenses: Expense[] = [
    {
      id: generateUUID(),
      type: 'EXPENSE',
      category: 'LISTRIK_AIR',
      amount: 750000,
      description: 'Tagihan Listrik PLN & Internet Biznet 100Mbps',
      paymentMethod: 'TRANSFER',
      outletId: hqOutletId,
      date: now - 3 * dayMs,
      createdAt: now - 3 * dayMs,
      updatedAt: now - 3 * dayMs,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      type: 'EXPENSE',
      category: 'OPERASIONAL',
      amount: 45000,
      description: '3 Bal Es Batu Kristal + 2 Galon Aqua Harian',
      paymentMethod: 'CASH',
      outletId: hqOutletId,
      date: now - 1 * dayMs,
      createdAt: now - 1 * dayMs,
      updatedAt: now - 1 * dayMs,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      type: 'PURCHASE_STOCK',
      category: 'BAHAN_BAKU',
      amount: 1250000,
      description: 'Restock 10kg Biji Kopi Arabika House Blend',
      paymentMethod: 'TRANSFER',
      outletId: hqOutletId,
      supplierId: 'sup-kopi-nusantara',
      date: now - 4 * dayMs,
      createdAt: now - 4 * dayMs,
      updatedAt: now - 4 * dayMs,
      deletedAt: null,
    },
  ];

  // 15. Realistic Orders History for Dashboard and Reports
  const orders: Order[] = [
    // Today Orders
    {
      id: generateUUID(),
      orderNumber: 'ORD-260820-001',
      status: 'PAID',
      items: [
        {
          productId: 'prod-kopsus-aren',
          name: 'Kopi Susu Gula Aren (Large)',
          price: 23000,
          qty: 2,
          subtotal: 46000,
          modifiersDescription: 'Less ice',
        },
        {
          productId: 'prod-croissant',
          name: 'Butter Croissant Almond',
          price: 22000,
          qty: 1,
          subtotal: 22000,
        },
      ],
      subtotal: 68000,
      discount: 0,
      totalAmount: 74800,
      paymentMethod: 'QRIS',
      amountPaid: 74800,
      changeDue: 0,
      cashierName: 'Budi Pratama',
      outletId: hqOutletId,
      customerName: 'Dewi Lestari',
      tableNumber: 'Meja 01',
      createdAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
      updatedAt: now - 2 * 60 * 60 * 1000,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      orderNumber: 'ORD-260820-002',
      status: 'PAID',
      items: [
        {
          productId: 'prod-nasgor-spesial',
          name: 'Nasi Goreng Spesial + Telur',
          price: 28000,
          qty: 2,
          subtotal: 56000,
          modifiersDescription: 'Pedas sedang',
        },
        {
          productId: 'prod-earl-grey-tea',
          name: 'Es Teh Melati Jasmine Segar',
          price: 8000,
          qty: 2,
          subtotal: 16000,
        },
      ],
      subtotal: 72000,
      discount: 5000,
      totalAmount: 74200,
      paymentMethod: 'CASH',
      amountPaid: 100000,
      changeDue: 25800,
      cashierName: 'Andi Saputra',
      outletId: hqOutletId,
      customerName: 'Rian Hidayat',
      tableNumber: 'Meja 02',
      createdAt: now - 4 * 60 * 60 * 1000, // 4 hours ago
      updatedAt: now - 4 * 60 * 60 * 1000,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      orderNumber: 'ORD-260820-003',
      status: 'PAID',
      items: [
        {
          productId: 'prod-paket-kenyang',
          name: 'Paket Hemat (Nasi Goreng + Es Teh)',
          price: 32000,
          qty: 1,
          subtotal: 32000,
        },
        {
          productId: 'prod-french-fries',
          name: 'French Fries Cheese & Herbs',
          price: 19000,
          qty: 1,
          subtotal: 19000,
        },
      ],
      subtotal: 51000,
      discount: 0,
      totalAmount: 56100,
      paymentMethod: 'TRANSFER',
      amountPaid: 56100,
      changeDue: 0,
      cashierName: 'Andi Saputra',
      outletId: hqOutletId,
      tableNumber: 'Take Away',
      createdAt: now - 5 * 60 * 60 * 1000,
      updatedAt: now - 5 * 60 * 60 * 1000,
      deletedAt: null,
    },
    {
      id: generateUUID(),
      orderNumber: 'ORD-260820-004',
      status: 'PAID',
      items: [
        {
          productId: 'prod-matcha-latte',
          name: 'Matcha Green Tea Latte',
          price: 22000,
          qty: 1,
          subtotal: 22000,
        },
        {
          productId: 'prod-toast-cokelat',
          name: 'Roti Toast Cokelat Keju Melt',
          price: 18000,
          qty: 1,
          subtotal: 18000,
        },
      ],
      subtotal: 40000,
      discount: 0,
      totalAmount: 44000,
      paymentMethod: 'QRIS',
      amountPaid: 44000,
      changeDue: 0,
      cashierName: 'Budi Pratama',
      outletId: hqOutletId,
      customerName: 'Maya Anggraini',
      tableNumber: 'Meja 03',
      createdAt: now - 6 * 60 * 60 * 1000,
      updatedAt: now - 6 * 60 * 60 * 1000,
      deletedAt: null,
    },
    // Yesterday Orders
    {
      id: generateUUID(),
      orderNumber: 'ORD-250820-001',
      status: 'PAID',
      items: [
        {
          productId: 'prod-ayam-bakar',
          name: 'Ayam Bakar Madu Komplit',
          price: 32000,
          qty: 3,
          subtotal: 96000,
        },
        {
          productId: 'prod-kopsus-aren',
          name: 'Kopi Susu Gula Aren',
          price: 18000,
          qty: 3,
          subtotal: 54000,
        },
      ],
      subtotal: 150000,
      discount: 15000,
      totalAmount: 150000,
      paymentMethod: 'QRIS',
      amountPaid: 150000,
      changeDue: 0,
      cashierName: 'Budi Pratama',
      outletId: hqOutletId,
      customerName: 'Dewi Lestari',
      tableNumber: 'VIP 01',
      createdAt: now - (1 * dayMs + 3 * 60 * 60 * 1000),
      updatedAt: now - (1 * dayMs + 3 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateUUID(),
      orderNumber: 'ORD-250820-002',
      status: 'PAID',
      items: [
        {
          productId: 'prod-miegor-seafood',
          name: 'Mie Goreng Seafood Spesial',
          price: 29000,
          qty: 2,
          subtotal: 58000,
        },
        {
          productId: 'prod-iced-americano',
          name: 'Iced Americano (Double Shot)',
          price: 16000,
          qty: 2,
          subtotal: 32000,
        },
      ],
      subtotal: 90000,
      discount: 0,
      totalAmount: 99000,
      paymentMethod: 'CASH',
      amountPaid: 100000,
      changeDue: 1000,
      cashierName: 'Andi Saputra',
      outletId: hqOutletId,
      customerName: 'Agus Setiawan',
      tableNumber: 'Meja 05',
      createdAt: now - (1 * dayMs + 5 * 60 * 60 * 1000),
      updatedAt: now - (1 * dayMs + 5 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateUUID(),
      orderNumber: 'ORD-250820-003',
      status: 'PAID',
      items: [
        {
          productId: 'prod-caramel-macchiato',
          name: 'Caramel Macchiato Creamy',
          price: 25000,
          qty: 2,
          subtotal: 50000,
        },
        {
          productId: 'prod-croissant',
          name: 'Butter Croissant Almond',
          price: 22000,
          qty: 2,
          subtotal: 44000,
        },
      ],
      subtotal: 94000,
      discount: 0,
      totalAmount: 103400,
      paymentMethod: 'TRANSFER',
      amountPaid: 103400,
      changeDue: 0,
      cashierName: 'Siti Rahmawati',
      outletId: branchOutletId,
      tableNumber: 'Meja 01',
      createdAt: now - (1 * dayMs + 6 * 60 * 60 * 1000),
      updatedAt: now - (1 * dayMs + 6 * 60 * 60 * 1000),
      deletedAt: null,
    },
    // 2 Days Ago Orders
    {
      id: generateUUID(),
      orderNumber: 'ORD-240820-001',
      status: 'PAID',
      items: [
        {
          productId: 'prod-nasgor-spesial',
          name: 'Nasi Goreng Spesial + Telur',
          price: 28000,
          qty: 4,
          subtotal: 112000,
        },
        {
          productId: 'prod-french-fries',
          name: 'French Fries Cheese & Herbs',
          price: 19000,
          qty: 2,
          subtotal: 38000,
        },
        {
          productId: 'prod-earl-grey-tea',
          name: 'Es Teh Melati Jasmine Segar',
          price: 8000,
          qty: 4,
          subtotal: 32000,
        },
      ],
      subtotal: 182000,
      discount: 18200,
      totalAmount: 182000,
      paymentMethod: 'QRIS',
      amountPaid: 182000,
      changeDue: 0,
      cashierName: 'Budi Pratama',
      outletId: hqOutletId,
      customerName: 'Maya Anggraini',
      tableNumber: 'Meja 04',
      createdAt: now - (2 * dayMs + 4 * 60 * 60 * 1000),
      updatedAt: now - (2 * dayMs + 4 * 60 * 60 * 1000),
      deletedAt: null,
    },
  ];

  // 16. Stock Adjustment Audit
  const stockAdjustments: StockAdjustment[] = [
    {
      id: generateUUID(),
      adjustmentNumber: 'ADJ-2026-08-01',
      adjustedBy: 'Budi Pratama',
      notes: 'Stok Opname Awal Bulan Agustus 2026',
      items: [
        {
          productId: 'prod-kopsus-aren',
          productName: 'Kopi Susu Gula Aren',
          previousStock: 90,
          adjustedStock: 85,
          difference: -5,
          reason: 'PHYSICAL_COUNT',
        },
        {
          productId: 'prod-iced-americano',
          productName: 'Iced Americano (Double Shot)',
          previousStock: 100,
          adjustedStock: 95,
          difference: -5,
          reason: 'PHYSICAL_COUNT',
        },
      ],
      createdAt: now - 5 * dayMs,
      updatedAt: now - 5 * dayMs,
      deletedAt: null,
    },
  ];

  // Persist all demo data atomically into IndexedDB
  await db.transaction(
    'rw',
    [
      db.settings,
      db.outlets,
      db.staff,
      db.masterCategories,
      db.masterUoms,
      db.masterVariantAttributes,
      db.masterModifierGroups,
      db.masterDiscounts,
      db.masterTaxes,
      db.products,
      db.restaurantTables,
      db.customers,
      db.suppliers,
      db.expenses,
      db.orders,
      db.stockAdjustments,
    ],
    async () => {
      await db.settings.put(demoSettings);
      await db.outlets.bulkPut(outlets);
      await db.staff.bulkPut(staffList);
      await db.masterCategories.bulkPut(masterCategories);
      await db.masterUoms.bulkPut(masterUoms);
      await db.masterVariantAttributes.bulkPut(masterVariantAttributes);
      await db.masterModifierGroups.bulkPut(masterModifierGroups);
      await db.masterDiscounts.bulkPut(masterDiscounts);
      await db.masterTaxes.bulkPut(masterTaxes);
      await db.products.bulkPut(products);
      await db.restaurantTables.bulkPut(restaurantTables);
      await db.customers.bulkPut(customers);
      await db.suppliers.bulkPut(suppliers);
      await db.expenses.bulkPut(expenses);
      await db.orders.bulkPut(orders);
      await db.stockAdjustments.bulkPut(stockAdjustments);
    }
  );
}
