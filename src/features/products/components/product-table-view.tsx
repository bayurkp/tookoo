import React from 'react';
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
import { Pencil, Trash2, Package, Sparkles, Scissors, Coffee } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import type { Product } from '@/types/product.types';

interface ProductTableViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTableView: React.FC<ProductTableViewProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
            <TableHead className="text-xs font-bold">PRODUK</TableHead>
            <TableHead className="text-xs font-bold">KODE / SKU</TableHead>
            <TableHead className="text-xs font-bold">KATEGORI</TableHead>
            <TableHead className="text-xs font-bold">VARIAN & TOPPING</TableHead>
            <TableHead className="text-xs font-bold text-right">HARGA JUAL</TableHead>
            <TableHead className="text-xs font-bold text-center">STOK</TableHead>
            <TableHead className="text-xs font-bold text-center">STATUS</TableHead>
            <TableHead className="text-xs font-bold text-right w-24">AKSI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const isService = product.productType === 'SERVICE';
            const minStock = product.minStock ?? 5;
            const isOutOfStock = !isService && product.stock <= 0;
            const isLowStock = !isService && product.stock > 0 && product.stock <= minStock;
            const isInactive = product.isActive === false;
            const variantCount = product.variants?.length || 0;
            const modifierCount = product.modifierGroups?.length || 0;

            return (
              <TableRow
                key={product.id}
                className={`hover:bg-muted/30 transition-colors ${isInactive ? 'opacity-60 bg-muted/10' : ''}`}
              >
                <TableCell className="text-center text-xs text-muted-foreground font-mono">
                  {index + 1}
                </TableCell>

                {/* Product Name & Photo */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/60 border border-border/80 flex items-center justify-center overflow-hidden shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : isService ? (
                        <Scissors className="h-4 w-4 text-primary" />
                      ) : product.productType === 'FNB' ? (
                        <Coffee className="h-4 w-4 text-primary" />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground line-clamp-1">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {product.productType === 'SERVICE'
                            ? 'Jasa'
                            : product.productType === 'FNB'
                            ? 'Olahan F&B'
                            : 'Retail'}
                        </span>
                        {product.costPrice && product.costPrice > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            • Modal: {formatCurrency(product.costPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* SKU & Barcode */}
                <TableCell>
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-medium text-foreground">
                      {product.sku || '-'}
                    </span>
                    {product.barcode && (
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {product.barcode}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground">
                      {product.category || '-'}
                    </span>
                    {product.subType && (
                      <span className="text-[10px] text-muted-foreground">
                        {product.subType}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Variants & Modifiers Breakdown */}
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {variantCount > 0 ? (
                      product.variants?.map((v) => (
                        <Badge
                          key={v.id}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 font-normal"
                        >
                          {v.name} ({formatCurrency(v.price)})
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Standar</span>
                    )}
                    {modifierCount > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-primary/30 text-primary"
                      >
                        <Sparkles className="h-2.5 w-2.5 mr-1" />
                        {modifierCount} Topping
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Selling Price */}
                <TableCell className="text-right">
                  <span className="font-bold text-xs text-primary">
                    {formatCurrency(product.price)}
                  </span>
                </TableCell>

                {/* Stock Status */}
                <TableCell className="text-center">
                  {isService ? (
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
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
                      {product.stock}
                    </Badge>
                  ) : (
                    <span className="text-xs font-bold text-foreground">{product.stock}</span>
                  )}
                </TableCell>

                {/* Active Status */}
                <TableCell className="text-center">
                  <Badge
                    variant={isInactive ? 'outline' : 'secondary'}
                    className={`text-[10px] ${
                      isInactive
                        ? 'text-muted-foreground'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {isInactive ? 'Non-aktif' : 'Aktif'}
                  </Badge>
                </TableCell>

                {/* Action Buttons */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTableView;
