import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Edit2, Check, X, AlertCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { StoreTable } from '@/types/table.types';

interface ZoneManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zones: string[];
  tables: StoreTable[];
  onAddZone: (newZone: string) => Promise<void>;
  onRenameZone: (oldZone: string, newZone: string) => Promise<void>;
  onDeleteZone: (zoneToDelete: string) => Promise<void>;
}

export const ZoneManagerDialog: React.FC<ZoneManagerDialogProps> = ({
  open,
  onOpenChange,
  zones,
  tables,
  onAddZone,
  onRenameZone,
  onDeleteZone,
}) => {
  const [newZoneName, setNewZoneName] = useState('');
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newZoneName.trim();
    if (!trimmed) return;

    if (zones.some((z) => z.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Area "${trimmed}" sudah ada.`);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onAddZone(trimmed);
      setNewZoneName('');
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal menambahkan area.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (zone: string) => {
    setEditingZone(zone);
    setEditedName(zone);
    setErrorMessage(null);
  };

  const handleSaveRename = async (oldZone: string) => {
    const trimmed = editedName.trim();
    if (!trimmed || trimmed === oldZone) {
      setEditingZone(null);
      return;
    }

    if (
      zones.some(
        (z) => z.toLowerCase() === trimmed.toLowerCase() && z.toLowerCase() !== oldZone.toLowerCase()
      )
    ) {
      setErrorMessage(`Nama area "${trimmed}" sudah digunakan.`);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onRenameZone(oldZone, trimmed);
      setEditingZone(null);
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal mengubah nama area.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (zone: string) => {
    const tablesInZone = tables.filter((t) => t.zone === zone);
    if (tablesInZone.length > 0) {
      setErrorMessage(
        `Area "${zone}" masih memiliki ${tablesInZone.length} meja. Pindahkan atau hapus meja terlebih dahulu.`
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onDeleteZone(zone);
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal menghapus area.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[85vh] max-h-[520px] min-h-[400px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b shrink-0 bg-card">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Kelola Area / Ruangan Meja</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Buat, ubah nama, atau hapus area operasional untuk penataan denah meja tokomu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
          {/* Add New Zone Form */}
          <form onSubmit={handleAdd} className="flex items-center gap-2">
            <Input
              placeholder="Contoh: Lantai 2, VIP Room, Teras Depan"
              value={newZoneName}
              onChange={(e) => {
                setNewZoneName(e.target.value);
                setErrorMessage(null);
              }}
              className="h-9 text-xs flex-1"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newZoneName.trim() || isSubmitting}
              className="gap-1.5 font-bold cursor-pointer h-9 text-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Area</span>
            </Button>
          </form>

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* List of Zones */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Daftar Area ({zones.length})
            </p>

            <div className="space-y-1.5">
              {zones.map((zone) => {
                const tableCount = tables.filter((t) => t.zone === zone).length;
                const isEditing = editingZone === zone;

                return (
                  <div
                    key={zone}
                    className="flex items-center justify-between p-2.5 rounded-xl border bg-card/60 hover:bg-muted/40 transition-colors text-xs"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="h-7 text-xs flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(zone);
                            if (e.key === 'Escape') setEditingZone(null);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveRename(zone)}
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer shrink-0"
                          title="Simpan Nama"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingZone(null)}
                          className="h-7 w-7 text-muted-foreground hover:bg-muted cursor-pointer shrink-0"
                          title="Batal"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-semibold text-foreground truncate">{zone}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tableCount} Meja
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(zone)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Ubah Nama Area"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(zone)}
                            disabled={tableCount > 0}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-40"
                            title={
                              tableCount > 0
                                ? 'Pindahkan meja sebelum menghapus area ini'
                                : 'Hapus Area'
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 px-6 border-t shrink-0 bg-muted/20 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
