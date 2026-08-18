import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  SlidersHorizontal,
  TrendingUp,
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

  // Active state checkers
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
          </SidebarGroup>
        ) : (
          /* ========================================================================= */
          /* 2. ADVANCED / PRO MODE: 100% COLLAPSIBLE ENTERPRISE DOMAIN HIERARCHY */
          /* ========================================================================= */
          <>
            {/* 1. DASBOR (SATU ITEM MANDIRI DI ATAS) */}
            <SidebarGroup className="py-1">
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
            </SidebarGroup>

            {/* 2. PENJUALAN (COLLAPSIBLE) */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Penjualan</SidebarGroupLabel>
              <SidebarMenu>
                <Collapsible defaultOpen={isSalesActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isSalesActive} tooltip="Penjualan">
                        <ShoppingCart />
                        <span>Penjualan</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={location.pathname === '/'}>
                            <NavLink to="/">
                              <ShoppingCart className="size-3.5" />
                              <span>Kasir (POS)</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/orders')}
                          >
                            <NavLink to="/orders">
                              <Receipt className="size-3.5" />
                              <span>Riwayat Transaksi</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/shifts')}
                          >
                            <NavLink
                              to="/shifts"
                              className="flex items-center justify-between w-full"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="size-3.5" />
                                <span>Shift & Uang Kas</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[8px] px-1 py-0 h-3.5 text-muted-foreground border-muted-foreground/30 font-medium"
                              >
                                Segera
                              </Badge>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>

            {/* 3. DATA TOKO (COLLAPSIBLE DENGAN FLOW BISNIS & NESTED PRODUK) */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Data Toko</SidebarGroupLabel>
              <SidebarMenu>
                <Collapsible defaultOpen={isStoreDataActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isStoreDataActive} tooltip="Data Toko">
                        <Store />
                        <span>Data Toko</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* 1. Profil Toko */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/store-profile')}
                          >
                            <NavLink to="/store-profile">
                              <Store className="size-3.5" />
                              <span>Profil Toko</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* 2. Produk & Menu (Nested Collapsible) */}
                        <SidebarMenuSubItem>
                          <Collapsible defaultOpen={isProductsActive} className="group/nested">
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton
                                isActive={isProductsActive}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <Package className="size-3.5" />
                                  <span>Produk & Menu</span>
                                </div>
                                <ChevronRight className="size-3 transition-transform duration-200 group-data-[state=open]/nested:rotate-90" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-3 pl-2 border-l border-border/60 my-0.5 space-y-0.5">
                                <SidebarMenuSubButton
                                  asChild
                                  size="sm"
                                  isActive={
                                    location.pathname === '/products' &&
                                    (!currentTab || currentTab === 'products')
                                  }
                                >
                                  <NavLink to="/products?tab=products">
                                    <Package className="size-3" />
                                    <span>Daftar Produk</span>
                                  </NavLink>
                                </SidebarMenuSubButton>

                                <SidebarMenuSubButton
                                  asChild
                                  size="sm"
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'categories'
                                  }
                                >
                                  <NavLink to="/products?tab=categories">
                                    <Folder className="size-3" />
                                    <span>Kategori</span>
                                  </NavLink>
                                </SidebarMenuSubButton>

                                <SidebarMenuSubButton
                                  asChild
                                  size="sm"
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'uom'
                                  }
                                >
                                  <NavLink to="/products?tab=uom">
                                    <Scale className="size-3" />
                                    <span>Satuan (UOM)</span>
                                  </NavLink>
                                </SidebarMenuSubButton>

                                <SidebarMenuSubButton
                                  asChild
                                  size="sm"
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'variants'
                                  }
                                >
                                  <NavLink to="/products?tab=variants">
                                    <Sparkles className="size-3" />
                                    <span>Varian Produk</span>
                                  </NavLink>
                                </SidebarMenuSubButton>

                                <SidebarMenuSubButton
                                  asChild
                                  size="sm"
                                  isActive={
                                    location.pathname === '/products' && currentTab === 'modifiers'
                                  }
                                >
                                  <NavLink to="/products?tab=modifiers">
                                    <Layers className="size-3" />
                                    <span>Opsi Tambahan (Modifier)</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuSubItem>

                        {/* 3. Diskon & Promosi */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/discounts')}
                          >
                            <NavLink to="/discounts">
                              <Tag className="size-3.5" />
                              <span>Diskon & Promosi</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* 4. Pajak & Biaya Layanan */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/taxes')}
                          >
                            <NavLink to="/taxes">
                              <Receipt className="size-3.5" />
                              <span>Pajak & Biaya Layanan</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* 5. Pelanggan & Member */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/customers')}
                          >
                            <NavLink to="/customers">
                              <Users className="size-3.5" />
                              <span>Pelanggan & Member</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* 6. Pemasok & Vendor */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/suppliers')}
                          >
                            <NavLink to="/suppliers">
                              <Building2 className="size-3.5" />
                              <span>Pemasok & Vendor</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* 7. Denah Meja */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              location.pathname.startsWith('/tables') ||
                              location.pathname.startsWith('/layout')
                            }
                          >
                            <NavLink to="/tables">
                              <LayoutGrid className="size-3.5" />
                              <span>Denah Meja</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* 8. Desain Nota & Struk */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/receipt-settings')}
                          >
                            <NavLink to="/receipt-settings">
                              <Printer className="size-3.5" />
                              <span>Desain Nota & Struk</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>

            {/* 4. AKUNTANSI & INVENTARIS (COLLAPSIBLE) */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Akuntansi & Inventaris</SidebarGroupLabel>
              <SidebarMenu>
                <Collapsible defaultOpen={isInventoryActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isInventoryActive}
                        tooltip="Akuntansi & Inventaris"
                      >
                        <Wallet />
                        <span>Akuntansi & Inventaris</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              location.pathname === '/expenses' && currentType !== 'PURCHASE_STOCK'
                            }
                          >
                            <NavLink to="/expenses">
                              <Wallet className="size-3.5" />
                              <span>Pengeluaran Kas (Expenses)</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              location.pathname === '/expenses' && currentType === 'PURCHASE_STOCK'
                            }
                          >
                            <NavLink to="/expenses?type=PURCHASE_STOCK">
                              <ShoppingBag className="size-3.5" />
                              <span>Pembelian Stok (PO)</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/inventory/adjustments')}
                          >
                            <NavLink to="/inventory/adjustments">
                              <SlidersHorizontal className="size-3.5" />
                              <span>Penyesuaian Stok (Opname)</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>

            {/* 5. LAPORAN & ANALITIK (COLLAPSIBLE) */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Laporan & Analitik</SidebarGroupLabel>
              <SidebarMenu>
                <Collapsible defaultOpen={isReportsActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isReportsActive} tooltip="Laporan & Analitik">
                        <TrendingUp />
                        <span>Laporan & Analitik</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              location.pathname === '/reports' &&
                              (!currentTab || currentTab === 'pnl')
                            }
                          >
                            <NavLink to="/reports?tab=pnl">
                              <DollarSign className="size-3.5" />
                              <span>Laba & Rugi (P&L)</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === '/reports' && currentTab === 'products'}
                          >
                            <NavLink to="/reports?tab=products">
                              <Package className="size-3.5" />
                              <span>Penjualan Produk</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === '/reports' && currentTab === 'payments'}
                          >
                            <NavLink to="/reports?tab=payments">
                              <CreditCard className="size-3.5" />
                              <span>Metode Pembayaran</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === '/reports' && currentTab === 'export'}
                          >
                            <NavLink to="/reports?tab=export">
                              <Download className="size-3.5" />
                              <span>Ekspor & Tutup Buku</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>

            {/* 6. SISTEM & PENGATURAN (COLLAPSIBLE) */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Sistem</SidebarGroupLabel>
              <SidebarMenu>
                <Collapsible defaultOpen={isSystemActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isSystemActive} tooltip="Sistem & Pengaturan">
                        <Settings />
                        <span>Sistem</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith('/sync')}
                          >
                            <NavLink to="/sync">
                              <RefreshCw className="size-3.5" />
                              <span>Sinkronisasi Perangkat (P2P)</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              location.pathname === '/settings' &&
                              (!currentTab || currentTab === 'appearance')
                            }
                          >
                            <NavLink to="/settings?tab=appearance">
                              <Palette className="size-3.5" />
                              <span>Tampilan & Suara</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              location.pathname === '/settings' && currentTab === 'security'
                            }
                          >
                            <NavLink to="/settings?tab=security">
                              <Shield className="size-3.5" />
                              <span>Keamanan & Hak Akses</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === '/settings' && currentTab === 'data'}
                          >
                            <NavLink to="/settings?tab=data">
                              <Database className="size-3.5" />
                              <span>Cadangkan & Reset Data</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
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
