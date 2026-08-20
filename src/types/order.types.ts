export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export type OrderStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export interface OrderItem {
  productId: string; // UUID Product
  name: string;
  unit?: string; // e.g. "pcs", "cup", "porsi", "box"
  variantName?: string; // e.g. "Large", "Size XL", "Warna Hitam"
  modifiersDescription?: string; // e.g. "+ Ekstra Boba, Less Sugar"
  price: number; // Unit price with variant & modifiers
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string; // UUID v4
  orderNumber: string; // e.g. "TK-20260817-001"
  status?: OrderStatus; // 'PAID' (default) or 'PENDING' (tunda bayar / open bills)
  customerName?: string; // e.g. "Meja 4 - Pak Budi", "Antrean #12"
  customerId?: string; // UUID Customer if registered member
  customerPhone?: string; // WhatsApp / Phone number
  tableNumber?: string; // e.g. "04"
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  cashierName: string;
  staffId?: string; // UUID Staff who processed this order
  outletId?: string; // UUID Outlet where this order was created
  outletName?: string; // Snapshot of outlet name at transaction time
  createdAt: number; // Timestamp ms
  updatedAt: number; // Timestamp ms
  deletedAt: number | null; // null if active, timestamp if soft deleted
}
