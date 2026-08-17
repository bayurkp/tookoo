import { create } from 'zustand';
import type {
  CartState,
  CartDiscount,
  SelectedModifier,
} from '../types/cart.types';
import type { Product, ProductVariantOption } from '@/types/product.types';

const generateCartItemId = (
  productId: string,
  variant?: ProductVariantOption,
  modifiers?: SelectedModifier[]
): string => {
  const variantPart = variant ? variant.id : 'base';
  const modPart = modifiers && modifiers.length > 0
    ? modifiers
        .map((m) => m.optionId)
        .sort()
        .join('_')
    : 'none';
  return `${productId}-${variantPart}-${modPart}`;
};

const calculateUnitPrice = (
  product: Product,
  variant?: ProductVariantOption,
  modifiers?: SelectedModifier[]
): number => {
  const baseOrVariantPrice = variant ? variant.price : product.price;
  const modPrice = modifiers
    ? modifiers.reduce((acc, mod) => acc + (mod.price || 0), 0)
    : 0;
  return baseOrVariantPrice + modPrice;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: null,

  addItem: (
    product: Product,
    quantity = 1,
    selectedVariant?: ProductVariantOption,
    selectedModifiers?: SelectedModifier[]
  ) => {
    const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (availableStock <= 0) return;

    const itemId = generateCartItemId(product.id, selectedVariant, selectedModifiers);
    const unitPrice = calculateUnitPrice(product, selectedVariant, selectedModifiers);

    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.id === itemId);

      if (existingIndex > -1) {
        const existingItem = state.items[existingIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, availableStock);

        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };

        return { items: updatedItems };
      }

      const initialQuantity = Math.min(quantity, availableStock);
      return {
        items: [
          ...state.items,
          {
            id: itemId,
            product,
            selectedVariant,
            selectedModifiers,
            unitPrice,
            quantity: initialQuantity,
          },
        ],
      };
    });
  },

  removeItem: (itemId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  updateQuantity: (itemId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.id !== itemId),
        };
      }

      return {
        items: state.items.map((item) => {
          if (item.id === itemId) {
            const availableStock = item.selectedVariant
              ? item.selectedVariant.stock
              : item.product.stock;
            const cappedQuantity = Math.min(quantity, availableStock);
            return { ...item, quantity: cappedQuantity };
          }
          return item;
        }),
      };
    });
  },

  setDiscount: (discount: CartDiscount | null) => {
    set({ discount });
  },

  clearCart: () => {
    set({ items: [], discount: null });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const { discount } = get();
    const subtotal = get().getSubtotal();
    if (!discount || subtotal === 0) return 0;

    if (discount.type === 'PERCENTAGE') {
      return Math.round((subtotal * Math.min(Math.max(discount.value, 0), 100)) / 100);
    }

    return Math.min(discount.value, subtotal);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    return Math.max(0, subtotal - discountAmount);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
