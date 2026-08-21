import type { Product, ProductVariantOption } from '@/types/product.types';
import type { DiscountScope } from '@/types/master-data.types';
import type { Customer } from '@/types/customer.types';

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
  id?: string;
  name?: string;
  code?: string;
  type: DiscountType;
  value: number;
  scope?: DiscountScope;
  targetProductId?: string | null;
  targetProductName?: string | null;
  targetVariantId?: string | null;
  targetVariantName?: string | null;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export interface CartState {
  items: CartItem[];
  discount: CartDiscount | null;
  customer: Customer | null;
  customerName: string | null;
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariant?: ProductVariantOption,
    selectedModifiers?: SelectedModifier[]
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDiscount: (discount: CartDiscount | null) => void;
  setCustomer: (customer: Customer | null) => void;
  setCustomerName: (name: string | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}
