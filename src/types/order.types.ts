export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export interface OrderItem {
  productId: string; // UUID Product
  name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string; // UUID v4
  orderNumber: string; // e.g. "TKD-001"
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  createdAt: number; // Timestamp ms
  updatedAt: number; // Timestamp ms
  deletedAt: number | null; // null if active, timestamp if soft deleted
}
