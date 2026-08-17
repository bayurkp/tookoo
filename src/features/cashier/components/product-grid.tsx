import React, { useState, useMemo } from 'react';
import { Search, PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CashierProductCard } from './cashier-product-card';
import { useCartStore } from '../stores/cart-store';
import type { Product } from '@/types/product.types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((item) => {
      map.set(item.product.id, item.quantity);
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
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('cashier.searchPlaceholder', 'Cari nama atau barcode produk...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                ? t('products.emptyFilter', 'Tidak ada produk yang cocok dengan filter.')
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
                onAddToCart={addItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
