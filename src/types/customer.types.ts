export type CustomerTier = 'REGULAR' | 'VIP' | 'MEMBER_DISCOUNT';

export interface Customer {
  id: string; // UUID v4
  name: string; // Nama Lengkap Pelanggan
  phone: string; // No. Telepon / WhatsApp
  email?: string;
  tier: CustomerTier;
  discountPercentage?: number; // Otomatis diskon % saat kasir transaksi (misal: 10 untuk 10%)
  points?: number; // Poin loyalitas belanja
  totalSpent?: number; // Total akumulasi belanja (Rp)
  totalOrders?: number; // Total transaksi belanja
  address?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export const CUSTOMER_TIER_META: Record<
  CustomerTier,
  { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'outline' }
> = {
  REGULAR: {
    label: 'Pelanggan Reguler',
    color: 'text-slate-600 dark:text-slate-400',
    badgeVariant: 'secondary',
  },
  VIP: {
    label: 'Member VIP (Prioritas)',
    color: 'text-amber-600 dark:text-amber-400',
    badgeVariant: 'default',
  },
  MEMBER_DISCOUNT: {
    label: 'Member Diskon Khusus',
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeVariant: 'outline',
  },
};
