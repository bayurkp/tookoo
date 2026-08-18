import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Receipt,
  RefreshCw,
  Settings,
  LayoutGrid,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeaderStatusBadge } from '@/components/header-status-badge';
import { AppModeSwitcher } from '@/components/app-mode-switcher';
import { AppSidebar } from '@/components/app-sidebar';
import { useAppMode } from '@/hooks/use-app-mode';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isAdvanced } = useAppMode();
  const location = useLocation();

  // Dynamic breadcrumb resolution based on 4-Domain Framework
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') {
      return { group: 'Penjualan', title: 'Kasir' };
    }
    if (path.startsWith('/orders')) {
      return { group: 'Penjualan', title: 'Riwayat Transaksi' };
    }
    if (path.startsWith('/shifts')) {
      return { group: 'Penjualan', title: 'Shift & Uang Kas' };
    }
    if (path.startsWith('/dashboard')) {
      return { group: 'Dasbor', title: 'Ringkasan Bisnis' };
    }
    if (path.startsWith('/store-profile')) {
      return { group: 'Data Toko', title: 'Profil Toko' };
    }
    if (path.startsWith('/products')) {
      return { group: 'Data Toko', title: 'Produk & Menu' };
    }
    if (path.startsWith('/discounts')) {
      return { group: 'Data Toko', title: 'Diskon & Promosi' };
    }
    if (path.startsWith('/taxes')) {
      return { group: 'Data Toko', title: 'Pajak & Biaya Layanan' };
    }
    if (path.startsWith('/customers')) {
      return { group: 'Data Toko', title: 'Pelanggan & Member' };
    }
    if (path.startsWith('/suppliers')) {
      return { group: 'Data Toko', title: 'Pemasok & Vendor' };
    }
    if (path.startsWith('/tables') || path.startsWith('/layout')) {
      return { group: 'Data Toko', title: 'Denah Meja' };
    }
    if (path.startsWith('/receipt-settings')) {
      return { group: 'Data Toko', title: 'Desain Nota & Struk' };
    }
    if (path.startsWith('/expenses')) {
      return { group: 'Akuntansi & Inventaris', title: 'Pengeluaran Kas' };
    }
    if (path.startsWith('/inventory')) {
      return { group: 'Akuntansi & Inventaris', title: 'Penyesuaian Stok (Opname)' };
    }
    if (path.startsWith('/reports')) {
      return { group: 'Laporan & Analitik', title: 'Laporan Bisnis' };
    }
    if (path.startsWith('/sync')) {
      return { group: 'Sistem', title: 'Sinkronisasi Perangkat (P2P)' };
    }
    if (path.startsWith('/settings')) {
      return { group: 'Sistem', title: 'Pengaturan Sistem' };
    }

    return { group: 'Tookoo POS', title: 'Halaman' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen h-[100dvh] w-full bg-background text-foreground overflow-hidden">
        {/* Desktop Collapsible shadcn/ui AppSidebar */}
        <AppSidebar />

        {/* Main Content View with Inset Layout & Header */}
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          {/* Top Header with Breadcrumbs & Status Bar */}
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card/80 backdrop-blur px-4 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mr-1 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden sm:block">
                    <BreadcrumbLink className="text-xs text-muted-foreground font-medium">
                      {breadcrumb.group}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xs font-bold text-foreground">
                      {breadcrumb.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
              {/* Global App Mode Switcher (Simple vs Pro) */}
              <AppModeSwitcher variant="header" />
              <HeaderStatusBadge isOnline={navigator.onLine} peerCount={0} />
            </div>
          </header>

          {/* Dynamic Page Router Outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 bg-background">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation Bar (Fixed sticky on mobile with safe-area support) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md flex items-center justify-around py-2 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            <span>{t('nav.cashier', 'Kasir')}</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Package className="h-4.5 w-4.5" />
            <span>{t('nav.products', 'Produk')}</span>
          </NavLink>

          {isAdvanced && (
            <NavLink
              to="/tables"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <LayoutGrid className="h-4.5 w-4.5" />
              <span>{t('nav.tables', 'Meja')}</span>
            </NavLink>
          )}

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Receipt className="h-4.5 w-4.5" />
            <span>{t('nav.orders', 'Riwayat')}</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Wallet className="h-4.5 w-4.5" />
            <span>Biaya</span>
          </NavLink>

          {isAdvanced && (
            <NavLink
              to="/sync"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <RefreshCw className="h-4.5 w-4.5" />
              <span>{t('nav.sync', 'Sinkron')}</span>
            </NavLink>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Settings className="h-4.5 w-4.5" />
            <span>{t('nav.settings', 'Pengaturan')}</span>
          </NavLink>
        </nav>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
