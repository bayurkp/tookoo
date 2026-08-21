import React, { useState } from 'react';
import { User, Users, X, Search, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import type { Customer } from '@/types/customer.types';
import { CUSTOMER_TIER_META } from '@/types/customer.types';

interface CustomerSelectorComboboxProps {
  selectedCustomer: Customer | null;
  customerName: string | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onSetGuestName: (guestName: string) => void;
  onClear: () => void;
}

export const CustomerSelectorCombobox: React.FC<CustomerSelectorComboboxProps> = ({
  selectedCustomer,
  customerName,
  onSelectCustomer,
  onSetGuestName,
  onClear,
}) => {
  const { data: customers = [] } = useCustomers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCustomers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, search]);

  const handleSelect = (cust: Customer) => {
    onSelectCustomer(cust);
    setOpen(false);
    setSearch('');
  };

  const handleApplyGuestName = () => {
    const trimmed = search.trim();
    if (trimmed) {
      onSetGuestName(trimmed);
      setOpen(false);
      setSearch('');
    }
  };

  const displayName = selectedCustomer?.name || customerName;

  // Selected State (Identical h-8 height with Discount Chip)
  if (displayName) {
    return (
      <div className="flex items-center justify-between h-8 px-2.5 rounded-md bg-primary/10 border border-primary/20 text-xs w-full">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[9px] shrink-0">
            <User className="h-3 w-3" />
          </div>
          <span className="font-bold text-foreground truncate max-w-[130px] sm:max-w-[160px]">
            {displayName}
          </span>
          {selectedCustomer ? (
            <Badge
              variant={CUSTOMER_TIER_META[selectedCustomer.tier]?.badgeVariant || 'default'}
              className="text-[9px] px-1 py-0 h-4 shrink-0"
            >
              {CUSTOMER_TIER_META[selectedCustomer.tier]?.label || 'Member'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-muted-foreground shrink-0">
              Tamu
            </Badge>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer shrink-0"
          title="Hapus pelanggan"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  // Unselected State (Identical h-8 height with Discount Button)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 px-3 text-xs justify-between font-medium text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border-border"
        >
          <div className="flex items-center gap-2 truncate">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">Pilih Pelanggan / Tamu</span>
          </div>
          <span className="text-[11px] font-semibold text-primary shrink-0">+ Tamu</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-2.5 space-y-2 text-xs" align="start">
        {/* Search / Quick Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari member / ketik nama tamu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCustomers.length === 1 && search.trim().toLowerCase() === filteredCustomers[0].name.toLowerCase()) {
                  handleSelect(filteredCustomers[0]);
                } else if (search.trim()) {
                  handleApplyGuestName();
                }
              }
            }}
            className="pl-8 h-8 text-xs font-medium"
            autoFocus
          />
        </div>

        {/* Quick Instant Guest Name CTA */}
        {search.trim().length > 0 && (
          <button
            type="button"
            onClick={handleApplyGuestName}
            className="w-full p-2 rounded-lg text-left text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-between font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Gunakan nama: <strong>"{search.trim()}"</strong></span>
            </div>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">
              Instan
            </Badge>
          </button>
        )}

        {/* Customer / Member List */}
        <div className="space-y-1 max-h-48 overflow-y-auto pt-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
            Daftar Member Terdaftar ({customers.length})
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-3 text-center text-[11px] text-muted-foreground">
              {search ? 'Member tidak ditemukan. Tekan tombol instan di atas untuk memakai nama tamu ini.' : 'Belum ada data member terdaftar.'}
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full p-2 rounded-lg text-left text-xs hover:bg-muted flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground truncate">{c.name}</span>
                    <Badge
                      variant={CUSTOMER_TIER_META[c.tier]?.badgeVariant || 'outline'}
                      className="text-[9px] px-1 py-0 h-3.5"
                    >
                      {CUSTOMER_TIER_META[c.tier]?.label || 'Member'}
                    </Badge>
                  </div>
                  {c.phone && (
                    <span className="text-[10px] text-muted-foreground block">{c.phone}</span>
                  )}
                </div>

                {Boolean(c.discountPercentage && c.discountPercentage > 0) && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    Disc {c.discountPercentage}%
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
