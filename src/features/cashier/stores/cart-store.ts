import { create } from 'zustand';
import type { CartState, CartDiscount } from '../types/cart.types';
import type { Product } from '@/types/product.types';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: null,

  addItem: (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;

    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex > -1) {
        const existingItem = state.items[existingIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);

        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };

        return { items: updatedItems };
      }

      const initialQuantity = Math.min(quantity, product.stock);
      return {
        items: [...state.items, { product, quantity: initialQuantity }],
      };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.product.id !== productId),
        };
      }

      return {
        items: state.items.map((item) => {
          if (item.product.id === productId) {
            const cappedQuantity = Math.min(quantity, item.product.stock);
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
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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
