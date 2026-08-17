import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = quantityInCart >= product.stock;

  return (
    <Card
      onClick={() => {
        if (!isOutOfStock && !isMaxInCart) {
          onAddToCart(product);
        }
      }}
      className={`group overflow-hidden transition-colors select-none flex flex-col justify-between relative cursor-pointer border border-border bg-card rounded-lg hover:border-foreground/30 shadow-none ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed pointer-events-none'
          : 'active:scale-[0.99]'
      }`}
    >
      <div>
        {/* Thumbnail Image / Icon */}
        <div className="h-32 w-full bg-muted/40 relative flex items-center justify-center overflow-hidden border-b border-border">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-background border border-border text-muted-foreground flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          )}

          {/* Quantity in Cart indicator */}
          {quantityInCart > 0 && (
            <div className="absolute top-2.5 left-2.5">
              <Badge className="bg-primary text-primary-foreground font-bold px-2 py-0.5 text-xs">
                {quantityInCart}x
              </Badge>
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-2.5 right-2.5">
            {isOutOfStock ? (
              <Badge variant="destructive" className="font-semibold text-[11px]">
                {t('products.outOfStock', 'Habis')}
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 font-semibold text-[11px]">
                {t('products.lowStock', {
                  count: product.stock,
                  defaultValue: `Sisa ${product.stock}`,
                })}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background text-[11px] font-medium py-0.5"
              >
                {t('products.stock', {
                  count: product.stock,
                  defaultValue: `Stok: ${product.stock}`,
                })}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3.5 space-y-1">
          <p
            className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-primary font-bold text-base tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
