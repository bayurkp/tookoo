import React, { useState, useEffect } from 'react';
import { Loader2, Receipt, ShoppingBag, Plus, Trash2, Camera, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/db';
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers';
import { ExpenseCategoryIcon } from './expense-category-icon';
import {
  EXPENSE_CATEGORY_META,
  type Expense,
  type ExpenseCategory,
  type ExpenseType,
  type ExpensePaymentMethod,
  type PurchaseItem,
} from '@/types/expense.types';

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseToEdit?: Expense | null;
  initialType?: ExpenseType;
  onSave: (
    expense: Partial<Expense> & {
      amount: number;
      description: string;
      category: ExpenseCategory;
      supplierId?: string;
    }
  ) => Promise<void>;
}

export const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({
  open,
  onOpenChange,
  expenseToEdit,
  initialType = 'EXPENSE',
  onSave,
}) => {
  const { data: suppliers = [] } = useSuppliers();
  const [type, setType] = useState<ExpenseType>(initialType);
  const [category, setCategory] = useState<ExpenseCategory>('OPERASIONAL');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>('CASH');
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);
  const [paidTo, setPaidTo] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products for purchase items autocomplete
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const all = await db.products.toArray();
      return all.filter((p) => p.deletedAt === null);
    },
  });

  useEffect(() => {
    if (open) {
      if (expenseToEdit) {
        setType(expenseToEdit.type);
        setCategory(expenseToEdit.category);
        setAmount(expenseToEdit.amount);
        setDescription(expenseToEdit.description);
        setPaymentMethod(expenseToEdit.paymentMethod);
        setPaidTo(expenseToEdit.paidTo || '');
        setDateStr(new Date(expenseToEdit.date).toISOString().slice(0, 10));
        setReceiptImage(expenseToEdit.receiptImage);
        setPurchaseItems(expenseToEdit.purchaseItems || []);
      } else {
        setType(initialType);
        setCategory(initialType === 'PURCHASE_STOCK' ? 'BAHAN_BAKU' : 'OPERASIONAL');
        setAmount('');
        setDescription('');
        setPaymentMethod('CASH');
        setPaidTo('');
        setDateStr(new Date().toISOString().slice(0, 10));
        setReceiptImage(undefined);
        setPurchaseItems([]);
      }
    }
  }, [open, expenseToEdit, initialType]);

  // Handle Add Item in Purchase Mode
  const handleAddPurchaseItem = () => {
    setPurchaseItems((prev) => [
      ...prev,
      {
        productId: undefined,
        productName: '',
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleUpdatePurchaseItem = (index: number, updates: Partial<PurchaseItem>) => {
    setPurchaseItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], ...updates };
      current.subtotal = (current.quantity || 0) * (current.unitPrice || 0);
      copy[index] = current;

      // Auto update total amount
      const total = copy.reduce((acc, it) => acc + (it.subtotal || 0), 0);
      if (total > 0) {
        setAmount(total);
      }
      return copy;
    });
  };

  const handleSelectProductForItem = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    handleUpdatePurchaseItem(index, {
      productId: product.id,
      productName: product.name,
      unitPrice: product.costPrice || 0,
    });
  };

  const handleRemovePurchaseItem = (index: number) => {
    setPurchaseItems((prev) => {
      const copy = prev.filter((_, i) => i !== index);
      const total = copy.reduce((acc, it) => acc + (it.subtotal || 0), 0);
      if (total > 0) {
        setAmount(total);
      }
      return copy;
    });
  };

  // Image Upload handler (Base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(amount) || 0;
    if (finalAmount <= 0) return;
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const chosenDate = dateStr ? new Date(dateStr).getTime() : Date.now();

      await onSave({
        id: expenseToEdit?.id,
        type,
        category,
        amount: finalAmount,
        description: description.trim(),
        paymentMethod,
        paidTo: paidTo.trim() || undefined,
        supplierId: supplierId || undefined,
        date: chosenDate,
        receiptImage,
        purchaseItems: type === 'PURCHASE_STOCK' ? purchaseItems : undefined,
      });

      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[90vh] max-h-[600px] min-h-[460px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <span>
              {expenseToEdit
                ? 'Edit Catatan Pengeluaran'
                : type === 'PURCHASE_STOCK'
                  ? 'Catat Pembelian Stok / Kulakan'
                  : 'Catat Biaya / Pengeluaran Baru'}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Dokumentasikan pengeluaran kas toko secara rapi untuk pelaporan laba bersih dan arus
            kas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
            {/* Expense Type Switcher */}
            {!expenseToEdit && (
              <Tabs
                value={type}
                onValueChange={(val) => {
                  setType(val as ExpenseType);
                  if (val === 'PURCHASE_STOCK') {
                    setCategory('BAHAN_BAKU');
                  }
                }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 h-9 p-1">
                  <TabsTrigger value="EXPENSE" className="text-xs font-bold gap-1.5">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Biaya Operasional</span>
                  </TabsTrigger>
                  <TabsTrigger value="PURCHASE_STOCK" className="text-xs font-bold gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Kulakan / Beli Stok</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Category & Nominal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs font-bold">Kategori Biaya *</FieldLabel>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ExpenseCategory)}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center gap-2">
                            <ExpenseCategoryIcon
                              category={cat}
                              className="h-3.5 w-3.5 text-primary shrink-0"
                            />
                            <span>{EXPENSE_CATEGORY_META[cat].label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Total Nominal (Rp) *</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  placeholder="Contoh: 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="h-9 text-xs font-bold font-mono"
                  autoFocus={!expenseToEdit}
                />
              </Field>
            </div>

            {/* Description / Keterangan */}
            <Field>
              <FieldLabel className="text-xs font-bold">Deskripsi / Keterangan *</FieldLabel>
              <Input
                placeholder="Contoh: Beli Biji Kopi Arabika 5kg, Bayar Token Listrik PLN"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </Field>

            {/* Purchase Stock Items Section (If Purchase Mode) */}
            {type === 'PURCHASE_STOCK' && (
              <div className="p-3 bg-muted/40 rounded-xl border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      Rincian Barang yang Dibeli
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPurchaseItem}
                    className="h-7 text-[11px] font-semibold gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Barang</span>
                  </Button>
                </div>

                {purchaseItems.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic py-1">
                    Opsional: Tambahkan barang jika ingin otomatis menambah stok produk di sistem.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {purchaseItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-card border text-xs"
                      >
                        {/* Select Product or Name */}
                        <div className="flex-1 min-w-0">
                          {products.length > 0 ? (
                            <Select
                              value={item.productId || ''}
                              onValueChange={(val) => handleSelectProductForItem(idx, val)}
                            >
                              <SelectTrigger className="w-full h-7 text-[11px]">
                                <SelectValue placeholder="Pilih Produk dari Katalog" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name} (Stok saat ini: {p.stock || 0})
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Nama Barang"
                              value={item.productName}
                              onChange={(e) =>
                                handleUpdatePurchaseItem(idx, { productName: e.target.value })
                              }
                              className="h-7 text-[11px]"
                            />
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="w-16">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdatePurchaseItem(idx, {
                                quantity: Number(e.target.value) || 1,
                              })
                            }
                            className="h-7 text-[11px] font-bold text-center"
                            title="Jumlah / Qty"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="w-24">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Harga Beli"
                            value={item.unitPrice || ''}
                            onChange={(e) =>
                              handleUpdatePurchaseItem(idx, {
                                unitPrice: Number(e.target.value) || 0,
                              })
                            }
                            className="h-7 text-[11px] font-mono"
                            title="Harga Beli Satuan"
                          />
                        </div>

                        {/* Remove */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePurchaseItem(idx)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date, Payment Method & Supplier */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field>
                <FieldLabel className="text-xs font-bold">Tanggal Transaksi</FieldLabel>
                <Input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="h-9 text-xs"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Metode Pembayaran</FieldLabel>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as ExpensePaymentMethod)}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="CASH">Kas Tunai Toko</SelectItem>
                      <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                      <SelectItem value="QRIS">QRIS / E-Wallet</SelectItem>
                      <SelectItem value="OTHER">Lainnya</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold flex items-center justify-between">
                  <span>Penerima / Pemasok</span>
                  {suppliers.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({suppliers.length} terdaftar)
                    </span>
                  )}
                </FieldLabel>
                {suppliers.length > 0 ? (
                  <div className="space-y-1.5">
                    <Select
                      value={supplierId || 'MANUAL'}
                      onValueChange={(val) => {
                        if (val === 'MANUAL') {
                          setSupplierId(undefined);
                        } else {
                          const sup = suppliers.find((s) => s.id === val);
                          if (sup) {
                            setSupplierId(sup.id);
                            setPaidTo(sup.name);
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Pilih Pemasok Terdaftar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="MANUAL">-- Input Manual --</SelectItem>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} {s.contactPerson ? `(${s.contactPerson})` : ''}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {(!supplierId || supplierId === 'MANUAL') && (
                      <Input
                        placeholder="Ketik nama penerima/toko manual..."
                        value={paidTo}
                        onChange={(e) => setPaidTo(e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                ) : (
                  <Input
                    placeholder="Contoh: Toko Berkah / PT Sumber Kopi"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="h-9 text-xs"
                  />
                )}
              </Field>
            </div>

            {/* Receipt Photo Upload (Optional) */}
            <Field>
              <FieldLabel className="text-xs font-bold flex items-center justify-between">
                <span>Foto Struk / Nota Pembelian (Opsional)</span>
                {receiptImage && (
                  <button
                    type="button"
                    onClick={() => setReceiptImage(undefined)}
                    className="text-[10px] text-destructive hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </FieldLabel>

              {receiptImage ? (
                <div className="relative rounded-xl border overflow-hidden max-h-36 flex items-center justify-center bg-black/5">
                  <img
                    src={receiptImage}
                    alt="Bukti Nota Struk"
                    className="max-h-36 object-contain"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-card hover:bg-muted/40 cursor-pointer transition-colors text-center space-y-1">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    Upload Foto / Scan Struk
                  </span>
                  <span className="text-[10px] text-muted-foreground">PNG, JPG atau WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </Field>
          </div>

          <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex flex-row justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!amount || !description.trim() || isSubmitting}
              className="font-bold gap-1.5 cursor-pointer text-xs shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{expenseToEdit ? 'Simpan Perubahan' : 'Simpan Catatan Pengeluaran'}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormDialog;
