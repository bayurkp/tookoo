import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Scissors, Coffee, Sparkles } from 'lucide-react';
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
  const isService = product.productType === 'SERVICE';
  const minStock = product.minStock ?? 5;
  const isOutOfStock = !isService && product.stock <= 0;
  const isLowStock = !isService && product.stock > 0 && product.stock <= minStock;
  const isMaxInCart = !isService && quantityInCart >= product.stock;
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  return (
    <Card
      onClick={() => {
        if (!isOutOfStock && (!isMaxInCart || hasVariants)) {
          onAddToCart(product);
        }
      }}
      className={`group overflow-hidden transition-all duration-200 select-none flex flex-col justify-between relative cursor-pointer border border-border/70 bg-card rounded-2xl hover:border-primary/40 shadow-2xs hover:shadow-md ${
        isOutOfStock ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]'
      }`}
    >
      <div>
        {/* Thumbnail Image / Icon */}
        <div className="h-28 sm:h-32 w-full bg-muted/30 relative flex items-center justify-center overflow-hidden border-b border-border/50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-background border border-border text-muted-foreground flex items-center justify-center">
              {isService ? (
                <Scissors className="h-5 w-5 text-primary" />
              ) : product.productType === 'FNB' ? (
                <Coffee className="h-5 w-5 text-primary" />
              ) : (
                <Package className="h-5 w-5" />
              )}
            </div>
          )}

          {/* Top Floating Badges Bar (Single Row for Guaranteed Perfect Alignment) */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
            {/* Left: Cart Quantity Badge */}
            <div>
              {quantityInCart > 0 && (
                <Badge
                  variant="default"
                  className="h-5 px-2 text-[10px] font-extrabold rounded-full shadow-md flex items-center gap-0.5 bg-primary text-primary-foreground border-none leading-none"
                >
                  <span>{quantityInCart}</span>
                  <span className="text-[9px] opacity-90">x</span>
                </Badge>
              )}
            </div>

            {/* Right: Stock Badge */}
            <div className="ml-auto">
              {isService ? (
                <Badge
                  variant="outline"
                  className="h-5 px-2 text-[10px] font-semibold rounded-full bg-background/90 text-primary border-primary/30 backdrop-blur-md leading-none"
                >
                  Jasa
                </Badge>
              ) : isOutOfStock ? (
                <Badge
                  variant="destructive"
                  className="h-5 px-2 text-[10px] font-semibold rounded-full leading-none"
                >
                  {t('products.outOfStock', 'Habis')}
                </Badge>
              ) : isLowStock ? (
                <Badge
                  variant="outline"
                  className="h-5 px-2 text-[10px] font-semibold rounded-full text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/15 backdrop-blur-md leading-none"
                >
                  Sisa {product.stock}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="h-5 px-2 text-[10px] font-medium rounded-full bg-background/90 text-foreground/80 border-border/60 backdrop-blur-md leading-none"
                >
                  Stok: {product.stock}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-start gap-1">
            <p
              className="font-semibold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors flex-1 min-h-[2.2rem]"
              title={product.name}
            >
              {product.name}
            </p>
            {hasVariants && (
              <span title="Memiliki Varian" className="mt-0.5">
                <Sparkles className="h-3 w-3 text-primary shrink-0" />
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/30">
            <span className="text-primary font-bold text-xs sm:text-sm font-mono tracking-tight truncate min-w-0">
              {formatCurrency(product.price)}
            </span>
            <div className="h-6.5 w-6.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 shadow-2xs">
              <Plus className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default CashierProductCard;
