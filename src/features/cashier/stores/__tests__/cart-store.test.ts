import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cart-store';
import type { Product, ProductVariantOption } from '@/types/product.types';
import type { SelectedModifier } from '../../types/cart.types';

const mockProductA: Product = {
  id: 'prod-a',
  name: 'Kopi Hitam',
  category: 'Minuman',
  price: 15000,
  stock: 10,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

const mockProductB: Product = {
  id: 'prod-b',
  name: 'Donat Cokelat',
  category: 'Makanan',
  price: 10000,
  stock: 5,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

const mockVariantLarge: ProductVariantOption = {
  id: 'var-large',
  name: 'Ukuran Large',
  price: 22000,
  stock: 8,
};

const mockModifierBoba: SelectedModifier = {
  groupId: 'grp-topping',
  groupName: 'Topping',
  optionId: 'opt-boba',
  name: 'Boba',
  price: 3000,
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds items to cart and computes subtotal', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 1);
    store.addItem(mockProductB, 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.getItemCount()).toBe(3);
    expect(state.getSubtotal()).toBe(35000); // 15000 + (10000 * 2)
    expect(state.getTotal()).toBe(35000);
  });

  it('adds items with variants and modifiers and calculates correct subtotal', () => {
    const store = useCartStore.getState();
    // Kopi Hitam Large (22.000) + Boba (3.000) = 25.000 x 2 = 50.000
    store.addItem(mockProductA, 2, mockVariantLarge, [mockModifierBoba]);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].unitPrice).toBe(25000);
    expect(state.items[0].quantity).toBe(2);
    expect(state.getSubtotal()).toBe(50000);
  });

  it('increments quantity when adding same product with same variant and modifier', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 1);
    store.addItem(mockProductA, 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.getSubtotal()).toBe(45000);
  });

  it('does not exceed product stock when adding items', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductB, 10); // stock is 5

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
  });

  it('updates quantity and removes item when quantity is 0', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 2);
    const itemId = useCartStore.getState().items[0].id;
    store.updateQuantity(itemId, 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);

    store.updateQuantity(itemId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes item by itemId', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 1);
    store.addItem(mockProductB, 1);
    const itemAId = useCartStore.getState().items[0].id;
    store.removeItem(itemAId);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.id).toBe(mockProductB.id);
  });

  it('applies percentage discount correctly', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 2); // 30,000
    store.setDiscount({ type: 'PERCENTAGE', value: 10 }); // 10% off

    const state = useCartStore.getState();
    expect(state.getSubtotal()).toBe(30000);
    expect(state.getDiscountAmount()).toBe(3000);
    expect(state.getTotal()).toBe(27000);
  });

  it('applies fixed discount correctly and clamps to subtotal', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 1); // 15,000
    store.setDiscount({ type: 'FIXED', value: 5000 });

    let state = useCartStore.getState();
    expect(state.getDiscountAmount()).toBe(5000);
    expect(state.getTotal()).toBe(10000);

    // Discount larger than subtotal
    store.setDiscount({ type: 'FIXED', value: 20000 });
    state = useCartStore.getState();
    expect(state.getDiscountAmount()).toBe(15000);
    expect(state.getTotal()).toBe(0);
  });

  it('clears cart and resets state', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 2);
    store.setDiscount({ type: 'PERCENTAGE', value: 10 });
    store.clearCart();

    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.discount).toBeNull();
    expect(state.getTotal()).toBe(0);
  });
});
