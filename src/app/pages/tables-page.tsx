import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Bookmark,
  Square,
  Search,
  Settings2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { TableCanvas } from '@/features/tables/components/table-canvas';
import { TableEditDialog } from '@/features/tables/components/table-edit-dialog';
import { TableBulkGeneratorDialog } from '@/features/tables/components/table-bulk-generator-dialog';
import { ZoneManagerDialog } from '@/features/tables/components/zone-manager-dialog';
import {
  useTables,
  useUpsertTable,
  useBulkUpsertTables,
  useDeleteTable,
} from '@/features/tables/hooks/use-tables';
import { db } from '@/lib/db';
import { sounds } from '@/utils/audio';
import { DEFAULT_STORE_ZONES, type StoreTable } from '@/types/table.types';

export const TablesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: tables } = useTables();
  const upsertMutation = useUpsertTable();
  const bulkUpsertMutation = useBulkUpsertTables();
  const deleteMutation = useDeleteTable();

  // Fetch Store Settings for Custom Zones
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  // Local active tables state for instant 0ms canvas dragging before syncing to DB
  const [localTables, setLocalTables] = useState<StoreTable[]>([]);
  const [hasUnsavedLayout, setHasUnsavedLayout] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<StoreTable | null>(null);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<StoreTable | null>(null);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isZoneManagerOpen, setIsZoneManagerOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<StoreTable | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Sync localTables when server data loads or updates
  useEffect(() => {
    if (tables) {
      setLocalTables(tables);
    }
  }, [tables]);

  // Distinct zones (User custom zones + zones used in tables + default fallback)
  const distinctZones = useMemo(() => {
    const fromSettings = settings?.customZones || [];
    const fromTables = localTables.map((t) => t.zone).filter(Boolean);
    const combined = Array.from(new Set([...fromSettings, ...fromTables]));
    return combined.length > 0 ? combined : DEFAULT_STORE_ZONES.slice(0, 3);
  }, [settings?.customZones, localTables]);

  // Persist custom zones to Dexie Settings
  const saveCustomZonesMutation = useMutation({
    mutationFn: async (updatedZones: string[]) => {
      const currentSettings = await db.settings.toCollection().first();
      if (currentSettings) {
        await db.settings.update(currentSettings.id, {
          customZones: updatedZones,
          updatedAt: Date.now(),
        });
      } else {
        await db.settings.put({
          id: crypto.randomUUID(),
          storeName: 'Tookoo POS',
          passphrase: '',
          storeSecretKey: crypto.randomUUID(),
          customZones: updatedZones,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          deletedAt: null,
        });
      }
      return updatedZones;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  // Add a new custom zone
  const handleAddZone = async (newZone: string) => {
    const trimmed = newZone.trim();
    if (!trimmed) return;
    const updated = Array.from(new Set([...distinctZones, trimmed]));
    await saveCustomZonesMutation.mutateAsync(updated);
    setSelectedZone(trimmed);
    sounds.playSuccess();
    showToast(`Area "${trimmed}" berhasil ditambahkan.`);
  };

  // Rename a zone
  const handleRenameZone = async (oldZone: string, newZone: string) => {
    const updatedZones = distinctZones.map((z) => (z === oldZone ? newZone : z));
    await saveCustomZonesMutation.mutateAsync(updatedZones);

    // Update all tables currently in that zone
    const tablesToUpdate = localTables
      .filter((t) => t.zone === oldZone)
      .map((t) => ({ ...t, zone: newZone, updatedAt: Date.now() }));

    if (tablesToUpdate.length > 0) {
      await bulkUpsertMutation.mutateAsync(tablesToUpdate);
      setLocalTables((prev) => prev.map((t) => (t.zone === oldZone ? { ...t, zone: newZone } : t)));
    }

    if (selectedZone === oldZone) {
      setSelectedZone(newZone);
    }
    showToast(`Nama area diubah menjadi "${newZone}".`);
  };

  // Delete an empty zone
  const handleDeleteZone = async (zoneToDelete: string) => {
    const updatedZones = distinctZones.filter((z) => z !== zoneToDelete);
    await saveCustomZonesMutation.mutateAsync(updatedZones);

    if (selectedZone === zoneToDelete) {
      setSelectedZone('ALL');
    }
    showToast(`Area "${zoneToDelete}" dihapus.`);
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Filtered tables by selected zone & search
  const filteredTables = useMemo(() => {
    return localTables.filter((t) => {
      const matchZone = selectedZone === 'ALL' || t.zone === selectedZone;
      const matchQuery =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        t.zone.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchZone && matchQuery;
    });
  }, [localTables, selectedZone, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const targetTables =
      selectedZone === 'ALL' ? localTables : localTables.filter((t) => t.zone === selectedZone);
    const total = targetTables.length;
    const available = targetTables.filter((t) => t.status === 'AVAILABLE').length;
    const occupied = targetTables.filter((t) => t.status === 'OCCUPIED').length;
    const reserved = targetTables.filter((t) => t.status === 'RESERVED').length;
    const totalSeats = targetTables.reduce((acc, t) => acc + (t.capacity || 0), 0);

    return { total, available, occupied, reserved, totalSeats };
  }, [localTables, selectedZone]);

  // Handle Drag & Resize on Canvas
  const handleUpdateTableLayout = useCallback(
    (tableId: string, updates: { x: number; y: number; width: number; height: number }) => {
      setLocalTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, ...updates } : t)));
      setHasUnsavedLayout(true);
    },
    []
  );

  // Save All Canvas Layouts to Dexie
  const handleSaveAllLayouts = async () => {
    await bulkUpsertMutation.mutateAsync(localTables);
    setHasUnsavedLayout(false);
    sounds.playSuccess();
    showToast('Tata letak denah meja berhasil disimpan!');
  };

  const handleOpenCreate = () => {
    setTableToEdit(null);
    setIsEditDialogOpen(true);
  };

  const handleOpenEdit = (table: StoreTable) => {
    setTableToEdit(table);
    setIsEditDialogOpen(true);
  };

  const handleSaveTable = async (
    tableData: Partial<StoreTable> & { name: string },
    targetZone: string
  ) => {
    const saved = await upsertMutation.mutateAsync(tableData);
    setLocalTables((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });

    if (!distinctZones.includes(targetZone)) {
      await saveCustomZonesMutation.mutateAsync([...distinctZones, targetZone]);
    }

    if (selectedZone !== 'ALL' && selectedZone !== targetZone) {
      setSelectedZone(targetZone);
    }

    sounds.playSuccess();
    showToast(`Meja "${saved.name}" berhasil disimpan.`);
  };

  const handleBulkGenerate = async (newTables: StoreTable[], targetZone: string) => {
    await bulkUpsertMutation.mutateAsync(newTables);
    setLocalTables((prev) => [...prev, ...newTables]);

    if (!distinctZones.includes(targetZone)) {
      await saveCustomZonesMutation.mutateAsync([...distinctZones, targetZone]);
    }

    setSelectedZone(targetZone);
    sounds.playSuccess();
    showToast(`${newTables.length} meja berhasil dibuat di area "${targetZone}".`);
  };

  const handleDeletePrompt = (table: StoreTable) => {
    setTableToDelete(table);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (tableToDelete) {
      await deleteMutation.mutateAsync(tableToDelete.id);
      setLocalTables((prev) => prev.filter((t) => t.id !== tableToDelete.id));
      setTableToDelete(null);
      setIsDeleteDialogOpen(false);
      sounds.playSuccess();
      showToast('Meja berhasil dihapus.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('tables.title', 'Denah & Tata Letak Meja')}
        description={t(
          'tables.subtitle',
          'Atur tata letak meja visual dengan canvas bebas gerak (pan & zoom) untuk kenyamanan kasir.'
        )}
        actions={
          <>
            {hasUnsavedLayout && (
              <Button
                onClick={handleSaveAllLayouts}
                size="sm"
                disabled={bulkUpsertMutation.isPending}
                className="gap-1.5 font-bold cursor-pointer text-xs shadow-xs animate-pulse bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{t('tables.saveLayout', 'Simpan Posisi Canvas')}</span>
              </Button>
            )}

            {feedbackMessage && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-bold px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            <Button
              onClick={() => setIsBulkDialogOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 font-bold cursor-pointer text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{t('tables.bulkCreate', '+ Buat Meja Berurutan')}</span>
            </Button>

            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="gap-1.5 font-bold cursor-pointer text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('tables.addTable', 'Tambah Meja')}</span>
            </Button>
          </>
        }
      />

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Meja */}
        <Card className="border bg-card rounded-xl shadow-none p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Meja {selectedZone !== 'ALL' && `(${selectedZone})`}
            </p>
            <p className="text-xl font-extrabold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">{stats.totalSeats} Total Kursi</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Square className="h-4 w-4" />
          </div>
        </Card>

        {/* Meja Kosong */}
        <Card className="border bg-card rounded-xl shadow-none p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Kosong (Tersedia)
            </p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.available}
            </p>
            <p className="text-[10px] text-muted-foreground">Siap ditempati</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </Card>

        {/* Meja Terisi */}
        <Card className="border bg-card rounded-xl shadow-none p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Terisi / Ada Bill
            </p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats.occupied}
            </p>
            <p className="text-[10px] text-muted-foreground">Sedang makan / transaksi</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </Card>

        {/* Reservasi */}
        <Card className="border bg-card rounded-xl shadow-none p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Booking / Reservasi
            </p>
            <p className="text-xl font-extrabold text-primary">{stats.reserved}</p>
            <p className="text-[10px] text-muted-foreground">Telah dipesan</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Bookmark className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* Zone Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Zone Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedZone('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedZone === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            Semua Area ({localTables.length})
          </button>

          {distinctZones.map((z) => {
            const count = localTables.filter((t) => t.zone === z).length;
            return (
              <button
                key={z}
                type="button"
                onClick={() => setSelectedZone(z)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedZone === z
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {z} ({count})
              </button>
            );
          })}

          {/* Manage / Add Custom Areas Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsZoneManagerOpen(true)}
            className="h-8 px-2.5 text-xs text-primary font-bold gap-1 cursor-pointer shrink-0 hover:bg-primary/10"
            title="Tambah atau kelola area/ruangan meja"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Kelola Area</span>
          </Button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari nama meja / area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-card"
          />
        </div>
      </div>

      {/* Interactive Infinite Floorplanner Canvas */}
      <div className="h-[620px] w-full">
        <TableCanvas
          tables={filteredTables}
          selectedTableId={selectedTable?.id}
          onSelectTable={(table) => setSelectedTable(table)}
          onUpdateTableLayout={handleUpdateTableLayout}
          onEditTableDetails={handleOpenEdit}
          onDeleteTable={handleDeletePrompt}
          isEditable={true}
        />
      </div>

      {/* Add / Edit Table Modal Dialog */}
      <TableEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tableToEdit={tableToEdit}
        onSave={handleSaveTable}
        zones={distinctZones}
      />

      {/* Bulk Generator Dialog */}
      <TableBulkGeneratorDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        onGenerate={handleBulkGenerate}
        zones={distinctZones}
        existingTables={localTables}
      />

      {/* Zone Manager Dialog */}
      <ZoneManagerDialog
        open={isZoneManagerOpen}
        onOpenChange={setIsZoneManagerOpen}
        zones={distinctZones}
        tables={localTables}
        onAddZone={handleAddZone}
        onRenameZone={handleRenameZone}
        onDeleteZone={handleDeleteZone}
      />

      {/* Delete Confirmation Modal Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {tableToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Meja ini akan dihapus dari denah tata letak dan pilihan transaksi kasir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Ya, Hapus Meja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TablesPage;
