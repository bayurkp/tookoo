import React, { useState, useMemo } from 'react';
import { Folder, Plus, Search, Tag, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/product.types';

interface CategoryManagerTabProps {
  products: Product[];
  onSelectCategoryFilter: (categoryName: string) => void;
  onOpenCreateProduct: (prefilledCategory?: string) => void;
}

export const CategoryManagerTab: React.FC<CategoryManagerTabProps> = ({
  products,
  onSelectCategoryFilter,
  onOpenCreateProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Group products by category & extract sub-types
  const categoryStats = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        productCount: number;
        totalStock: number;
        subTypes: Set<string>;
        products: Product[];
      }
    >();

    products.forEach((p) => {
      const catName = p.category || 'Tanpa Kategori';
      const existing = map.get(catName) || {
        name: catName,
        productCount: 0,
        totalStock: 0,
        subTypes: new Set<string>(),
        products: [],
      };

      existing.productCount += 1;
      existing.totalStock += p.productType === 'SERVICE' ? 0 : p.stock;
      if (p.subType) existing.subTypes.add(p.subType);
      existing.products.push(p);

      map.set(catName, existing);
    });

    return Array.from(map.values());
  }, [products]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categoryStats;
    return categoryStats.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        Array.from(cat.subTypes).some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categoryStats, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Category Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kategori atau sub-kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Button
          onClick={() => onOpenCreateProduct()}
          size="sm"
          className="gap-1.5 font-bold cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk & Kategori</span>
        </Button>
      </div>

      {/* Category Cards Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <Folder className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Belum ada kategori terdaftar</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kategori akan otomatis dibuat saat Anda menambahkan produk ke dalam katalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <Card
              key={cat.name}
              className="border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between rounded-xl shadow-none"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Folder className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {cat.name}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {cat.productCount} Produk terdaftar
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs px-2 font-bold">
                  {cat.totalStock} Stok
                </Badge>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* Sub-types chips */}
                {cat.subTypes.size > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Array.from(cat.subTypes).map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center text-[10px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-medium"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1" />
                        {sub}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/70 italic">
                    Belum memiliki sub-kategori
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectCategoryFilter(cat.name)}
                    className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                  >
                    <span>Lihat Produk</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenCreateProduct(cat.name)}
                    className="h-7 px-2 text-[11px] font-medium gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Item</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManagerTab;
