import React, { useState } from 'react';
import { Building2, Check, ChevronDown, Plus, Store } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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

  const handleSelectOutlet = (outletId: string) => {
    if (outletId !== activeOutlet?.id) {
      setActiveMutation.mutate(outletId);
      sounds.playSuccess();
    }
  };

  const handleSaveOutlet = async (data: Parameters<typeof upsertMutation.mutateAsync>[0]) => {
    const saved = await upsertMutation.mutateAsync(data);
    await setActiveMutation.mutateAsync(saved.id);
    sounds.playSuccess();
  };

  if (isLoading) {
    return <div className="h-6 w-24 bg-muted/60 animate-pulse rounded-md" />;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer text-left max-w-[200px] group"
          >
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-bold text-foreground truncate">
              {activeOutlet?.name || 'Pilih Cabang'}
            </span>
            {activeOutlet?.isHQ && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 font-bold shrink-0">
                HQ
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56 p-1 text-xs">
          <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
            Cabang / Outlet Toko
          </DropdownMenuLabel>

          {outlets.map((outlet) => {
            const isActive = outlet.id === activeOutlet?.id;
            return (
              <DropdownMenuItem
                key={outlet.id}
                onClick={() => handleSelectOutlet(outlet.id)}
                className={`flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md text-xs font-semibold ${
                  isActive ? 'bg-primary/10 text-primary font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{outlet.name}</span>
                  {outlet.isHQ && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">
                      Pusat
                    </Badge>
                  )}
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 text-primary font-bold cursor-pointer text-xs px-2 py-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Cabang Baru</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OutletFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        outletToEdit={null}
        onSave={handleSaveOutlet}
      />
    </>
  );
};
