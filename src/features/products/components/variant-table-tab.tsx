import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Layers, Pencil, Sparkles, Package } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import type { Product } from '@/types/product.types';

interface FlattenedVariant {
  productId: string;
  parentProduct: Product;
  variantId: string;
  isStandalone: boolean;
  displayName: string;
  productType: string;
  sku: string;
  barcode: string;
  costPrice: number;
  price: number;
  stock: number;
  minStock: number;
}

interface VariantTableTabProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
}

export const VariantTableTab: React.FC<VariantTableTabProps> = ({ products, onEditProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all products and their variants into a single table
  const allVariants: FlattenedVariant[] = useMemo(() => {
    const list: FlattenedVariant[] = [];

    products.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          list.push({
            productId: p.id,
            parentProduct: p,
            variantId: v.id,
            isStandalone: false,
            displayName: `${p.name} - ${v.name}`,
            productType: p.productType || 'RETAIL',
            sku: v.sku || p.sku || '-',
            barcode: v.barcode || p.barcode || '-',
            costPrice: v.costPrice ?? p.costPrice ?? 0,
            price: v.price,
            stock: v.stock,
            minStock: v.minStock ?? p.minStock ?? 5,
          });
        });
      } else {
        // Standard product without explicit variant
        list.push({
          productId: p.id,
          parentProduct: p,
          variantId: p.id,
          isStandalone: true,
          displayName: p.name,
          productType: p.productType || 'RETAIL',
          sku: p.sku || '-',
          barcode: p.barcode || '-',
          costPrice: p.costPrice || 0,
          price: p.price,
          stock: p.stock,
          minStock: p.minStock ?? 5,
        });
      }
    });

    return list;
  }, [products]);

  const filteredVariants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allVariants;
    return allVariants.filter(
      (v) =>
        v.displayName.toLowerCase().includes(q) ||
        v.sku.toLowerCase().includes(q) ||
        v.barcode.toLowerCase().includes(q)
    );
  }, [allVariants, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari varian, SKU, atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
            Total {filteredVariants.length} Varian Toko
          </Badge>
        </div>
      </div>

      {/* Flat Variants Table */}
      {filteredVariants.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card">
          <Layers className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Tidak ada varian ditemukan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tambahkan varian pada formulir edit produk untuk melihatnya di sini.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
                <TableHead className="text-xs font-bold">NAMA PRODUK & VARIAN</TableHead>
                <TableHead className="text-xs font-bold">TIPE</TableHead>
                <TableHead className="text-xs font-bold">KODE / SKU</TableHead>
                <TableHead className="text-xs font-bold">BARCODE</TableHead>
                <TableHead className="text-xs font-bold text-right">HARGA MODAL</TableHead>
                <TableHead className="text-xs font-bold text-right">HARGA JUAL</TableHead>
                <TableHead className="text-xs font-bold text-center">SISA STOK</TableHead>
                <TableHead className="text-xs font-bold text-right w-20">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariants.map((item, index) => {
                const isService = item.productType === 'SERVICE';
                const isOutOfStock = !isService && item.stock <= 0;
                const isLowStock = !isService && item.stock > 0 && item.stock <= item.minStock;

                return (
                  <TableRow
                    key={`${item.productId}-${item.variantId}`}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground font-mono">
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.isStandalone ? (
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <span className="font-semibold text-xs text-foreground">
                          {item.displayName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">
                        {item.productType === 'SERVICE'
                          ? 'Jasa'
                          : item.productType === 'FNB'
                            ? 'Olahan F&B'
                            : 'Retail'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-foreground font-medium">
                        {item.sku}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.barcode}
                      </span>
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground font-medium">
                      {item.costPrice > 0 ? formatCurrency(item.costPrice) : '-'}
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="font-bold text-xs text-primary">
                        {formatCurrency(item.price)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {isService ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-primary border-primary/30"
                        >
                          Jasa
                        </Badge>
                      ) : isOutOfStock ? (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          Habis
                        </Badge>
                      ) : isLowStock ? (
                        <Badge
                          variant="outline"
                          className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px] font-bold"
                        >
                          {item.stock}
                        </Badge>
                      ) : (
                        <span className="text-xs font-bold text-foreground">{item.stock}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditProduct(item.parentProduct)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Produk"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VariantTableTab;
