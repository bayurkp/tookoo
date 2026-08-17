import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-currency';
import type { Product } from '@/types/product.types';

interface GroupedModifier {
  name: string;
  maxSelect: number;
  required: boolean;
  options: { id: string; name: string; price: number }[];
  usedInProducts: { id: string; name: string }[];
}

interface ModifierManagerTabProps {
  products: Product[];
  onOpenEditProduct: (product: Product) => void;
  onOpenCreateProduct: () => void;
}

export const ModifierManagerTab: React.FC<ModifierManagerTabProps> = ({
  products,
  onOpenEditProduct,
  onOpenCreateProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all modifier groups across products
  const modifierGroups: GroupedModifier[] = useMemo(() => {
    const map = new Map<string, GroupedModifier>();

    products.forEach((p) => {
      if (p.modifierGroups && p.modifierGroups.length > 0) {
        p.modifierGroups.forEach((g) => {
          const key = g.name.trim().toLowerCase();
          const existing = map.get(key) || {
            name: g.name.trim(),
            maxSelect: g.maxSelect || 1,
            required: Boolean(g.required),
            options: [...(g.options || [])],
            usedInProducts: [],
          };

          // Merge unique options
          g.options?.forEach((opt) => {
            if (!existing.options.some((o) => o.name.toLowerCase() === opt.name.toLowerCase())) {
              existing.options.push(opt);
            }
          });

          existing.usedInProducts.push({ id: p.id, name: p.name });
          map.set(key, existing);
        });
      }
    });

    return Array.from(map.values());
  }, [products]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return modifierGroups;
    return modifierGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.options.some((opt) => opt.name.toLowerCase().includes(q))
    );
  }, [modifierGroups, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari grup modifier atau topping..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Button
          onClick={onOpenCreateProduct}
          size="sm"
          className="gap-1.5 font-bold cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk & Modifier</span>
        </Button>
      </div>

      {/* Modifier Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Belum ada grup modifier terdaftar</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Grup modifier (seperti pilihan topping atau level pedas) dibuat saat mengisi formulir produk.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Card
              key={group.name}
              className="border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between rounded-xl shadow-none"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {group.name}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {group.maxSelect > 1 ? 'Pilihan Bebas (Banyak)' : 'Pilihan Tunggal (Pilih 1)'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] px-2">
                  {group.options.length} Opsi
                </Badge>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* Option list with prices */}
                <div className="space-y-1.5 p-2.5 bg-muted/30 rounded-lg border border-border/50">
                  {group.options.map((opt) => (
                    <div
                      key={opt.id || opt.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-foreground">{opt.name}</span>
                      <span className="font-bold text-primary">
                        {opt.price > 0 ? `+${formatCurrency(opt.price)}` : 'Gratis (Rp0)'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Used in products */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Digunakan Pada ({group.usedInProducts.length} Produk):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.usedInProducts.map((p) => {
                      const prod = products.find((pr) => pr.id === p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => prod && onOpenEditProduct(prod)}
                          className="text-[11px] bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded-md font-medium border border-border/50 transition-colors cursor-pointer"
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModifierManagerTab;
