import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookmarkPlus, UtensilsCrossed, User, FileText, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { useTables, useUpdateTableStatus } from '@/features/tables/hooks/use-tables';
import { useCartStore } from '../stores/cart-store';
import { useCashierCheckout } from '../hooks/use-cashier-checkout';
import { formatCurrency } from '@/utils/format-currency';
import { sounds } from '@/utils/audio';

interface HoldOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHoldSuccess: (orderNumber: string) => void;
}

const FALLBACK_TABLE_SUGGESTIONS = [
  'Meja 1',
  'Meja 2',
  'Meja 3',
  'Meja 4',
  'Meja 5',
  'Take Away / Bungkus',
  'VIP / Lantai 2',
];

export const HoldOrderDialog: React.FC<HoldOrderDialogProps> = ({
  open,
  onOpenChange,
  onHoldSuccess,
}) => {
  const { t } = useTranslation();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tables = [] } = useTables();
  const updateTableStatusMutation = useUpdateTableStatus();

  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const checkoutMutation = useCashierCheckout();

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();

  const handleSelectTable = (tableId: string, tableName: string) => {
    setSelectedTableId(tableId);
    setTableNumber(tableName);
  };

  const handleHoldOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const orderItems = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        unit: item.product.unit || 'pcs',
        variantName: item.selectedVariant ? item.selectedVariant.name : undefined,
        modifiersDescription:
          item.selectedModifiers && item.selectedModifiers.length > 0
            ? item.selectedModifiers.map((m) => m.name).join(', ')
            : undefined,
        price: item.unitPrice,
        qty: item.quantity,
        subtotal: item.unitPrice * item.quantity,
      }));

      const finalLabel =
        [tableNumber.trim(), customerName.trim()].filter(Boolean).join(' - ') || 'Pesanan Tertunda';

      const savedOrder = await checkoutMutation.mutateAsync({
        items: orderItems,
        subtotal,
        discount: discountAmount,
        totalAmount: total,
        paymentMethod: 'CASH',
        amountPaid: 0,
        changeDue: 0,
        cashierName: 'Kasir',
        status: 'PENDING',
        customerName: finalLabel,
        tableNumber: tableNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // If a layout table was selected, mark it as OCCUPIED in db
      if (selectedTableId) {
        await updateTableStatusMutation.mutateAsync({
          id: selectedTableId,
          status: 'OCCUPIED',
          orderMeta: {
            orderId: savedOrder.id,
            customerName: customerName.trim() || undefined,
            orderTotal: total,
          },
        });
      }

      sounds.playSuccess();
      clearCart();
      setIsSubmitting(false);
      onOpenChange(false);
      onHoldSuccess(savedOrder.orderNumber);

      // Reset form fields
      setCustomerName('');
      setTableNumber('');
      setSelectedTableId(null);
      setNotes('');
    } catch (err) {
      console.error('Failed to hold order:', err);
      setIsSubmitting(false);
    }
  };

  const availableTables = tables.length > 0 ? tables.slice(0, 12) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] h-[85vh] max-h-[620px] min-h-[460px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookmarkPlus className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {t('cashier.holdOrder.title', 'Tunda Bayar / Simpan Pesanan')}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t(
                  'cashier.holdOrder.desc',
                  'Simpan pesanan pelanggan (dine-in / open bill) untuk dibayar nanti.'
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleHoldOrder} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
            {/* Order Summary Preview */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Tagihan Sementara</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {items.length} jenis item
              </span>
            </div>

            {/* Table / Location */}
            <Field>
              <FieldLabel
                htmlFor="table-number"
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                <span>Nomor Meja / Area / Antrean *</span>
              </FieldLabel>
              <Input
                id="table-number"
                value={tableNumber}
                onChange={(e) => {
                  setTableNumber(e.target.value);
                  setSelectedTableId(null);
                }}
                placeholder="Contoh: Meja 04 / Take Away / Antrean 12"
                className="h-9 text-sm"
                required
                autoFocus
              />
            </Field>

            {/* Quick Table Presets / Live Tables */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground">
                {availableTables ? 'Pilih Meja Tersedia:' : 'Pilihan Cepat:'}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {availableTables
                  ? availableTables.map((tbl) => {
                      const isOccupied = tbl.status === 'OCCUPIED';
                      const isSelected = tableNumber === tbl.name;
                      return (
                        <button
                          key={tbl.id}
                          type="button"
                          onClick={() => handleSelectTable(tbl.id, tbl.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : isOccupied
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-card text-foreground border-border hover:bg-muted/80'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOccupied ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span>{tbl.name}</span>
                        </button>
                      );
                    })
                  : FALLBACK_TABLE_SUGGESTIONS.map((tSuggestion) => (
                      <button
                        key={tSuggestion}
                        type="button"
                        onClick={() => setTableNumber(tSuggestion)}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors cursor-pointer"
                      >
                        {tSuggestion}
                      </button>
                    ))}
              </div>
            </div>

            {/* Customer Name */}
            <Field>
              <FieldLabel
                htmlFor="customer-name"
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Nama Pelanggan (Opsional)</span>
              </FieldLabel>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Pak Budi / Kak Sarah"
                className="h-9 text-sm"
              />
            </Field>

            {/* Notes */}
            <Field>
              <FieldLabel
                htmlFor="hold-notes"
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Catatan Tambahan (Opsional)</span>
              </FieldLabel>
              <Input
                id="hold-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Makanan disajikan bertahap..."
                className="h-9 text-sm"
              />
            </Field>
          </div>

          <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !tableNumber.trim()}
              className="gap-1.5 font-bold text-xs"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Buka Antrean Baru'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HoldOrderDialog;
