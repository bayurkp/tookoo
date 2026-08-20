import React, { useState } from 'react';
import { Building2, Check, ChevronsUpDown, Plus, Store } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

  const [open, setOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSelectOutlet = (outletId: string) => {
    if (outletId !== activeOutlet?.id) {
      setActiveMutation.mutate(outletId);
      sounds.playSuccess();
    }
    setOpen(false);
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full h-8 px-2.5 justify-between text-xs font-semibold bg-sidebar-accent/40 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground shadow-none"
          >
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
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-56 p-0 text-xs" align="start">
          <Command>
            <CommandInput placeholder="Cari cabang outlet..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty>Cabang tidak ditemukan.</CommandEmpty>
              <CommandGroup heading="Daftar Cabang">
                {outlets.map((outlet) => {
                  const isSelected = activeOutlet?.id === outlet.id;
                  return (
                    <CommandItem
                      key={outlet.id}
                      value={`${outlet.name} ${outlet.address || ''}`}
                      onSelect={() => handleSelectOutlet(outlet.id)}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{outlet.name}</span>
                        {outlet.isHQ && (
                          <span className="text-[9px] font-bold text-primary px-1 py-0 bg-primary/10 rounded">
                            HQ
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          'h-3.5 w-3.5 text-primary shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setIsAddOpen(true);
                  }}
                  className="text-xs text-primary font-bold cursor-pointer gap-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Cabang Baru</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <OutletFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        outletToEdit={null}
        onSave={handleSaveOutlet}
      />
    </>
  );
};
