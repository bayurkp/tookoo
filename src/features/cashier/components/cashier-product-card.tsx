import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import type { Product } from '@/types/product.types';

interface CashierProductCardProps {
  product: Product;
  quantityInCart?: number;
  onAddToCart: (product: Product) => void;
}

export const CashierProductCard: React.FC<CashierProductCardProps> = ({
  product,
  quantityInCart = 0,
  onAddToCart,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = quantityInCart >= product.stock;

  return (
    <Card
      onClick={() => {
        if (!isOutOfStock && !isMaxInCart) {
          onAddToCart(product);
        }
      }}
      className={`group overflow-hidden transition-all select-none flex flex-col justify-between relative cursor-pointer border-border/80 hover:border-primary/50 hover:shadow-md ${
        isOutOfStock ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-98'
      }`}
    >
      <div>
        {/* Thumbnail Image / Icon */}
        <div className="h-28 w-full bg-muted/50 relative flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <Package className="h-10 w-10 text-muted-foreground/30" />
          )}

          {/* Quantity in Cart indicator */}
          {quantityInCart > 0 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-primary-foreground font-bold px-2 py-0.5 shadow-sm text-xs">
                {quantityInCart}x
              </Badge>
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-2 right-2">
            {isOutOfStock ? (
              <Badge variant="destructive">Habis</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning">Sisa {product.stock}</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-normal">
                Stok: {product.stock}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3 space-y-1">
          <p
            className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-primary font-bold text-sm">
              {formatCurrency(product.price)}
            </span>
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
