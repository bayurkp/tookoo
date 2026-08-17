import type { CurrencyCode } from '@/types/currency.types';

export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER';

export type AppPermission =
  | 'MANAGE_PRODUCTS'
  | 'VIEW_REVENUE_REPORTS'
  | 'MANAGE_STORE_SETTINGS'
  | 'MANAGE_PEERS'
  | 'EXPORT_DATABASE'
  | 'RESET_STORE';

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
  blacklistedDeviceIds?: string[]; // List of blocked device IDs
  whitelistedDeviceIds?: string[]; // List of explicitly trusted device IDs
  whitelistOnly?: boolean; // When true, only whitelisted devices are allowed to sync
  soundEnabled?: boolean;
  autoPrint?: boolean;
  passphrase: string; // 12 random words (BIP-39 mnemonic)
  storeSecretKey: string; // P2P encryption secret key
  createdAt: number; // Timestamp ms
  updatedAt: number; // Timestamp ms
  deletedAt: number | null;
}
