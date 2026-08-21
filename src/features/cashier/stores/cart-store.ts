import { create } from 'zustand';
import type { CartState, CartDiscount, SelectedModifier } from '../types/cart.types';
import type { Product, ProductVariantOption } from '@/types/product.types';
import type { Customer } from '@/types/customer.types';

const generateCartItemId = (
  productId: string,
  variant?: ProductVariantOption,
  modifiers?: SelectedModifier[]
): string => {
  const variantPart = variant ? variant.id : 'base';
  const modPart =
    modifiers && modifiers.length > 0
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
  const modPrice = modifiers ? modifiers.reduce((acc, mod) => acc + (mod.price || 0), 0) : 0;
  return baseOrVariantPrice + modPrice;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: null,
  customer: null,
  customerName: null,

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

  setCustomer: (customer: Customer | null) => {
    set({ customer, customerName: customer ? customer.name : null });
  },

  setCustomerName: (customerName: string | null) => {
    set({ customer: null, customerName });
  },

  clearCart: () => {
    set({ items: [], discount: null, customer: null, customerName: null });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const { discount, items } = get();
    const subtotal = get().getSubtotal();
    if (!discount || subtotal === 0) return 0;

    // Check minimum purchase amount requirement
    if (discount.minPurchaseAmount && subtotal < discount.minPurchaseAmount) {
      return 0;
    }

    // Determine eligible base total for the discount scope
    let eligibleAmount = subtotal;

    if (discount.scope === 'SPECIFIC_PRODUCT' && discount.targetProductId) {
      eligibleAmount = items
        .filter((item) => item.product.id === discount.targetProductId)
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    } else if (
      discount.scope === 'SPECIFIC_VARIANT' &&
      discount.targetProductId &&
      discount.targetVariantId
    ) {
      eligibleAmount = items
        .filter(
          (item) =>
            item.product.id === discount.targetProductId &&
            item.selectedVariant?.id === discount.targetVariantId
        )
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    }

    if (eligibleAmount <= 0) return 0;

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = Math.round(
        (eligibleAmount * Math.min(Math.max(discount.value, 0), 100)) / 100
      );
      if (discount.maxDiscountAmount && discount.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(discount.value, eligibleAmount);
    }

    return Math.min(discountAmount, subtotal);
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
