import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  TrendingUp,
  Settings,
  ChevronRight,
  Store,
  Wallet,
  Users,
  Laptop,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuthStore } from '@/stores/auth-store';
import { useAppMode } from '@/hooks/use-app-mode';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppModeSwitcher } from '@/components/app-mode-switcher';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const currentRole = useAuthStore((state) => state.currentRole);
  const { isSimple } = useAppMode();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const currentType = searchParams.get('type');

  // Fetch current store settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  const storeName = settings?.storeName || 'Tookoo POS';
  const deviceName = settings?.deviceName || 'Terminal Kasir';

  const roleLabel =
    currentRole === 'OWNER' ? 'Pemilik Toko' : currentRole === 'MANAGER' ? 'Manajer Toko' : 'Kasir';

  // Active domain states
  const isSalesActive =
    location.pathname === '/' ||
    location.pathname.startsWith('/orders') ||
    location.pathname.startsWith('/shifts');

  const isStoreDataActive =
    location.pathname.startsWith('/store-profile') ||
    location.pathname.startsWith('/products') ||
    location.pathname.startsWith('/discounts') ||
    location.pathname.startsWith('/taxes') ||
    location.pathname.startsWith('/customers') ||
    location.pathname.startsWith('/suppliers') ||
    location.pathname.startsWith('/tables') ||
    location.pathname.startsWith('/receipt-settings');

  const isInventoryActive =
    location.pathname.startsWith('/inventory') || location.pathname.startsWith('/expenses');

  const isReportsActive = location.pathname.startsWith('/reports');

  const isSystemActive =
    location.pathname.startsWith('/sync') || location.pathname.startsWith('/settings');

  // Sub-item active status detector
  const isSubItemActive = (url: string) => {
    if (url === '/') {
      return location.pathname === '/';
    }
    if (url.includes('?')) {
      const [path, query] = url.split('?');
      const params = new URLSearchParams(query);
      const expectedTab = params.get('tab');
      const expectedType = params.get('type');

      if (expectedTab) {
        return location.pathname === path && currentTab === expectedTab;
      }
      if (expectedType) {
        return location.pathname === path && currentType === expectedType;
      }
      return location.pathname === path;
    }
    return location.pathname.startsWith(url);
  };

  const navMain = [
    {
      title: 'Penjualan',
      icon: ShoppingCart,
      isActive: isSalesActive,
      items: [
        { title: 'Kasir (POS)', url: '/' },
        { title: 'Riwayat Transaksi', url: '/orders' },
        { title: 'Shift & Uang Kas', url: '/shifts', badge: 'Segera' },
      ],
    },
    {
      title: 'Data Toko',
      icon: Store,
      isActive: isStoreDataActive,
      items: [
        { title: 'Profil Toko', url: '/store-profile' },
        { title: 'Katalog Produk & Menu', url: '/products' },
        { title: 'Diskon & Promosi', url: '/discounts' },
        { title: 'Pajak & Biaya Layanan', url: '/taxes' },
        { title: 'Pelanggan & Member', url: '/customers' },
        { title: 'Pemasok & Vendor', url: '/suppliers' },
        { title: 'Denah Meja', url: '/tables' },
        { title: 'Desain Nota & Struk', url: '/receipt-settings' },
      ],
    },
    {
      title: 'Akuntansi & Inventaris',
      icon: Wallet,
      isActive: isInventoryActive,
      items: [
        { title: 'Pengeluaran Kas (Expenses)', url: '/expenses' },
        { title: 'Pembelian Stok (PO)', url: '/expenses?type=PURCHASE_STOCK' },
        { title: 'Penyesuaian Stok (Opname)', url: '/inventory/adjustments' },
      ],
    },
    {
      title: 'Laporan & Analitik',
      icon: TrendingUp,
      isActive: isReportsActive,
      items: [
        { title: 'Laba & Rugi (P&L)', url: '/reports?tab=pnl' },
        { title: 'Penjualan Produk', url: '/reports?tab=products' },
        { title: 'Metode Pembayaran', url: '/reports?tab=payments' },
        { title: 'Ekspor & Tutup Buku', url: '/reports?tab=export' },
      ],
    },
    {
      title: 'Sistem',
      icon: Settings,
      isActive: isSystemActive,
      items: [
        { title: 'Sinkronisasi Perangkat (P2P)', url: '/sync' },
        { title: 'Tampilan & Suara', url: '/settings?tab=appearance' },
        { title: 'Keamanan & Hak Akses', url: '/settings?tab=security' },
        { title: 'Cadangkan & Reset Data', url: '/settings?tab=data' },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      {/* Sidebar Header: Store & Terminal Identity */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-xs">
                {storeName.charAt(0).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-bold text-foreground">{storeName}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 font-semibold h-3.5">
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content: Navigation Sections */}
      <SidebarContent className="px-2">
        {/* ========================================================================= */}
        {/* 1. SIMPLE MODE NAVIGATION (Fast, Focused Essential Menus) */}
        {/* ========================================================================= */}
        {isSimple ? (
          <SidebarGroup>
            <SidebarGroupLabel>Menu Kasir</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/'}
                    tooltip="Kasir (POS)"
                  >
                    <NavLink to="/">
                      <ShoppingCart />
                      <span>Kasir (POS)</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/orders')}
                    tooltip="Riwayat Transaksi"
                  >
                    <NavLink to="/orders">
                      <Receipt />
                      <span>Riwayat Transaksi</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/products')}
                    tooltip="Produk & Menu"
                  >
                    <NavLink to="/products">
                      <Package />
                      <span>Produk & Menu</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/customers')}
                    tooltip="Pelanggan & Member"
                  >
                    <NavLink to="/customers">
                      <Users />
                      <span>Pelanggan & Member</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/expenses')}
                    tooltip="Biaya Operasional"
                  >
                    <NavLink to="/expenses">
                      <Wallet />
                      <span>Biaya Operasional</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/settings')}
                    tooltip="Pengaturan Toko"
                  >
                    <NavLink to="/settings">
                      <Settings />
                      <span>Pengaturan Toko</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          /* ========================================================================= */
          /* 2. ADVANCED / PRO MODE: SHADCN/UI NAVMAIN PATTERN WITH SUB-TREE BORDERS */
          /* ========================================================================= */
          <SidebarGroup>
            <SidebarGroupLabel>Menu Aplikasi</SidebarGroupLabel>
            <SidebarMenu>
              {/* 1. Dasbor Toko (Single Item) */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/dashboard'}
                  tooltip="Dasbor"
                >
                  <NavLink to="/dashboard">
                    <LayoutDashboard />
                    <span>Dasbor</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 2. Collapsible NavMain Items */}
              {navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubItemActive(subItem.url)}>
                              <NavLink
                                to={subItem.url}
                                className="flex items-center justify-between w-full"
                              >
                                <span className="truncate">{subItem.title}</span>
                                {subItem.badge && (
                                  <Badge
                                    variant="outline"
                                    className="text-[8px] px-1 py-0 h-3.5 text-muted-foreground border-muted-foreground/30 font-medium shrink-0 ml-1"
                                  >
                                    {subItem.badge}
                                  </Badge>
                                )}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sidebar Footer: App Mode Switcher & Device Details */}
      <SidebarFooter className="p-3 border-t">
        <AppModeSwitcher variant="sidebar" />

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Laptop className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] font-medium text-foreground truncate" title={deviceName}>
              {deviceName}
            </span>
          </div>
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Tookoo POS • 100% Offline P2P
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
