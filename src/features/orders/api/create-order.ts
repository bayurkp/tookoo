import { db } from '@/lib/db';
import { generateUUID } from '@/utils/uuid';
import type { Order, OrderItem, PaymentMethod } from '@/types/order.types';

export interface CreateOrderInput {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  cashierName?: string;
  status?: Order['status'];
  customerName?: string;
  tableNumber?: string;
  notes?: string;
}

export const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TK-${dateStr}-${randomSuffix}`;
};

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const now = Date.now();
  const orderId = generateUUID();
  const orderNumber = generateOrderNumber();

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    status: input.status || 'PAID',
    customerName: input.customerName,
    tableNumber: input.tableNumber,
    notes: input.notes,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    totalAmount: input.totalAmount,
    paymentMethod: input.paymentMethod,
    amountPaid: input.amountPaid,
    changeDue: input.changeDue,
    cashierName: input.cashierName || 'Kasir',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  // Atomic transaction: Check stock, decrement product stock, save order
  await db.transaction('rw', db.orders, db.products, async () => {
    // 1. Validate stocks (only for non-SERVICE products)
    for (const item of input.items) {
      const product = await db.products.get(item.productId);
      if (!product || product.deletedAt !== null) {
        throw new Error(`Produk ${item.name} tidak ditemukan atau telah dihapus`);
      }
      if (product.productType !== 'SERVICE') {
        if (item.variantName && product.variants && product.variants.length > 0) {
          const variant = product.variants.find((v) => v.name === item.variantName);
          if (variant && variant.stock < item.qty) {
            throw new Error(
              `Stok varian "${item.variantName}" tidak mencukupi untuk ${product.name}. Tersedia: ${variant.stock}, Diminta: ${item.qty}`
            );
          }
        } else if (product.stock < item.qty) {
          throw new Error(
            `Stok tidak mencukupi untuk ${item.name}. Tersedia: ${product.stock}, Diminta: ${item.qty}`
          );
        }
      }
    }

    // 2. Decrement stocks (skip for SERVICE products)
    for (const item of input.items) {
      const product = await db.products.get(item.productId);
      if (product && product.productType !== 'SERVICE') {
        let updatedVariants = product.variants;
        if (item.variantName && product.variants && product.variants.length > 0) {
          updatedVariants = product.variants.map((v) => {
            if (v.name === item.variantName) {
              return { ...v, stock: Math.max(0, v.stock - item.qty) };
            }
            return v;
          });
        }
        await db.products.update(item.productId, {
          stock: Math.max(0, product.stock - item.qty),
          variants: updatedVariants,
          updatedAt: now,
        });
      }
    }

    // 3. Save order
    await db.orders.put(newOrder);
  });

  // 4. Asynchronous non-blocking auto-backup check
  setTimeout(() => {
    import('@/features/sync/api/cloud-backup-api')
      .then((m) => m.checkAndTriggerAutoBackup())
      .catch(() => {});
  }, 1000);

  return newOrder;
};
