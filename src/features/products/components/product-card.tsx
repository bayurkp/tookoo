import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Package, Sparkles, Layers } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import type { Product } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const variantCount = product.variants?.length || 0;
  const modifierCount = product.modifierGroups?.length || 0;

  return (
    <Card className="group overflow-hidden border border-border bg-card hover:border-foreground/30 transition-colors flex flex-col justify-between rounded-xl shadow-none">
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
              <Badge variant="destructive" className="text-[10px] font-semibold">
                Stok Habis
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold">
                Sisa {product.stock}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background text-[10px] font-medium py-0.5"
              >
                Stok: {product.stock}
              </Badge>
            )}
          </div>

          {/* Category & Type Badges */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 flex-wrap">
            {product.category && (
              <Badge
                variant="secondary"
                className="text-[10px] font-medium bg-card/90 backdrop-blur-xs"
              >
                {product.category}
              </Badge>
            )}
            {product.subType && (
              <Badge
                variant="outline"
                className="text-[10px] bg-card/90 backdrop-blur-xs"
              >
                {product.subType}
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <CardContent className="p-3.5 space-y-1.5">
          <h3
            className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 flex-wrap">
            {variantCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                <Sparkles className="h-2.5 w-2.5" />
                <span>{variantCount} Varian</span>
              </span>
            )}
            {modifierCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                <Layers className="h-2.5 w-2.5" />
                <span>{modifierCount} Topping</span>
              </span>
            )}
          </div>

          <p className="text-primary font-bold text-base tracking-tight">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
      </div>

      {/* Action Buttons */}
      <div className="p-2.5 px-3 flex items-center justify-end gap-1.5 border-t border-border bg-muted/10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          aria-label="Edit"
          className="h-7 px-2 text-xs gap-1 font-medium cursor-pointer"
        >
          <Pencil className="h-3 w-3" />
          <span>Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          aria-label="Delete"
          className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 font-medium cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
          <span>Hapus</span>
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
