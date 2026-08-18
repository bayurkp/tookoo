import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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
import { generateUUID } from '@/utils/uuid';
import { type StoreTable, type TableShape } from '@/types/table.types';

interface TableBulkGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (newTables: StoreTable[], targetZone: string) => Promise<void>;
  zones: string[];
  existingTables: StoreTable[];
}

export const TableBulkGeneratorDialog: React.FC<TableBulkGeneratorDialogProps> = ({
  open,
  onOpenChange,
  onGenerate,
  zones,
  existingTables,
}) => {
  const [prefix, setPrefix] = useState('Meja');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [count, setCount] = useState<number>(6);
  const [zone, setZone] = useState(zones[0] || 'Area Utama');
  const [isCustomZone, setIsCustomZone] = useState(false);
  const [customZoneInput, setCustomZoneInput] = useState('');
  const [capacity, setCapacity] = useState<number>(4);
  const [shape, setShape] = useState<TableShape>('RECTANGLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default zone when opened
  React.useEffect(() => {
    if (open && zones.length > 0 && !isCustomZone) {
      setZone((prev) => (zones.includes(prev) ? prev : zones[0]));
    }
  }, [open, zones, isCustomZone]);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0) return;

    const targetZone = isCustomZone ? customZoneInput.trim() || 'Area Utama' : zone;
    if (!targetZone) return;

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const generated: StoreTable[] = [];

      // Calculate starting coordinates in this zone
      const tablesInZone = existingTables.filter((t) => t.zone === targetZone);
      let startX = 40;
      let startY = 40;

      if (tablesInZone.length > 0) {
        // Find max Y coordinate of existing tables to place new ones below or offset
        const maxY = Math.max(...tablesInZone.map((t) => t.y + t.height));
        startY = maxY + 40;
      }

      const cols = 4;
      const spacingX = shape === 'SQUARE' ? 120 : 140;
      const spacingY = 120;

      for (let i = 0; i < count; i++) {
        const currentNum = startNumber + i;
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = startX + col * spacingX;
        const y = startY + row * spacingY;

        generated.push({
          id: generateUUID(),
          name: `${prefix.trim()} ${String(currentNum).padStart(2, '0')}`,
          zone: targetZone,
          x,
          y,
          width: shape === 'SQUARE' ? 80 : 100,
          height: 80,
          capacity: Math.max(1, capacity || 4),
          shape,
          status: 'AVAILABLE',
          currentOrderId: null,
          currentCustomerName: null,
          activeOrderTotal: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        });
      }

      await onGenerate(generated, targetZone);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to bulk generate tables:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[85vh] max-h-[540px] min-h-[420px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Buat Meja Berurutan Cepat</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Hasilkan banyak meja sekaligus secara otomatis dan rapi pada denah ruangan.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleGenerateSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs font-bold">Awalan Nama *</FieldLabel>
                <Input
                  placeholder="Contoh: Meja, VIP, Bar"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  required
                  className="h-9 text-xs font-semibold"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Nomor Mulai</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  value={startNumber}
                  onChange={(e) => setStartNumber(Number(e.target.value) || 1)}
                  className="h-9 text-xs font-bold"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs font-bold">Jumlah Meja</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value) || 1)}
                  className="h-9 text-xs font-bold"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold">Kapasitas / Meja</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value) || 4)}
                  className="h-9 text-xs font-bold"
                />
              </Field>
            </div>

            {/* Target Area Selection */}
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

            <Field>
              <FieldLabel className="text-xs font-bold">Bentuk Meja</FieldLabel>
              <Select value={shape} onValueChange={(val) => setShape(val as TableShape)}>
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Bentuk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="RECTANGLE">Persegi Panjang (100x80 px)</SelectItem>
                    <SelectItem value="SQUARE">Persegi / Kotak (80x80 px)</SelectItem>
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
              disabled={isSubmitting || (isCustomZone && !customZoneInput.trim())}
              className="font-bold gap-1.5 cursor-pointer text-xs shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Membuat Meja...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate {count} Meja</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TableBulkGeneratorDialog;
