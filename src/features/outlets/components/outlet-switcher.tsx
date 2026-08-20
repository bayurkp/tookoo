import React, { useState } from 'react';
import { Building2, Plus, Store } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useOutlets,
  useActiveOutlet,
  useSetActiveOutlet,
  useUpsertOutlet,
} from '@/features/outlets/hooks/use-outlets';
import { OutletFormDialog } from '@/features/outlets/components/outlet-form-dialog';
import { sounds } from '@/utils/audio';

export const OutletSwitcher: React.FC = () => {
  const { data: outlets = [], isLoading } = useOutlets();
  const { activeOutlet } = useActiveOutlet();
  const setActiveMutation = useSetActiveOutlet();
  const upsertMutation = useUpsertOutlet();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSelectOutlet = (value: string) => {
    if (value && value !== activeOutlet?.id) {
      setActiveMutation.mutate(value);
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

  const currentValue = activeOutlet?.id || outlets[0]?.id || '';

  return (
    <>
      <Select value={currentValue} onValueChange={handleSelectOutlet}>
        <SelectTrigger className="w-full h-8 text-xs font-semibold bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
          <div className="flex items-center gap-2 truncate text-left">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <SelectValue placeholder="Pilih Cabang">
              <span className="truncate">{activeOutlet?.name || 'Pilih Cabang'}</span>
            </SelectValue>
          </div>
        </SelectTrigger>

        <SelectContent align="start" className="w-56 text-xs">
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
              Cabang / Outlet
            </SelectLabel>
            {outlets.map((outlet) => (
              <SelectItem key={outlet.id} value={outlet.id} className="text-xs cursor-pointer">
                <div className="flex items-center gap-1.5 truncate">
                  <Store className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{outlet.name}</span>
                  {outlet.isHQ && (
                    <span className="text-[9px] font-bold text-primary px-1 py-0 bg-primary/10 rounded ml-1">
                      HQ
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>

          <div className="p-1 border-t mt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-primary font-bold hover:bg-primary/10 rounded-md transition-colors cursor-pointer text-left"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>Tambah Cabang Baru</span>
            </button>
          </div>
        </SelectContent>
      </Select>

      <OutletFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        outletToEdit={null}
        onSave={handleSaveOutlet}
      />
    </>
  );
};
