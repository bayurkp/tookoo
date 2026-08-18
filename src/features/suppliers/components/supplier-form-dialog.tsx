import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Label } from '@/components/ui/label';
import { useUpsertSupplier } from '@/features/suppliers/hooks/use-suppliers';
import type { Supplier } from '@/types/supplier.types';
import { Building2, User, Phone, Mail, MapPin, Package, CreditCard, FileText } from 'lucide-react';

const supplierFormSchema = z.object({
  name: z.string().min(1, 'Nama vendor/supplier wajib diisi'),
  contactPerson: z.string().optional(),
  phone: z.string().min(6, 'Nomor telepon/WhatsApp minimal 6 digit'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
  suppliedItems: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormInput = z.infer<typeof supplierFormSchema>;

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierFormDialog: React.FC<SupplierFormDialogProps> = ({
  open,
  onOpenChange,
  supplierToEdit,
}) => {
  const upsertMutation = useUpsertSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormInput>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      suppliedItems: '',
      paymentTerms: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (supplierToEdit) {
        reset({
          name: supplierToEdit.name,
          contactPerson: supplierToEdit.contactPerson || '',
          phone: supplierToEdit.phone,
          email: supplierToEdit.email || '',
          address: supplierToEdit.address || '',
          suppliedItems: supplierToEdit.suppliedItems || '',
          paymentTerms: supplierToEdit.paymentTerms || '',
          notes: supplierToEdit.notes || '',
        });
      } else {
        reset({
          name: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          suppliedItems: '',
          paymentTerms: '',
          notes: '',
        });
      }
    }
  }, [open, supplierToEdit, reset]);

  const onSubmit = async (data: SupplierFormInput) => {
    try {
      await upsertMutation.mutateAsync({
        id: supplierToEdit?.id,
        name: data.name.trim(),
        contactPerson: data.contactPerson?.trim() || undefined,
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        suppliedItems: data.suppliedItems?.trim() || undefined,
        paymentTerms: data.paymentTerms?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save supplier:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{supplierToEdit ? 'Edit Data Pemasok' : 'Tambah Pemasok Baru'}</span>
          </DialogTitle>
          <DialogDescription>
            Simpan informasi kontak vendor, barang suplai, dan termin pembayaran kulakan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nama Vendor & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Vendor / Pemasok *</span>
              </Label>
              <Input
                placeholder="misal: PT Sumber Kopi Nusantara"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Kontak / Sales (PIC)</span>
              </Label>
              <Input placeholder="misal: Hendra (Sales)" {...register('contactPerson')} />
            </div>
          </div>

          {/* No WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>No. WhatsApp / HP *</span>
              </Label>
              <Input
                placeholder="misal: 081398765432"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-[11px] text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Email Vendor (Opsional)</span>
              </Label>
              <Input
                type="email"
                placeholder="misal: sales@sumberkopi.com"
                {...register('email')}
              />
            </div>
          </div>

          {/* Barang Suplai & Termin Pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Barang yang Disuplai</span>
              </Label>
              <Input placeholder="misal: Biji Kopi, Sirup, Cup" {...register('suppliedItems')} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Termin Pembayaran</span>
              </Label>
              <Input placeholder="misal: COD Tunai / Tempo 14 Hari" {...register('paymentTerms')} />
            </div>
          </div>

          {/* Alamat Gudang / Kantor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Alamat Kantor / Gudang Vendor</span>
            </Label>
            <Input
              placeholder="misal: Kawasan Industri Pulo Gadung Blok B4"
              {...register('address')}
            />
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Catatan Khusus</span>
            </Label>
            <Input placeholder="misal: Minimal order 10kg bebas ongkir" {...register('notes')} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || upsertMutation.isPending}>
              {supplierToEdit ? 'Simpan Perubahan' : 'Tambah Pemasok'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
