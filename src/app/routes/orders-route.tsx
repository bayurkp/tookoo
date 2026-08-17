import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export const OrdersRoute: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h2>
        <p className="text-muted-foreground text-sm">
          Pantau seluruh struk transaksi dan rekap omzet penjualan harian.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Omzet Hari Ini</CardDescription>
            <CardTitle className="text-2xl font-bold">Rp 0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transaksi</CardDescription>
            <CardTitle className="text-2xl font-bold">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Struk</CardDescription>
            <CardTitle className="text-2xl font-bold">Rp 0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Daftar Struk Penjualan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground p-12 text-center border-2 border-dashed rounded-lg">
            Belum ada transaksi yang tercatat hari ini.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersRoute;
