import type { Product, ProductVariantOption } from '@/types/product.types';

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // Composite unique key: e.g. `${product.id}-${variant?.id || 'base'}-${sortedModifierIds}`
  product: Product;
  selectedVariant?: ProductVariantOption;
  selectedModifiers?: SelectedModifier[];
  unitPrice: number;
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
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariant?: ProductVariantOption,
    selectedModifiers?: SelectedModifier[]
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDiscount: (discount: CartDiscount | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}
