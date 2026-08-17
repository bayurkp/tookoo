export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export interface OrderItem {
  productId: string; // UUID Product
  name: string;
  variantName?: string; // e.g. "Large", "Size XL", "Warna Hitam"
  modifiersDescription?: string; // e.g. "+ Ekstra Boba, Less Sugar"
  price: number; // Unit price with variant & modifiers
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string; // UUID v4
  orderNumber: string; // e.g. "TK-20260817-001"
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  cashierName: string;
  createdAt: number; // Timestamp ms
  updatedAt: number; // Timestamp ms
  deletedAt: number | null; // null if active, timestamp if soft deleted
}
