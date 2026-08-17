import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kelola Produk & Stok</h2>
          <p className="text-muted-foreground text-sm">
            Tambah, edit, dan pantau stok barang dagangan toko.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Daftar Produk
          </CardTitle>
          <CardDescription>Semua data produk disimpan di memori lokal Dexie.js.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground p-12 text-center border-2 border-dashed rounded-lg">
            Belum ada produk yang terdaftar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
