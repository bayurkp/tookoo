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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpsertCustomer } from '@/features/customers/hooks/use-customers';
import type { Customer, CustomerTier } from '@/types/customer.types';
import { User, Phone, Mail, MapPin, Tag, FileText, Percent, Award } from 'lucide-react';

const customerFormSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  phone: z.string().min(6, 'Nomor telepon/WhatsApp minimal 6 digit'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  tier: z.enum(['REGULAR', 'VIP', 'MEMBER_DISCOUNT']),
  discountPercentage: z.number().min(0).max(100),
  points: z.number().int().min(0),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormInput = z.infer<typeof customerFormSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: Customer | null;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  open,
  onOpenChange,
  customerToEdit,
}) => {
  const upsertMutation = useUpsertCustomer();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      tier: 'REGULAR',
      discountPercentage: 0,
      points: 0,
      address: '',
      notes: '',
    },
  });

  const selectedTier = watch('tier');

  useEffect(() => {
    if (open) {
      if (customerToEdit) {
        reset({
          name: customerToEdit.name,
          phone: customerToEdit.phone,
          email: customerToEdit.email || '',
          tier: customerToEdit.tier || 'REGULAR',
          discountPercentage: customerToEdit.discountPercentage || 0,
          points: customerToEdit.points || 0,
          address: customerToEdit.address || '',
          notes: customerToEdit.notes || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          tier: 'REGULAR',
          discountPercentage: 0,
          points: 0,
          address: '',
          notes: '',
        });
      }
    }
  }, [open, customerToEdit, reset]);

  const onSubmit = async (data: CustomerFormInput) => {
    try {
      await upsertMutation.mutateAsync({
        id: customerToEdit?.id,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        tier: data.tier as CustomerTier,
        discountPercentage: Number(data.discountPercentage) || 0,
        points: Number(data.points) || 0,
        address: data.address?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save customer:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>{customerToEdit ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}</span>
          </DialogTitle>
          <DialogDescription>
            Simpan data kontak pelanggan, member loyalitas, dan diskon otomatis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nama & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="customer-name" className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Lengkap *</span>
              </FieldLabel>
              <Input
                id="customer-name"
                placeholder="misal: Budi Santoso"
                {...register('name')}
                aria-invalid={Boolean(errors.name)}
                className={errors.name ? 'border-destructive' : ''}
              />
              <FieldError errors={[{ message: errors.name?.message }]} />
            </Field>

            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor="customer-phone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>No. WhatsApp / HP *</span>
              </FieldLabel>
              <Input
                id="customer-phone"
                placeholder="misal: 081234567890"
                {...register('phone')}
                aria-invalid={Boolean(errors.phone)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              <FieldError errors={[{ message: errors.phone?.message }]} />
            </Field>
          </div>

          {/* Email */}
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="customer-email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Email (Opsional)</span>
            </FieldLabel>
            <Input id="customer-email" type="email" placeholder="misal: budi@gmail.com" {...register('email')} />
            <FieldError errors={[{ message: errors.email?.message }]} />
          </Field>

          {/* Kategori Member & Diskon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
            <Field>
              <FieldLabel htmlFor="customer-tier" className="text-xs font-semibold flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Tipe / Tier Member</span>
              </FieldLabel>
              <Select
                value={selectedTier}
                onValueChange={(val: CustomerTier) => setValue('tier', val)}
              >
                <SelectTrigger id="customer-tier" className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Tier Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Pelanggan Reguler</SelectItem>
                  <SelectItem value="VIP">Member VIP</SelectItem>
                  <SelectItem value="MEMBER_DISCOUNT">Member Diskon Khusus</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="customer-discount" className="text-xs font-semibold flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Diskon Otomatis (%)</span>
              </FieldLabel>
              <Input
                id="customer-discount"
                type="number"
                min={0}
                max={100}
                placeholder="misal: 10"
                {...register('discountPercentage', { valueAsNumber: true })}
                className="h-9 text-xs"
              />
            </Field>
          </div>

          {/* Poin Loyalitas Awal */}
          <Field>
            <FieldLabel htmlFor="customer-points" className="text-xs font-semibold flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>Poin Loyalitas Belanja</span>
            </FieldLabel>
            <Input
              id="customer-points"
              type="number"
              min={0}
              placeholder="0"
              {...register('points', { valueAsNumber: true })}
              className="h-9 text-xs"
            />
          </Field>

          {/* Alamat & Catatan */}
          <Field>
            <FieldLabel htmlFor="customer-address" className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Alamat Rumah / Kantor (Opsional)</span>
            </FieldLabel>
            <Input id="customer-address" placeholder="misal: Jl. Mawar No. 12, Kebayoran Baru" {...register('address')} className="h-9 text-xs" />
          </Field>

          <Field>
            <FieldLabel htmlFor="customer-notes" className="text-xs font-semibold flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Catatan Khusus (Preferensi / Alergi / dll)</span>
            </FieldLabel>
            <Input
              id="customer-notes"
              placeholder="misal: Suka kopi less sweet, alergi susu sapi"
              {...register('notes')}
              className="h-9 text-xs"
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || upsertMutation.isPending}>
              {customerToEdit ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
