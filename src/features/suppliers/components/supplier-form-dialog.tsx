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
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
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
        id: supplierToEdit ? supplierToEdit.id : undefined,
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
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="supplier-name" className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Vendor / Pemasok *</span>
              </FieldLabel>
              <Input
                id="supplier-name"
                placeholder="misal: PT Sumber Kopi Nusantara"
                {...register('name')}
                aria-invalid={Boolean(errors.name)}
                className={errors.name ? 'border-destructive' : ''}
              />
              <FieldError errors={[{ message: errors.name?.message }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="supplier-contact-person" className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Kontak / Sales (PIC)</span>
              </FieldLabel>
              <Input id="supplier-contact-person" placeholder="misal: Hendra (Sales)" {...register('contactPerson')} className="h-9 text-xs" />
            </Field>
          </div>

          {/* No WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor="supplier-phone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>No. WhatsApp / HP *</span>
              </FieldLabel>
              <Input
                id="supplier-phone"
                placeholder="misal: 081398765432"
                {...register('phone')}
                aria-invalid={Boolean(errors.phone)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              <FieldError errors={[{ message: errors.phone?.message }]} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="supplier-email" className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Email Vendor (Opsional)</span>
              </FieldLabel>
              <Input
                id="supplier-email"
                type="email"
                placeholder="misal: sales@sumberkopi.com"
                {...register('email')}
                className="h-9 text-xs"
              />
              <FieldError errors={[{ message: errors.email?.message }]} />
            </Field>
          </div>

          {/* Barang Suplai & Termin Pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
            <Field>
              <FieldLabel htmlFor="supplier-items" className="text-xs font-semibold flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Barang yang Disuplai</span>
              </FieldLabel>
              <Input id="supplier-items" placeholder="misal: Biji Kopi, Sirup, Cup" {...register('suppliedItems')} className="h-9 text-xs" />
            </Field>

            <Field>
              <FieldLabel htmlFor="supplier-terms" className="text-xs font-semibold flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Termin Pembayaran</span>
              </FieldLabel>
              <Input id="supplier-terms" placeholder="misal: COD Tunai / Tempo 14 Hari" {...register('paymentTerms')} className="h-9 text-xs" />
            </Field>
          </div>

          {/* Alamat Gudang / Kantor */}
          <Field>
            <FieldLabel htmlFor="supplier-address" className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Alamat Kantor / Gudang Vendor</span>
            </FieldLabel>
            <Input
              id="supplier-address"
              placeholder="misal: Kawasan Industri Pulo Gadung Blok B4"
              {...register('address')}
              className="h-9 text-xs"
            />
          </Field>

          {/* Catatan */}
          <Field>
            <FieldLabel htmlFor="supplier-notes" className="text-xs font-semibold flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Catatan Khusus</span>
            </FieldLabel>
            <Input id="supplier-notes" placeholder="misal: Minimal order 10kg bebas ongkir" {...register('notes')} className="h-9 text-xs" />
          </Field>

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
