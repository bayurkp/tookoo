import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Check } from 'lucide-react';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import type { Outlet } from '@/types/store.types';

interface OutletFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletToEdit: Outlet | null;
  onSave: (data: Partial<Outlet> & { name: string }) => Promise<void>;
}

export const OutletFormDialog: React.FC<OutletFormDialogProps> = ({
  open,
  onOpenChange,
  outletToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isHQ, setIsHQ] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (outletToEdit) {
      setName(outletToEdit.name);
      setAddress(outletToEdit.address || '');
      setPhone(outletToEdit.phone || '');
      setIsHQ(outletToEdit.isHQ);
    } else {
      setName('');
      setAddress('');
      setPhone('');
      setIsHQ(false);
    }
  }, [outletToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: outletToEdit?.id,
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        isHQ,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Building2 className="h-5 w-5 text-primary" />
              <span>{outletToEdit ? 'Edit Cabang / Outlet' : 'Tambah Cabang Baru'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kelola data cabang outlet tokomu untuk pembukuan dan operasional kasir.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3.5">
            {/* Nama Cabang */}
            <Field>
              <FieldLabel htmlFor="outlet-name" className="text-xs font-bold">
                Nama Cabang / Outlet <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="outlet-name"
                placeholder="Contoh: Cabang Sudirman, Outlet Bali"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 text-xs"
                autoFocus
              />
            </Field>

            {/* Alamat Cabang */}
            <Field>
              <FieldLabel htmlFor="outlet-address" className="text-xs font-bold flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Alamat Cabang</span>
              </FieldLabel>
              <Input
                id="outlet-address"
                placeholder="Jl. Jendral Sudirman No. 12, Jakarta"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>

            {/* Nomor Telepon / WhatsApp */}
            <Field>
              <FieldLabel htmlFor="outlet-phone" className="text-xs font-bold flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>No. Telepon / WhatsApp</span>
              </FieldLabel>
              <Input
                id="outlet-phone"
                placeholder="0812-3456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>

            {/* Flag Cabang Utama (HQ) */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/40 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-foreground">Jadikan Cabang Utama (HQ / Pusat)</p>
                <p className="text-[11px] text-muted-foreground">
                  Pusat operasional utama bisnis tokomu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHQ(!isHQ)}
                className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                  isHQ ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    isHQ ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="text-xs font-bold gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Cabang'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
