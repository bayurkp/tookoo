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
    <Card className="group overflow-hidden border border-border bg-card hover:border-foreground/30 transition-colors flex flex-col justify-between rounded-lg shadow-none">
      <div>
        {/* Product Image / Placeholder */}
        <div className="h-36 w-full bg-muted/40 relative flex items-center justify-center overflow-hidden border-b border-border">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-background border border-border text-muted-foreground flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-2.5 right-2.5">
            {product.stock <= 0 ? (
              <Badge variant="destructive" className="text-[11px] font-semibold">
                Stok Habis
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning" className="text-[11px] font-semibold">
                Sisa {product.stock}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background text-[11px] font-medium py-0.5"
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
                className="text-[11px] font-medium"
              >
                {product.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 space-y-1">
          <h3
            className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-primary font-bold text-lg tracking-tight">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
      </div>

      {/* Action Buttons */}
      <div className="p-3 px-4 flex items-center justify-end gap-2 border-t border-border bg-muted/10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          aria-label="Edit"
          className="h-8 px-2.5 text-xs gap-1.5 font-medium cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          aria-label="Delete"
          className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 font-medium cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus</span>
        </Button>
      </div>
    </Card>
  );
};
