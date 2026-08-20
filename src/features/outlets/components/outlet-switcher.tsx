import React, { useState } from 'react';
import { Building2, ChevronsUpDown, Plus, Store } from 'lucide-react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxSeparator,
} from '@/components/ui/combobox';
import {
  useOutlets,
  useActiveOutlet,
  useSetActiveOutlet,
  useUpsertOutlet,
} from '@/features/outlets/hooks/use-outlets';
import { OutletFormDialog } from '@/features/outlets/components/outlet-form-dialog';
import { sounds } from '@/utils/audio';
import type { Outlet } from '@/types/store.types';

export const OutletSwitcher: React.FC = () => {
  const { data: outlets = [], isLoading } = useOutlets();
  const { activeOutlet } = useActiveOutlet();
  const setActiveMutation = useSetActiveOutlet();
  const upsertMutation = useUpsertOutlet();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSelectOutlet = (selected: Outlet | null) => {
    if (selected && selected.id !== activeOutlet?.id) {
      setActiveMutation.mutate(selected.id);
      sounds.playSuccess();
    }
  };

  const handleSaveOutlet = async (data: Parameters<typeof upsertMutation.mutateAsync>[0]) => {
    const saved = await upsertMutation.mutateAsync(data);
    await setActiveMutation.mutateAsync(saved.id);
    sounds.playSuccess();
  };

  if (isLoading) {
    return <div className="h-8 w-full bg-muted/60 animate-pulse rounded-lg" />;
  }

  return (
    <>
      <Combobox
        items={outlets}
        value={activeOutlet || outlets[0] || null}
        onValueChange={handleSelectOutlet}
        itemToStringLabel={(item: Outlet) => item?.name || ''}
      >
        <ComboboxTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 text-xs font-semibold text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer outline-none">
          <div className="flex items-center gap-2 truncate text-left min-w-0">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{activeOutlet?.name || 'Pilih Cabang...'}</span>
            {activeOutlet?.isHQ && (
              <span className="text-[9px] font-bold text-primary px-1 py-0 bg-primary/10 rounded shrink-0">
                HQ
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </ComboboxTrigger>

        <ComboboxContent className="w-56 text-xs" align="start">
          <ComboboxInput showTrigger={false} placeholder="Cari cabang outlet..." />
          <ComboboxEmpty>Cabang tidak ditemukan.</ComboboxEmpty>
          <ComboboxList>
            {(item: Outlet) => (
              <ComboboxItem key={item.id} value={item}>
                <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.isHQ && (
                  <span className="text-[9px] font-bold text-primary px-1 py-0 bg-primary/10 rounded">
                    HQ
                  </span>
                )}
              </ComboboxItem>
            )}
          </ComboboxList>

          <ComboboxSeparator className="my-1" />

          <div className="p-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-primary font-bold hover:bg-primary/10 rounded-md transition-colors cursor-pointer text-left"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>Tambah Cabang Baru</span>
            </button>
          </div>
        </ComboboxContent>
      </Combobox>

      <OutletFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        outletToEdit={null}
        onSave={handleSaveOutlet}
      />
    </>
  );
};
