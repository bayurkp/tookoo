import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
import {
  type StoreTable,
  type TableStatus,
  type TableShape,
} from '@/types/table.types';

interface TableEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableToEdit?: StoreTable | null;
  onSave: (table: Partial<StoreTable> & { name: string }, targetZone: string) => Promise<void>;
  zones: string[];
}

export const TableEditDialog: React.FC<TableEditDialogProps> = ({
  open,
  onOpenChange,
  tableToEdit,
  onSave,
  zones,
}) => {
  const [name, setName] = useState('');
  const [zone, setZone] = useState(zones[0] || 'Area Utama');
  const [isCustomZone, setIsCustomZone] = useState(false);
  const [customZoneInput, setCustomZoneInput] = useState('');
  const [capacity, setCapacity] = useState<number>(4);
  const [shape, setShape] = useState<TableShape>('RECTANGLE');
  const [status, setStatus] = useState<TableStatus>('AVAILABLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (tableToEdit) {
        setName(tableToEdit.name);
        setZone(tableToEdit.zone);
        setIsCustomZone(false);
        setCustomZoneInput('');
        setCapacity(tableToEdit.capacity);
        setShape(tableToEdit.shape);
        setStatus(tableToEdit.status);
      } else {
        setName('');
        setZone(zones[0] || 'Area Utama');
        setIsCustomZone(false);
        setCustomZoneInput('');
        setCapacity(4);
        setShape('RECTANGLE');
        setStatus('AVAILABLE');
      }
    }
  }, [open, tableToEdit, zones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetZone = isCustomZone ? customZoneInput.trim() || 'Area Utama' : zone;
    if (!targetZone) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          id: tableToEdit?.id,
          name: name.trim(),
          zone: targetZone,
          capacity: Math.max(1, capacity || 1),
          shape,
          status,
          x: tableToEdit?.x ?? 40,
          y: tableToEdit?.y ?? 40,
          width: tableToEdit?.width ?? (shape === 'SQUARE' ? 80 : 100),
          height: tableToEdit?.height ?? 80,
        },
        targetZone
      );
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save table:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[85vh] max-h-[520px] min-h-[400px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
          <DialogTitle className="text-base font-bold">
            {tableToEdit ? 'Edit Meja' : 'Tambah Meja Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Atur nomor/nama meja, kapasitas kursi, dan area penempatan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
            <Field>
              <FieldLabel className="text-xs font-bold">Nama / Nomor Meja *</FieldLabel>
              <Input
                placeholder="Contoh: Meja 01, VIP 2, Bar 04"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 text-xs font-semibold"
                autoFocus
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel className="text-xs font-bold">Area / Ruangan Penempatan *</FieldLabel>
                <button
                  type="button"
                  onClick={() => setIsCustomZone(!isCustomZone)}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  {isCustomZone ? 'Pilih dari daftar area' : '+ Buat area baru'}
                </button>
              </div>

              {isCustomZone ? (
                <Input
                  placeholder="Ketik nama area baru (misal: Lantai 2 / VIP Rooftop)"
                  value={customZoneInput}
                  onChange={(e) => setCustomZoneInput(e.target.value)}
                  className="h-9 text-xs font-semibold"
                  autoFocus
                  required
                />
              ) : (
                <Select value={zone} onValueChange={(val) => setZone(val)}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {zones.map((z) => (
                        <SelectItem key={z} value={z}>
                          {z}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs font-bold">Kapasitas Kursi</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                  className="h-9 text-xs font-bold"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Bentuk Meja</FieldLabel>
                <Select value={shape} onValueChange={(val) => setShape(val as TableShape)}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Bentuk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="RECTANGLE">Persegi Panjang</SelectItem>
                      <SelectItem value="SQUARE">Persegi (Kotak)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel className="text-xs font-bold">Status Meja</FieldLabel>
              <Select value={status} onValueChange={(val) => setStatus(val as TableStatus)}>
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="AVAILABLE">Kosong (Tersedia)</SelectItem>
                    <SelectItem value="OCCUPIED">Terisi / Ada Pesanan Aktif</SelectItem>
                    <SelectItem value="RESERVED">Booking / Reservasi</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              disabled={!name.trim() || isSubmitting || (isCustomZone && !customZoneInput.trim())}
              className="font-bold gap-1.5 cursor-pointer text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{tableToEdit ? 'Simpan Perubahan' : 'Tambah Meja'}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TableEditDialog;
