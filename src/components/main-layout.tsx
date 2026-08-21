import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeaderStatusBadge } from '@/components/header-status-badge';
import { AppModeSwitcher } from '@/components/app-mode-switcher';
import { AppSidebar } from '@/components/app-sidebar';
import { useOnlineStatus } from '@/hooks/use-online-status';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
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
  const isOnline = useOnlineStatus();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') {
      return { group: t('nav.groups.sales', 'Penjualan'), title: t('nav.items.cashier', 'Kasir') };
    }
    if (path.startsWith('/products')) {
      return {
        group: t('nav.groups.catalog', 'Katalog & Stok'),
        title: t('nav.items.products', 'Daftar Produk'),
      };
    }
    if (path.startsWith('/orders')) {
      return {
        group: t('nav.groups.sales', 'Penjualan'),
        title: t('nav.items.orders', 'Riwayat Transaksi'),
      };
    }
    if (path.startsWith('/tables')) {
      return { group: t('nav.groups.pos', 'Operasional'), title: t('nav.items.tables', 'Denah Meja') };
    }
    if (path.startsWith('/expenses')) {
      return {
        group: t('nav.groups.finance', 'Keuangan'),
        title: t('nav.items.expenses', 'Pengeluaran Kas'),
      };
    }
    if (path.startsWith('/suppliers')) {
      return {
        group: t('nav.groups.catalog', 'Katalog & Stok'),
        title: t('nav.items.suppliers', 'Pemasok & PO'),
      };
    }
    if (path.startsWith('/customers')) {
      return {
        group: t('nav.groups.crm', 'Pelanggan'),
        title: t('nav.items.customers', 'Manajemen Pelanggan'),
      };
    }
    if (path.startsWith('/discounts')) {
      return {
        group: t('nav.groups.crm', 'Pelanggan'),
        title: t('nav.items.discounts', 'Diskon & Promo'),
      };
    }
    if (path.startsWith('/reports')) {
      return {
        group: t('nav.groups.reports', 'Laporan'),
        title: t('nav.items.reports', 'Laporan Lengkap'),
      };
    }
    if (path.startsWith('/sync')) {
      return {
        group: t('nav.groups.settings', 'Sistem'),
        title: t('nav.items.sync', 'Sinkronisasi P2P'),
      };
    }
    if (path.startsWith('/settings')) {
      return {
        group: t('nav.groups.settings', 'Sistem'),
        title: t('nav.items.settings', 'Pengaturan Toko'),
      };
    }
    return { group: t('nav.groups.pos', 'POS'), title: 'Tookoo' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <SidebarProvider className="h-screen w-screen overflow-hidden bg-background">
      {/* Collapsible Application Sidebar (Desktop & Mobile Drawer) */}
      <AppSidebar />

      {/* Primary Page Inset Frame */}
      <SidebarInset className="flex flex-col flex-1 h-full overflow-hidden min-w-0">
        {/* Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-card">
          <div className="flex items-center gap-2 overflow-hidden">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{breadcrumb.group}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">{breadcrumb.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <span className="sm:hidden font-semibold text-sm truncate">{breadcrumb.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <AppModeSwitcher variant="header" />
            <HeaderStatusBadge isOnline={isOnline} peerCount={0} />
          </div>
        </header>

        {/* Dynamic Page Router Outlet */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
