import type { Product } from '@/types/product.types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface CartDiscount {
  type: DiscountType;
  value: number;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export interface CartState {
  items: CartItem[];
  discount: CartDiscount | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: CartDiscount | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}
