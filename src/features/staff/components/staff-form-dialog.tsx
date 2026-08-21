import React, { useEffect, useState } from 'react';
import { UserCheck, Shield, KeyRound, Phone, Check, Building2 } from 'lucide-react';
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
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { useOutlets } from '@/features/outlets/hooks/use-outlets';
import type { Staff, UserRole } from '@/types/store.types';

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffToEdit: Staff | null;
  onSave: (data: Partial<Staff> & { name: string }) => Promise<void>;
}

export const StaffFormDialog: React.FC<StaffFormDialogProps> = ({
  open,
  onOpenChange,
  staffToEdit,
  onSave,
}) => {
  const { data: outlets = [] } = useOutlets();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CASHIER');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [hasAllOutlets, setHasAllOutlets] = useState(true);
  const [selectedOutletIds, setSelectedOutletIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name);
      setRole(staffToEdit.role);
      setPin(staffToEdit.pin || '');
      setPhone(staffToEdit.phone || '');
      setHasAllOutlets(staffToEdit.hasAllOutlets);
      setSelectedOutletIds(staffToEdit.outletIds || []);
      setIsActive(staffToEdit.isActive);
    } else {
      setName('');
      setRole('CASHIER');
      setPin('');
      setPhone('');
      setHasAllOutlets(true);
      setSelectedOutletIds([]);
      setIsActive(true);
    }
  }, [staffToEdit, open]);

  const handleToggleOutlet = (outletId: string) => {
    setSelectedOutletIds((prev) =>
      prev.includes(outletId) ? prev.filter((id) => id !== outletId) : [...prev, outletId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: staffToEdit?.id,
        name: name.trim(),
        role,
        pin: pin.trim(),
        phone: phone.trim(),
        hasAllOutlets: role === 'OWNER' ? true : hasAllOutlets,
        outletIds: hasAllOutlets ? [] : selectedOutletIds,
        isActive,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>{staffToEdit ? 'Edit Akun Staf / Kasir' : 'Tambah Staf Kasir Baru'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Daftarkan kasir dan tentukan hak akses penugasan cabang outlet.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3.5">
            {/* Nama Staf */}
            <Field>
              <FieldLabel htmlFor="staff-name" className="text-xs font-bold">
                Nama Staf / Kasir <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="staff-name"
                placeholder="Contoh: Budi Santoso, Siti Rahma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 text-xs"
                autoFocus
              />
            </Field>

            {/* Role / Jabatan */}
            <Field>
              <FieldLabel htmlFor="staff-role" className="text-xs font-bold flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Peran / Hak Akses</span>
              </FieldLabel>
              <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                <SelectTrigger id="staff-role" className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="CASHIER">Kasir (Penjualan)</SelectItem>
                    <SelectItem value="MANAGER">Manajer (Stok & Penjualan)</SelectItem>
                    <SelectItem value="OWNER">Pemilik (Akses Penuh)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* PIN Cepat Kasir */}
            <Field>
              <FieldLabel htmlFor="staff-pin" className="text-xs font-bold flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>PIN Cepat Kasir (4-6 Digit)</span>
              </FieldLabel>
              <Input
                id="staff-pin"
                type="password"
                maxLength={6}
                placeholder="1234 (Opsional)"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="h-9 text-xs font-mono"
              />
              <FieldDescription>
                Digunakan untuk otentikasi cepat saat ganti shift atau login kasir.
              </FieldDescription>
            </Field>

            {/* No Telepon */}
            <Field>
              <FieldLabel htmlFor="staff-phone" className="text-xs font-bold flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nomor WhatsApp / HP</span>
              </FieldLabel>
              <Input
                id="staff-phone"
                placeholder="0812-3456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>

            {/* Penugasan Cabang (Branch Access) */}
            {role !== 'OWNER' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/40 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">Akses ke Seluruh Cabang</p>
                    <p className="text-[10px] text-muted-foreground">
                      Bisa bertugas di semua cabang/outlet
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasAllOutlets(!hasAllOutlets)}
                    className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                      hasAllOutlets ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        hasAllOutlets ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Specific Outlet Checkboxes */}
                {!hasAllOutlets && (
                  <div className="space-y-1.5 p-3 rounded-xl border bg-card text-xs">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>Pilih Cabang Tempat Bertugas:</span>
                    </p>
                    {outlets.map((outlet) => {
                      const isChecked = selectedOutletIds.includes(outlet.id);
                      return (
                        <label
                          key={outlet.id}
                          onClick={() => handleToggleOutlet(outlet.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer text-xs ${
                            isChecked
                              ? 'border-primary/50 bg-primary/5 font-bold text-foreground'
                              : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          <span>{outlet.name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-primary cursor-pointer h-4 w-4"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Staf'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
