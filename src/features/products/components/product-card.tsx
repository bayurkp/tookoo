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

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="overflow-hidden border-border/80 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Product Image / Placeholder */}
        <div className="h-36 w-full bg-muted/60 relative flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Package className="h-12 w-12 text-muted-foreground/40" />
          )}

          {/* Stock Badges */}
          <div className="absolute top-2 right-2">
            {product.stock <= 0 ? (
              <Badge variant="destructive">Stok Habis</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning">Sisa {product.stock}</Badge>
            ) : (
              <Badge variant="secondary">Stok: {product.stock}</Badge>
            )}
          </div>

          {/* Category Badge */}
          {product.category && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-xs text-xs font-normal">
                {product.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 space-y-1">
          <h3 className="font-semibold text-base line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          <p className="text-primary font-bold text-lg">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 flex gap-2 justify-end border-t border-border/40 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          aria-label="Edit"
          className="h-8 px-2 text-xs gap-1"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          aria-label="Delete"
          className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus</span>
        </Button>
      </div>
    </Card>
  );
};
