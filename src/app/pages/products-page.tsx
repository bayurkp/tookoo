import React, { useState, useMemo } from 'react';
import { Plus, Search, PackageOpen, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useProducts, useDeleteProduct } from '@/features/products/hooks/use-products';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { useAuthStore } from '@/stores/auth-store';
import { ProductCard } from '@/features/products/components/product-card';
import { ProductFormDialog } from '@/features/products/components/product-form-dialog';
import { PinModal } from '@/components/pin-modal';
import type { Product } from '@/types/product.types';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useProducts();
  const { settings } = useP2pSync();
  const { hasPermission } = useAuthStore();
  const deleteMutation = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const canManageProducts = hasPermission('MANAGE_PRODUCTS', Boolean(settings?.ownerPin));

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
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'LOW') {
        matchesStock = p.stock > 0 && p.stock <= 5;
      } else if (stockFilter === 'OUT') {
        matchesStock = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const executeProtectedAction = (action: () => void) => {
    if (canManageProducts) {
      action();
    } else {
      setPendingAction(() => action);
      setIsPinModalOpen(true);
    }
  };

  const handleOpenCreate = () => {
    executeProtectedAction(() => {
      setProductToEdit(null);
      setIsDialogOpen(true);
    });
  };

  const handleOpenEdit = (product: Product) => {
    executeProtectedAction(() => {
      setProductToEdit(product);
      setIsDialogOpen(true);
    });
  };

  const handleDelete = (id: string) => {
    executeProtectedAction(() => {
      setDeleteProductId(id);
      setIsDeleteDialogOpen(true);
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteProductId) {
      await deleteMutation.mutateAsync(deleteProductId);
      setDeleteProductId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('products.title', 'Daftar Produk & Stok')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('products.subtitle', 'Kelola menu jualan, harga, dan sisa stok toko tokomu.')}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto gap-2 font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t('products.addProduct', 'Tambah Produk')}</span>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('products.searchPlaceholder', 'Cari produk berdasarkan nama...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Stock Filter Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-3.5 gap-2 text-xs font-semibold shrink-0 cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {stockFilter === 'ALL'
                  ? 'Semua Stok'
                  : stockFilter === 'LOW'
                    ? 'Stok Menipis (≤ 5)'
                    : 'Stok Habis (0)'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Filter Status Stok</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setStockFilter('ALL')}
              className="gap-2 text-xs cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Semua Stok</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStockFilter('LOW')}
              className="gap-2 text-xs cursor-pointer"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Stok Menipis (≤ 5)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStockFilter('OUT')}
              className="gap-2 text-xs cursor-pointer"
            >
              <PackageOpen className="h-3.5 w-3.5 text-destructive" />
              <span>Stok Habis (0)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          <h3 className="font-semibold text-lg">
            {t('products.empty', 'Belum ada produk terdaftar.')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            {searchQuery || selectedCategory !== 'ALL' || stockFilter !== 'ALL'
              ? t('products.emptyFilter', 'Tidak ada produk yang cocok dengan filter pencarian.')
              : t(
                  'products.emptyHint',
                  'Tambahkan produk pertama tokomu untuk mulai melayani penjualan kasir.'
                )}
          </p>
          <Button
            onClick={handleOpenCreate}
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t('products.addProduct', 'Tambah Produk')}</span>
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

      {/* Owner PIN Verification Modal */}
      <PinModal
        open={isPinModalOpen}
        onOpenChange={setIsPinModalOpen}
        correctPin={settings?.ownerPin}
        title="Otorisasi Kelola Produk"
        description="Masukkan PIN Pemilik Toko untuk menambah, mengubah, atau menghapus produk katalog."
        onSuccess={handlePinSuccess}
      />

      {/* Delete Product Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus dari katalog penjualan dan transaksi kasir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Ya, Hapus Produk
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;
