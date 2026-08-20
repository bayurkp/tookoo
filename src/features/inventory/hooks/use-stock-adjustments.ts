import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { generateUUID } from '@/utils/uuid';
import { p2pEngine } from '@/lib/webrtc';
import type { StockAdjustment, StockAdjustmentItem } from '@/types/stock-adjustment.types';

export const useStockAdjustments = () => {
  return useQuery<StockAdjustment[]>({
    queryKey: ['stockAdjustments'],
    queryFn: async () => {
      const list = await db.stockAdjustments.toArray();
      return list
        .filter((item) => item.deletedAt === null)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
  });
};

export interface CreateStockAdjustmentInput {
  items: StockAdjustmentItem[];
  adjustedBy: string;
  notes?: string;
  outletId?: string;
  outletName?: string;
  staffId?: string;
}

export const useCreateStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation<StockAdjustment, Error, CreateStockAdjustmentInput>({
    mutationFn: async (input) => {
      const now = Date.now();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const adjustmentNumber = `ADJ-${dateStr}-${randomSuffix}`;

      const settings = await db.settings.toCollection().first();
      const resolvedOutletId = input.outletId || settings?.activeOutletId;
      let resolvedOutletName = input.outletName;
      if (!resolvedOutletName && resolvedOutletId) {
        const outlet = await db.outlets.get(resolvedOutletId);
        resolvedOutletName = outlet?.name;
      }
      const resolvedStaffId = input.staffId || settings?.activeStaffId;

      const newAdjustment: StockAdjustment = {
        id: generateUUID(),
        adjustmentNumber,
        items: input.items,
        adjustedBy: input.adjustedBy || 'Pemilik Toko',
        outletId: resolvedOutletId,
        outletName: resolvedOutletName,
        staffId: resolvedStaffId,
        notes: input.notes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      // Atomic Dexie transaction to update product & variant stocks
      await db.transaction('rw', db.stockAdjustments, db.products, async () => {
        for (const item of input.items) {
          const product = await db.products.get(item.productId);
          if (product) {
            let updatedStock = item.adjustedStock;
            let updatedVariants = product.variants;

            if (item.variantId && product.variants && product.variants.length > 0) {
              updatedVariants = product.variants.map((v) => {
                if (v.id === item.variantId) {
                  return { ...v, stock: item.adjustedStock };
                }
                return v;
              });
              // Recalculate total product stock as sum of variants if applicable
              updatedStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
            }

            await db.products.update(item.productId, {
              stock: updatedStock,
              variants: updatedVariants,
              updatedAt: now,
            });
          }
        }

        await db.stockAdjustments.put(newAdjustment);
      });

      return newAdjustment;
    },
    onSuccess: async (adjustment) => {
      queryClient.invalidateQueries({ queryKey: ['stockAdjustments'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Broadcast to connected peers
      const settings = await db.settings.toCollection().first();
      const deviceId = settings?.id || 'host-device';

      p2pEngine.broadcast({
        action: 'UPSERT',
        collection: 'products',
        data: adjustment,
        updatedAt: adjustment.updatedAt,
        deviceId,
      });
    },
  });
};
