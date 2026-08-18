import React, { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer } from '@/features/customers/hooks/use-customers';
import { CustomerCard } from '@/features/customers/components/customer-card';
import { CustomerFormDialog } from '@/features/customers/components/customer-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Customer, CustomerTier } from '@/types/customer.types';
import { formatCurrency } from '@/utils/format-currency';
import { Users, Plus, Search, Award, ShoppingBag, UserCheck, Percent } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const deleteMutation = useDeleteCustomer();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<CustomerTier | 'ALL'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Filtered list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;

      return matchesSearch && matchesTier;
    });
  }, [customers, searchQuery, selectedTier]);

  // Aggregate Metrics
  const totalCustomers = customers.length;
  const totalVIP = customers.filter((c) => c.tier === 'VIP').length;
  const totalDiscountMembers = customers.filter((c) => c.tier === 'MEMBER_DISCOUNT').length;
  const totalAccumulatedSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  const handleOpenAdd = () => {
    setCustomerToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Hapus data pelanggan "${customer.name}"?`)) {
      await deleteMutation.mutateAsync(customer.id);
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Pelanggan & Member
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola database kontak pelanggan, member loyalitas, dan diskon otomatis kasir.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2 shrink-0 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Tambah Pelanggan</span>
        </Button>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total Pelanggan</p>
            <p className="text-lg font-black text-foreground">{totalCustomers} Orang</p>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Member VIP</p>
            <p className="text-lg font-black text-foreground">{totalVIP} Orang</p>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Member Diskon</p>
            <p className="text-lg font-black text-foreground">{totalDiscountMembers} Orang</p>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total Belanja Member</p>
            <p className="text-lg font-black text-foreground truncate">
              {formatCurrency(totalAccumulatedSpent)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, no WhatsApp, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Tier filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Badge
            variant={selectedTier === 'ALL' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('ALL')}
            className="cursor-pointer text-xs px-2.5 py-1"
          >
            Semua ({totalCustomers})
          </Badge>
          <Badge
            variant={selectedTier === 'REGULAR' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('REGULAR')}
            className="cursor-pointer text-xs px-2.5 py-1"
          >
            Reguler
          </Badge>
          <Badge
            variant={selectedTier === 'VIP' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('VIP')}
            className="cursor-pointer text-xs px-2.5 py-1"
          >
            VIP
          </Badge>
          <Badge
            variant={selectedTier === 'MEMBER_DISCOUNT' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('MEMBER_DISCOUNT')}
            className="cursor-pointer text-xs px-2.5 py-1"
          >
            Diskon Khusus
          </Badge>
        </div>
      </div>

      {/* Customer Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-36 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <UserCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Belum ada pelanggan ditemukan</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? 'Tidak ada kontak yang cocok dengan kata kunci pencarian.'
              : 'Tambahkan data pelanggan pertama untuk mulai membangun loyalitas member toko Anda.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAdd} className="mt-4 gap-2 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Pelanggan Pertama</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Customer Form Dialog */}
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customerToEdit={customerToEdit}
      />
    </div>
  );
};

export default CustomersPage;
