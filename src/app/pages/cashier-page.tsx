import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export const CashierPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kasir Tookoo</h2>
          <p className="text-muted-foreground text-sm">
            Pilih menu untuk menambahkan ke keranjang transaksi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Katalog Menu</CardTitle>
            <CardDescription>Daftar produk aktif di toko ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-lg">
              Belum ada produk. Tambahkan produk di menu <strong>Produk & Stok</strong>.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Keranjang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-12">
              Keranjang belanja kosong.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashierPage;
