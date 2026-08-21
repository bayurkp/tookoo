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
      className={`group overflow-hidden transition-colors select-none flex flex-col justify-between relative cursor-pointer border border-border bg-card rounded-lg hover:border-foreground/30 shadow-none ${
        isOutOfStock ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-[0.99]'
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
              {isService ? (
                <Scissors className="h-5 w-5 text-primary" />
              ) : product.productType === 'FNB' ? (
                <Coffee className="h-5 w-5 text-primary" />
              ) : (
                <Package className="h-5 w-5" />
              )}
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
            {isService ? (
              <Badge
                variant="outline"
                className="bg-background/90 text-primary border-primary/30 font-semibold text-[10px] backdrop-blur-xs"
              >
                Jasa
              </Badge>
            ) : isOutOfStock ? (
              <Badge variant="destructive" className="font-semibold text-[10px]">
                {t('products.outOfStock', 'Habis')}
              </Badge>
            ) : isLowStock ? (
              <Badge
                variant="outline"
                className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 font-semibold text-[10px] backdrop-blur-xs"
              >
                Sisa {product.stock} {product.unit || 'pcs'}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background/90 text-[10px] font-medium py-0.5 backdrop-blur-xs"
              >
                Stok: {product.stock} {product.unit || 'pcs'}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center gap-1">
            <p
              className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors flex-1"
              title={product.name}
            >
              {product.name}
            </p>
            {hasVariants && (
              <span title="Memiliki Varian">
                <Sparkles className="h-3 w-3 text-primary shrink-0" />
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            <span className="text-primary font-bold text-sm sm:text-base tracking-tight truncate min-w-0">
              {formatCurrency(product.price)}
            </span>
            <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default CashierProductCard;
