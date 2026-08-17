import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import type { Product } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <Card className="group overflow-hidden border-border/80 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between rounded-xl">
      <div>
        {/* Product Image / Gradient Placeholder */}
        <div className="h-36 w-full bg-gradient-to-br from-primary/5 via-slate-100/80 to-primary/10 dark:from-primary/10 dark:via-muted/40 dark:to-primary/5 relative flex items-center justify-center overflow-hidden border-b border-border/50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-background/90 text-primary flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
              <Package className="h-7 w-7 opacity-80" />
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-2.5 right-2.5">
            {product.stock <= 0 ? (
              <Badge variant="destructive" className="shadow-xs font-bold text-[11px]">
                Stok Habis
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning" className="shadow-xs font-bold text-[11px]">
                Sisa {product.stock}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background/90 backdrop-blur-xs text-[11px] font-semibold py-0.5"
              >
                Stok: {product.stock}
              </Badge>
            )}
          </div>

          {/* Category Badge */}
          {product.category && (
            <div className="absolute bottom-2.5 left-2.5">
              <Badge
                variant="secondary"
                className="bg-background/90 backdrop-blur-xs text-[11px] font-medium shadow-xs"
              >
                {product.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 space-y-1.5">
          <h3
            className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-primary font-black text-xl tracking-tight">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
      </div>

      {/* Action Buttons */}
      <div className="p-3 px-4 flex items-center justify-end gap-2 border-t border-border/50 bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          aria-label="Edit"
          className="h-8 px-3 text-xs gap-1.5 font-semibold cursor-pointer hover:bg-background"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          aria-label="Delete"
          className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 font-semibold cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus</span>
        </Button>
      </div>
    </Card>
  );
};
