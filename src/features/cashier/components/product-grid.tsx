import React, { useState, useMemo } from 'react';
import { Search, PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CashierProductCard } from './cashier-product-card';
import { VariantModifierModal } from './variant-modifier-modal';
import { useCartStore } from '../stores/cart-store';
import { sounds } from '@/utils/audio';
import type {
  Product,
  ProductVariantOption,
} from '@/types/product.types';
import type { SelectedModifier } from '../types/cart.types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading = false }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedModalProduct, setSelectedModalProduct] = useState<Product | null>(null);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const handleProductClick = (product: Product) => {
    const hasVariants = Boolean(product.variants && product.variants.length > 0);
    const hasModifiers = Boolean(product.modifierGroups && product.modifierGroups.length > 0);

    if (hasVariants || hasModifiers) {
      setSelectedModalProduct(product);
    } else {
      addItem(product);
      sounds.playBeep();
    }
  };

  const handleModalAddToCart = (
    product: Product,
    quantity: number,
    selectedVariant?: ProductVariantOption,
    selectedModifiers?: SelectedModifier[]
  ) => {
    addItem(product, quantity, selectedVariant, selectedModifiers);
    sounds.playBeep();
  };

  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((item) => {
      const current = map.get(item.product.id) || 0;
      map.set(item.product.id, current + item.quantity);
    });
    return map;
  }, [cartItems]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.subType && p.subType.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredProducts.length === 1) {
      const product = filteredProducts[0];
      if (product.stock > (cartItemMap.get(product.id) || 0)) {
        handleProductClick(product);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('cashier.searchPlaceholder', 'Cari nama atau barcode produk...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="pl-9 bg-card"
        />
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Badge
            variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => setSelectedCategory('ALL')}
          >
            {t('cashier.allCategories', 'Semua')} ({products.length})
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1 text-xs"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Grid Display */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card">
            <PackageOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== 'ALL'
                ? t('products.emptyFilter', 'Tidak ada produk yang cocok dengan filter pencarian.')
                : t('products.empty', 'Belum ada produk terdaftar.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <CashierProductCard
                key={product.id}
                product={product}
                quantityInCart={cartItemMap.get(product.id) || 0}
                onAddToCart={handleProductClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for selecting variants and modifiers */}
      <VariantModifierModal
        product={selectedModalProduct}
        open={Boolean(selectedModalProduct)}
        onOpenChange={(open) => {
          if (!open) setSelectedModalProduct(null);
        }}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default ProductGrid;
