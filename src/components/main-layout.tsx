import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  Package,
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
import { useOnlineStatus } from '@/hooks/use-online-status';
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
  const isOnline = useOnlineStatus();
  const location = useLocation();

  // Dynamic breadcrumb label resolution using i18n
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') {
      return { group: t('nav.groups.sales', 'Penjualan'), title: t('nav.items.cashier', 'Kasir') };
    }
    if (path.startsWith('/orders')) {
      return {
        group: t('nav.groups.sales', 'Penjualan'),
        title: t('nav.items.orders', 'Riwayat Transaksi'),
      };
    }
    if (path.startsWith('/shifts')) {
      return {
        group: t('nav.groups.sales', 'Penjualan'),
        title: t('nav.items.shifts', 'Shift & Uang Kas'),
      };
    }
    if (path.startsWith('/dashboard')) {
      return {
        group: t('nav.items.dashboard', 'Dasbor'),
        title: t('dashboard.summary', 'Ringkasan Bisnis'),
      };
    }
    if (path.startsWith('/store-profile')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.storeProfile', 'Profil Toko'),
      };
    }
    if (path.startsWith('/products')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.productCatalog', 'Katalog Produk & Menu'),
      };
    }
    if (path.startsWith('/discounts')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.discounts', 'Diskon & Promosi'),
      };
    }
    if (path.startsWith('/taxes')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.taxes', 'Pajak & Biaya Layanan'),
      };
    }
    if (path.startsWith('/customers')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.customers', 'Pelanggan & Member'),
      };
    }
    if (path.startsWith('/suppliers')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.suppliers', 'Pemasok & Vendor'),
      };
    }
    if (path.startsWith('/tables') || path.startsWith('/layout')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.tables', 'Denah Meja'),
      };
    }
    if (path.startsWith('/receipt-settings')) {
      return {
        group: t('nav.groups.storeData', 'Data Toko'),
        title: t('nav.items.receiptSettings', 'Desain Nota & Struk'),
      };
    }
    if (path.startsWith('/expenses')) {
      return {
        group: t('nav.groups.accounting', 'Akuntansi & Inventaris'),
        title: t('nav.items.expenses', 'Pengeluaran Kas'),
      };
    }
    if (path.startsWith('/inventory')) {
      return {
        group: t('nav.groups.accounting', 'Akuntansi & Inventaris'),
        title: t('nav.items.inventoryAdjustments', 'Penyesuaian Stok (Opname)'),
      };
    }
    if (path.startsWith('/reports')) {
      return {
        group: t('nav.groups.reports', 'Laporan & Analitik'),
        title: t('reports.title', 'Laporan Bisnis'),
      };
    }
    if (path.startsWith('/sync')) {
      return {
        group: t('nav.groups.system', 'Sistem'),
        title: t('nav.items.p2pSync', 'Sinkronisasi Perangkat (P2P)'),
      };
    }
    if (path.startsWith('/settings')) {
      return {
        group: t('nav.groups.system', 'Sistem'),
        title: t('nav.settings', 'Pengaturan Sistem'),
      };
    }

    return { group: 'Tookoo POS', title: 'Halaman' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen h-[100dvh] w-full bg-background text-foreground overflow-hidden">
        {/* Desktop Collapsible AppSidebar */}
        <AppSidebar />

        {/* Main Application Area */}
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
              {/* App Mode Switcher */}
              <AppModeSwitcher variant="header" />
              <HeaderStatusBadge isOnline={isOnline} peerCount={0} />
            </div>
          </header>

          {/* Dynamic Page Router Outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 bg-background">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation Bar */}
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
              <span>{t('nav.items.tables', 'Meja')}</span>
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
            <span>{t('nav.items.expenses', 'Biaya')}</span>
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
