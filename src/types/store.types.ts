import type { CurrencyCode } from '@/types/currency.types';
import type { CloudBackupConfig } from '@/types/cloud-backup.types';

export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER';

export type AppMode = 'SIMPLE' | 'ADVANCED';

export type AppPermission =
  | 'MANAGE_PRODUCTS'
  | 'VIEW_REVENUE_REPORTS'
  | 'MANAGE_STORE_SETTINGS'
  | 'MANAGE_PEERS'
  | 'EXPORT_DATABASE'
  | 'RESET_STORE';

export interface ReceiptSettings {
  paperWidth: '58mm' | '80mm'; // Thermal Paper Width
  fontFamily: 'monospace' | 'sans-serif' | 'serif'; // Typography
  fontSize: 'small' | 'normal' | 'large'; // Font sizing
  headerTitle?: string; // Custom Header Title (Defaults to storeName)
  headerSubtitle?: string; // Tagline / Slogan
  storeAddress?: string; // Store Address
  storePhone?: string; // Phone / WhatsApp
  showLogo?: boolean; // Show store logo in receipt header
  logoUrl?: string; // Store logo base64
  showCashierName?: boolean; // Show Cashier name
  showOrderNumber?: boolean; // Show Order Number
  showQueueNumber?: boolean; // Show Large Queue Number (F&B / QSR)
  showBarcodeQr?: boolean; // Show QR/Barcode on receipt
  showSku?: boolean; // Show SKU per item
  showModifiers?: boolean; // Show modifier options per item
  showPaymentDetails?: boolean; // Show Payment Method, Cash Given, Change Due
  showCustomerName?: boolean; // Show Customer Name / Table Number
  showTaxService?: boolean; // Show Tax & Service breakdown
  taxRatePercent?: number; // e.g. 10 or 11 (%)
  serviceRatePercent?: number; // e.g. 5 (%)
  footerMessage?: string; // Thank you message
  footerSocialMedia?: string; // Social media / IG / Web
  footerPolicy?: string; // Return policy / Terms
}

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  paperWidth: '58mm',
  fontFamily: 'monospace',
  fontSize: 'normal',
  headerTitle: '',
  headerSubtitle: 'Smart, Fast & Trustworthy POS',
  storeAddress: '',
  storePhone: '',
  showLogo: false,
  showCashierName: true,
  showOrderNumber: true,
  showQueueNumber: true,
  showBarcodeQr: true,
  showSku: false,
  showModifiers: true,
  showPaymentDetails: true,
  showCustomerName: true,
  showTaxService: false,
  taxRatePercent: 11,
  serviceRatePercent: 5,
  footerMessage: 'Terima kasih atas kunjungan Anda!',
  footerSocialMedia: 'Follow us on Instagram @tookooid',
  footerPolicy: 'Barang yang sudah dibeli tidak dapat ditukar.',
};

export interface Outlet {
  id: string; // UUID v4
  storeId: string;
  name: string; // e.g. "Cabang Utama (HQ)", "Cabang Sudirman"
  address?: string;
  phone?: string;
  isHQ: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Staff {
  id: string; // UUID v4
  storeId: string;
  name: string; // e.g. "Budi Santoso"
  role: UserRole; // 'OWNER' | 'MANAGER' | 'CASHIER'
  pin?: string; // 4-6 digit quick PIN
  hasAllOutlets: boolean; // true for Owner / Area Manager
  outletIds: string[]; // Array of valid outlet UUIDs
  phone?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export function hasOutletAccess(staff: Staff, outletId: string): boolean {
  return staff.hasAllOutlets || staff.role === 'OWNER' || staff.outletIds.includes(outletId);
}

export interface StoreSettings {
  id: string; // UUID v4 (Store ID)
  storeName: string;
  currency?: CurrencyCode; // e.g. 'IDR', 'USD', 'SGD', 'MYR', 'EUR', 'JPY', 'GBP'
  deviceName?: string; // e.g. "Kasir Utama (Tablet)", "HP Kasir 2"
  storeAddress?: string;
  receiptFooter?: string;
  defaultCashier?: string;
  ownerPin?: string; // 4-6 digit security PIN for owner operations
  activeRole?: UserRole; // Current role of this terminal ('OWNER' | 'MANAGER' | 'CASHIER')
  activeOutletId?: string; // Currently active outlet on this terminal
  activeStaffId?: string; // Currently logged-in active staff on this terminal
  blacklistedDeviceIds?: string[]; // List of blocked device IDs
  whitelistedDeviceIds?: string[]; // List of explicitly trusted device IDs
  whitelistOnly?: boolean; // When true, only whitelisted devices are allowed to sync
  soundEnabled?: boolean;
  autoPrint?: boolean;
  appMode?: AppMode; // 'SIMPLE' (Lite/Warung mode) or 'ADVANCED' (Pro/Restaurant/Retail mode)
  customZones?: string[]; // Custom table areas / zones created by user
  isSetupComplete?: boolean; // Whether the initial welcome onboarding wizard has been completed
  receiptSettings?: ReceiptSettings; // Dedicated detailed receipt & printing configuration
  cloudBackupConfig?: CloudBackupConfig; // Google Drive, Telegram, Discord, and auto-backup schedules
  passphrase: string; // 12 random words (BIP-39 mnemonic)
  storeSecretKey: string; // P2P encryption secret key
  createdAt: number; // Timestamp ms
  updatedAt: number; // Timestamp ms
  deletedAt: number | null;
}
