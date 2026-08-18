import React, { useState, useMemo } from 'react';
import { useSuppliers, useDeleteSupplier } from '@/features/suppliers/hooks/use-suppliers';
import { SupplierCard } from '@/features/suppliers/components/supplier-card';
import { SupplierFormDialog } from '@/features/suppliers/components/supplier-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from 'react-i18next';
import type { Supplier } from '@/types/supplier.types';
import { Building2, Plus, Search, Phone, Package, FileCheck } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: suppliers = [], isLoading } = useSuppliers();
  const deleteMutation = useDeleteSupplier();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  // Filtered list
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.suppliedItems && s.suppliedItems.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [suppliers, searchQuery]);

  const totalSuppliers = suppliers.length;

  const handleOpenAdd = () => {
    setSupplierToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (window.confirm(`Hapus data pemasok "${supplier.name}"?`)) {
      await deleteMutation.mutateAsync(supplier.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('suppliers.title', 'Pemasok & Vendor')}
        description={t(
          'suppliers.subtitle',
          'Daftar vendor penyedia bahan baku dan kulakan stok toko.'
        )}
        actions={
          <Button onClick={handleOpenAdd} className="gap-2 shrink-0 font-bold shadow-xs">
            <Plus className="h-4 w-4" />
            <span>{t('suppliers.addSupplier', 'Tambah Pemasok')}</span>
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total Pemasok</p>
            <p className="text-lg font-black text-foreground">{totalSuppliers} Vendor</p>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Kontak Sales Aktif</p>
            <p className="text-lg font-black text-foreground">
              {suppliers.filter((s) => s.phone).length} Kontak
            </p>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Pemasok Bahan Baku</p>
            <p className="text-lg font-black text-foreground">
              {suppliers.filter((s) => s.suppliedItems).length} Terdaftar
            </p>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari vendor, nama sales PIC, atau barang suplai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Supplier Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-36 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <FileCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Belum ada pemasok ditemukan</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? 'Tidak ada vendor yang cocok dengan kata kunci pencarian.'
              : 'Tambahkan data pemasok pertama Anda untuk mempermudah pencatatan kulakan stok & faktur tagihan.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAdd} className="mt-4 gap-2 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Pemasok Pertama</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Supplier Form Dialog */}
      <SupplierFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
};

export default SuppliersPage;
