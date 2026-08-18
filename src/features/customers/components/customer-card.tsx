import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Customer } from '@/types/customer.types';
import { CUSTOMER_TIER_META } from '@/types/customer.types';
import { formatCurrency } from '@/utils/format-currency';
import {
  User,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  Percent,
  Award,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, onDelete }) => {
  const tierMeta = CUSTOMER_TIER_META[customer.tier] || CUSTOMER_TIER_META.REGULAR;

  // Clean WhatsApp phone number format
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  return (
    <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow border-border/80 relative group">
      <div>
        {/* Header: Name & Tier Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate" title={customer.name}>
                {customer.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={tierMeta.badgeVariant}
                  className="text-[10px] px-1.5 py-0 font-medium"
                >
                  {tierMeta.label}
                </Badge>
                {Boolean(customer.discountPercentage && customer.discountPercentage > 0) && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                  >
                    <Percent className="h-2.5 w-2.5 mr-0.5" />
                    {customer.discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(customer)} className="gap-2">
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Pelanggan</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(customer)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact info */}
        <div className="space-y-1 text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate font-mono">{customer.phone}</span>
            </div>
            {customer.phone && (
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                title="Chat via WhatsApp"
              >
                <span>WhatsApp</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>

          {customer.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}

          {customer.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer metrics: Poin & Total Belanja */}
      <div className="mt-3 pt-2.5 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground leading-none">Poin Belanja</p>
            <p className="font-bold text-foreground mt-0.5">{customer.points || 0} Pts</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground leading-none">Total Belanja</p>
            <p className="font-bold text-foreground mt-0.5">
              {formatCurrency(customer.totalSpent || 0)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
