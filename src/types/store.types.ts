export interface StoreSettings {
  id: string;              // UUID v4 (Store ID)
  storeName: string;
  passphrase: string;      // 12 random words (BIP-39 mnemonic)
  storeSecretKey: string;  // P2P encryption secret key
  createdAt: number;       // Timestamp ms
  updatedAt: number;       // Timestamp ms
  deletedAt: number | null;
}
