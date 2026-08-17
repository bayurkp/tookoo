import React, { useState, useMemo } from 'react';
import { Plus, Search, PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts, useDeleteProduct } from '@/features/products/hooks/use-products';
import { ProductCard } from '@/features/products/components/product-card';
import { ProductFormDialog } from '@/features/products/components/product-form-dialog';
import type { Product } from '@/types/product.types';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useProducts();
  const deleteMutation = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

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

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('products.deleteConfirm', 'Hapus produk ini?'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('products.title', 'Kelola Produk')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('products.subtitle', 'Daftar master data produk, inventaris stok, dan kategori tokomu.')}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" />
          {t('products.addProduct', 'Tambah Produk')}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('products.searchPlaceholder', 'Cari produk berdasarkan nama...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Badge
            variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => setSelectedCategory('ALL')}
          >
            {t('products.allCategories', 'Semua')} ({products.length})
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

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card">
          <PackageOpen className="h-12 w-12 text-muted-foreground/60 mb-4" />
          <h3 className="font-semibold text-lg">{t('products.empty', 'Belum ada produk')}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            {searchQuery || selectedCategory !== 'ALL'
              ? t('products.emptyFilter', 'Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih.')
              : t('products.emptyHint', 'Tambahkan produk pertama tokomu untuk mulai melayani transaksi kasir.')}
          </p>
          <Button onClick={handleOpenCreate} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('products.addProduct', 'Tambah Produk')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default ProductsPage;
