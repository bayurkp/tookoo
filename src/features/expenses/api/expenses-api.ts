import { db } from '@/lib/db';
import { generateUUID } from '@/utils/uuid';
import type { Expense } from '@/types/expense.types';

export async function getExpenses(): Promise<Expense[]> {
  const all = await db.expenses.toArray();
  return all.filter((e) => e.deletedAt === null).sort((a, b) => b.date - a.date);
}

export async function upsertExpense(
  expenseData: Partial<Expense> & {
    amount: number;
    description: string;
    category: Expense['category'];
  }
): Promise<Expense> {
  const now = Date.now();
  const id = expenseData.id || generateUUID();

  const entity: Expense = {
    id,
    type: expenseData.type || 'EXPENSE',
    category: expenseData.category,
    customCategory: expenseData.customCategory?.trim(),
    amount: Math.max(0, Number(expenseData.amount) || 0),
    description: expenseData.description.trim(),
    paymentMethod: expenseData.paymentMethod || 'CASH',
    paidTo: expenseData.paidTo?.trim(),
    date: expenseData.date || now,
    receiptImage: expenseData.receiptImage,
    tags: expenseData.tags || [],
    purchaseItems: expenseData.purchaseItems || [],
    createdAt: expenseData.createdAt || now,
    updatedAt: now,
    deletedAt: null,
  };

  // If purchase stock with items, update inventory stock
  if (entity.type === 'PURCHASE_STOCK' && entity.purchaseItems && entity.purchaseItems.length > 0) {
    for (const item of entity.purchaseItems) {
      if (item.productId) {
        const prod = await db.products.get(item.productId);
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) + (item.quantity || 0));
          await db.products.update(item.productId, {
            stock: newStock,
            costPrice: item.unitPrice > 0 ? item.unitPrice : prod.costPrice,
            updatedAt: now,
          });

          // Record stock adjustment log
          await db.stockAdjustments.put({
            id: generateUUID(),
            adjustmentNumber: `ADJ-BUY-${Date.now().toString().slice(-6)}`,
            adjustedBy: 'Kasir / Pembelian Stok',
            notes: `Pembelian stok: ${entity.description} (Ref: ${entity.id.slice(0, 8)})`,
            items: [
              {
                productId: item.productId,
                productName: item.productName,
                previousStock: prod.stock || 0,
                newStock,
                difference: item.quantity,
                reason: 'PURCHASE_RECEIPT',
              },
            ],
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          });
        }
      }
    }
  }

  await db.expenses.put(entity);
  return entity;
}

export async function deleteExpense(id: string): Promise<void> {
  const existing = await db.expenses.get(id);
  if (!existing) return;

  const now = Date.now();
  await db.expenses.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
  });
}
