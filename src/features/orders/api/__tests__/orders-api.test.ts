import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { createOrder, type CreateOrderInput } from '../create-order';
import { getOrders } from '../get-orders';
import { upsertProduct } from '@/features/products/api/upsert-product';

describe('Orders API Layer', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.products.clear();
  });

  it('creates an order and deducts product stocks atomically', async () => {
    const productA = await upsertProduct({
      name: 'Kopi Susu',
      price: 15000,
      stock: 20,
      category: 'Minuman',
    });

    const productB = await upsertProduct({
      name: 'Roti Cokelat',
      price: 10000,
      stock: 15,
      category: 'Makanan',
    });

    const orderInput: CreateOrderInput = {
      items: [
        {
          productId: productA.id,
          name: productA.name,
          price: productA.price,
          qty: 2,
          subtotal: 30000,
        },
        {
          productId: productB.id,
          name: productB.name,
          price: productB.price,
          qty: 3,
          subtotal: 30000,
        },
      ],
      subtotal: 60000,
      discount: 5000,
      totalAmount: 55000,
      paymentMethod: 'CASH',
      amountPaid: 60000,
      changeDue: 5000,
      cashierName: 'Kasir 1',
    };

    const createdOrder = await createOrder(orderInput);

    expect(createdOrder.id).toBeDefined();
    expect(createdOrder.orderNumber).toMatch(/^TK-/);
    expect(createdOrder.totalAmount).toBe(55000);
    expect(createdOrder.changeDue).toBe(5000);

    // Verify stock is decremented in Dexie
    const updatedProductA = await db.products.get(productA.id);
    expect(updatedProductA?.stock).toBe(18); // 20 - 2

    const updatedProductB = await db.products.get(productB.id);
    expect(updatedProductB?.stock).toBe(12); // 15 - 3

    // Verify order is retrievable
    const orders = await getOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(createdOrder.id);
  });

  it('throws error when product stock is insufficient', async () => {
    const product = await upsertProduct({
      name: 'Cake Tart',
      price: 50000,
      stock: 1,
      category: 'Makanan',
    });

    const orderInput: CreateOrderInput = {
      items: [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 5, // exceeds stock of 1
          subtotal: 250000,
        },
      ],
      subtotal: 250000,
      discount: 0,
      totalAmount: 250000,
      paymentMethod: 'CASH',
      amountPaid: 250000,
      changeDue: 0,
      cashierName: 'Kasir 1',
    };

    await expect(createOrder(orderInput)).rejects.toThrow(/Stok tidak mencukupi/i);

    // Verify order was not created
    const orders = await getOrders();
    expect(orders).toHaveLength(0);

    // Verify product stock remains unchanged
    const unadjusted = await db.products.get(product.id);
    expect(unadjusted?.stock).toBe(1);
  });
});
