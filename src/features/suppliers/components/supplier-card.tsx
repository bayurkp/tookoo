import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Supplier } from '@/types/supplier.types';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  CreditCard,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onEdit, onDelete }) => {
  // Clean WhatsApp phone number format
  const cleanPhone = supplier.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  return (
    <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow border-border/80 relative group">
      <div>
        {/* Header: Company Name & Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate" title={supplier.name}>
                {supplier.name}
              </h3>
              {supplier.contactPerson && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <User className="h-3 w-3" />
                  <span className="truncate">{supplier.contactPerson}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(supplier)} className="gap-2">
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Pemasok</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(supplier)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate font-mono">{supplier.phone}</span>
            </div>
            {supplier.phone && (
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                title="Hubungi Sales via WhatsApp"
              >
                <span>WhatsApp</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>

          {supplier.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}

          {supplier.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{supplier.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer tags: Barang Suplai & Termin */}
      <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1 text-xs">
        {supplier.suppliedItems && (
          <div className="flex items-center gap-1.5 text-foreground/90">
            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate text-[11px] font-medium">{supplier.suppliedItems}</span>
          </div>
        )}

        {supplier.paymentTerms && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-[11px]">{supplier.paymentTerms}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
