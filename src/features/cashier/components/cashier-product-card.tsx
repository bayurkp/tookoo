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
      className={`group overflow-hidden transition-all duration-200 select-none flex flex-col justify-between relative cursor-pointer border-border/80 bg-card rounded-xl hover:border-primary/40 hover:shadow-md ${
        isOutOfStock ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]'
      }`}
    >
      <div>
        {/* Thumbnail Image / Gradient Icon */}
        <div className="h-32 w-full bg-gradient-to-br from-primary/5 via-slate-100/80 to-primary/10 dark:from-primary/10 dark:via-muted/40 dark:to-primary/5 relative flex items-center justify-center overflow-hidden border-b border-border/50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-background/90 text-primary flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
              <Package className="h-6 w-6 opacity-80" />
            </div>
          )}

          {/* Quantity in Cart indicator */}
          {quantityInCart > 0 && (
            <div className="absolute top-2.5 left-2.5">
              <Badge className="bg-primary text-primary-foreground font-black px-2.5 py-0.5 shadow-md text-xs">
                {quantityInCart}x
              </Badge>
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-2.5 right-2.5">
            {isOutOfStock ? (
              <Badge variant="destructive" className="shadow-xs font-bold text-[11px]">
                {t('products.outOfStock', 'Habis')}
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning" className="shadow-xs font-bold text-[11px]">
                {t('products.lowStock', {
                  count: product.stock,
                  defaultValue: `Sisa ${product.stock}`,
                })}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background/90 backdrop-blur-xs text-[11px] font-semibold py-0.5"
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
        <CardContent className="p-3.5 space-y-1.5">
          <p
            className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-primary font-black text-base tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
