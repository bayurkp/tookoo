import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  SlidersHorizontal,
  RefreshCw,
  Settings,
  ChevronRight,
  DollarSign,
  CreditCard,
  Download,
  Store,
  Printer,
  Palette,
  Shield,
  LayoutGrid,
  Tag,
  Database,
  Wallet,
  Users,
  Building2,
  Clock,
  Folder,
  Scale,
  Sparkles,
  Layers,
  ShoppingBag,
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

  // Active domain state checkers
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

  const isProductsActive = location.pathname.startsWith('/products');

  const isInventoryActive =
    location.pathname.startsWith('/inventory') || location.pathname.startsWith('/expenses');

  const isReportsActive = location.pathname.startsWith('/reports');

  const isSystemActive =
    location.pathname.startsWith('/sync') || location.pathname.startsWith('/settings');

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
          /* 2. ADVANCED / PRO MODE: COLLAPSIBLE GROUP LABELS WITH INDIVIDUAL BUTTONS */
          /* ========================================================================= */
          <>
            {/* 1. DASBOR (SATU ITEM MANDIRI PALING ATAS) */}
            <SidebarGroup className="py-1">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/dashboard'}
                      tooltip="Dasbor Toko"
                    >
                      <NavLink to="/dashboard">
                        <LayoutDashboard />
                        <span className="font-bold">Dasbor</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* 2. PENJUALAN (COLLAPSIBLE GROUP TITLE) */}
            <SidebarGroup className="py-1">
              <Collapsible defaultOpen={isSalesActive} className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer select-none">
                    <span>Penjualan</span>
                    <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
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
                          isActive={location.pathname.startsWith('/shifts')}
                          tooltip="Shift & Uang Kas"
                        >
                          <NavLink
                            to="/shifts"
                            className="flex items-center justify-between w-full"
                          >
                            <div className="flex items-center gap-2">
                              <Clock />
                              <span>Shift & Uang Kas</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[8px] px-1 py-0 h-3.5 text-muted-foreground border-muted-foreground/30 font-medium"
                            >
                              Segera
                            </Badge>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>

            {/* 3. DATA TOKO (COLLAPSIBLE GROUP TITLE DENGAN FLOW BISNIS LENGKAP) */}
            <SidebarGroup className="py-1">
              <Collapsible defaultOpen={isStoreDataActive} className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer select-none">
                    <span>Data Toko</span>
                    <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      {/* 1. Profil Toko */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname.startsWith('/store-profile')}
                          tooltip="Profil Toko"
                        >
                          <NavLink to="/store-profile">
                            <Store />
                            <span>Profil Toko</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* 2. Produk & Menu (Collapsible Nested MenuItem) */}
                      <Collapsible defaultOpen={isProductsActive} className="group/nested">
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton isActive={isProductsActive} tooltip="Produk & Menu">
                              <Package />
                              <span>Produk & Menu</span>
                              <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/nested:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    location.pathname === '/products' &&
                                    (!currentTab || currentTab === 'products')
                                  }
                                >
                                  <NavLink to="/products?tab=products">
                                    <Package className="size-3.5" />
                                    <span>Daftar Produk</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'categories'
                                  }
                                >
                                  <NavLink to="/products?tab=categories">
                                    <Folder className="size-3.5" />
                                    <span>Kategori</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'uom'
                                  }
                                >
                                  <NavLink to="/products?tab=uom">
                                    <Scale className="size-3.5" />
                                    <span>Satuan (UOM)</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'variants'
                                  }
                                >
                                  <NavLink to="/products?tab=variants">
                                    <Sparkles className="size-3.5" />
                                    <span>Varian Produk</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'modifiers'
                                  }
                                >
                                  <NavLink to="/products?tab=modifiers">
                                    <Layers className="size-3.5" />
                                    <span>Opsi Tambahan (Modifier)</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>

                      {/* 3. Diskon & Promosi */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname.startsWith('/discounts')}
                          tooltip="Diskon & Promosi"
                        >
                          <NavLink to="/discounts">
                            <Tag />
                            <span>Diskon & Promosi</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* 4. Pajak & Biaya Layanan */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname.startsWith('/taxes')}
                          tooltip="Pajak & Biaya Layanan"
                        >
                          <NavLink to="/taxes">
                            <Receipt />
                            <span>Pajak & Biaya Layanan</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* 5. Pelanggan & Member */}
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

                      {/* 6. Pemasok & Vendor */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname.startsWith('/suppliers')}
                          tooltip="Pemasok & Vendor"
                        >
                          <NavLink to="/suppliers">
                            <Building2 />
                            <span>Pemasok & Vendor</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* 7. Denah Meja */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            location.pathname.startsWith('/tables') ||
                            location.pathname.startsWith('/layout')
                          }
                          tooltip="Denah Meja"
                        >
                          <NavLink to="/tables">
                            <LayoutGrid />
                            <span>Denah Meja</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* 8. Desain Nota & Struk */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname.startsWith('/receipt-settings')}
                          tooltip="Desain Nota & Struk"
                        >
                          <NavLink to="/receipt-settings">
                            <Printer />
                            <span>Desain Nota & Struk</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>

            {/* 4. AKUNTANSI & INVENTARIS (COLLAPSIBLE GROUP TITLE) */}
            <SidebarGroup className="py-1">
              <Collapsible defaultOpen={isInventoryActive} className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer select-none">
                    <span>Akuntansi & Inventaris</span>
                    <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            location.pathname === '/expenses' && currentType !== 'PURCHASE_STOCK'
                          }
                          tooltip="Pengeluaran Kas (Expenses)"
                        >
                          <NavLink to="/expenses">
                            <Wallet />
                            <span>Pengeluaran Kas (Expenses)</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            location.pathname === '/expenses' && currentType === 'PURCHASE_STOCK'
                          }
                          tooltip="Pembelian Stok (PO)"
                        >
                          <NavLink to="/expenses?type=PURCHASE_STOCK">
                            <ShoppingBag />
                            <span>Pembelian Stok (PO)</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname.startsWith('/inventory/adjustments')}
                          tooltip="Penyesuaian Stok (Opname)"
                        >
                          <NavLink to="/inventory/adjustments">
                            <SlidersHorizontal />
                            <span>Penyesuaian Stok (Opname)</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>

            {/* 5. LAPORAN & ANALITIK (COLLAPSIBLE GROUP TITLE) */}
            <SidebarGroup className="py-1">
              <Collapsible defaultOpen={isReportsActive} className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer select-none">
                    <span>Laporan & Analitik</span>
                    <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            location.pathname === '/reports' &&
                            (!currentTab || currentTab === 'pnl')
                          }
                          tooltip="Laba & Rugi (P&L)"
                        >
                          <NavLink to="/reports?tab=pnl">
                            <DollarSign />
                            <span>Laba & Rugi (P&L)</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/reports' && currentTab === 'products'}
                          tooltip="Penjualan Produk"
                        >
                          <NavLink to="/reports?tab=products">
                            <Package />
                            <span>Penjualan Produk</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/reports' && currentTab === 'payments'}
                          tooltip="Metode Pembayaran"
                        >
                          <NavLink to="/reports?tab=payments">
                            <CreditCard />
                            <span>Metode Pembayaran</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/reports' && currentTab === 'export'}
                          tooltip="Ekspor & Tutup Buku"
                        >
                          <NavLink to="/reports?tab=export">
                            <Download />
                            <span>Ekspor & Tutup Buku</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>

            {/* 6. SISTEM & PENGATURAN (COLLAPSIBLE GROUP TITLE) */}
            <SidebarGroup className="py-1">
              <Collapsible defaultOpen={isSystemActive} className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer select-none">
                    <span>Sistem</span>
                    <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname.startsWith('/sync')}
                          tooltip="Sinkronisasi Perangkat (P2P)"
                        >
                          <NavLink to="/sync">
                            <RefreshCw />
                            <span>Sinkronisasi Perangkat (P2P)</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            location.pathname === '/settings' &&
                            (!currentTab || currentTab === 'appearance')
                          }
                          tooltip="Tampilan & Suara"
                        >
                          <NavLink to="/settings?tab=appearance">
                            <Palette />
                            <span>Tampilan & Suara</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/settings' && currentTab === 'security'}
                          tooltip="Keamanan & Hak Akses"
                        >
                          <NavLink to="/settings?tab=security">
                            <Shield />
                            <span>Keamanan & Hak Akses</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/settings' && currentTab === 'data'}
                          tooltip="Cadangkan & Reset Data"
                        >
                          <NavLink to="/settings?tab=data">
                            <Database />
                            <span>Cadangkan & Reset Data</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          </>
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
