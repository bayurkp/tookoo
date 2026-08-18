import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Store,
  Tag,
  Users,
  Building2,
  LayoutGrid,
  Printer,
  Wallet,
  ShoppingBag,
  SlidersHorizontal,
  DollarSign,
  CreditCard,
  Download,
  RefreshCw,
  Palette,
  Shield,
  Database,
  ChevronRight,
  Clock,
  Settings,
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';

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

  const isProductsActive = location.pathname.startsWith('/products');

  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      {/* Sidebar Header: Store & Terminal Identity */}
      <SidebarHeader className="p-2">
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

      {/* Sidebar Content: Navigation Groups */}
      <SidebarContent>
        {isSimple ? (
          /* 1. SIMPLE MODE NAVIGATION */
          <SidebarGroup>
            <SidebarGroupLabel>Menu Kasir</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/'} tooltip="Kasir">
                    <NavLink to="/">
                      <ShoppingCart />
                      <span>Kasir</span>
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
          /* 2. ADVANCED / PRO MODE: 1-LEVEL UP MAIN BUTTON GROUPS */
          <>
            {/* DASBOR (Item Mandiri di Paling Atas) */}
            <SidebarGroup className="py-1">
              <SidebarMenu>
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
              </SidebarMenu>
            </SidebarGroup>

            {/* GRUP 1: PENJUALAN */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Penjualan</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/'} tooltip="Kasir">
                    <NavLink to="/">
                      <ShoppingCart />
                      <span>Kasir</span>
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
                    <NavLink to="/shifts">
                      <Clock />
                      <span>Shift & Uang Kas</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* GRUP 2: DATA TOKO */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Data Toko</SidebarGroupLabel>
              <SidebarMenu>
                {/* Profil Toko */}
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

                {/* Katalog Produk & Menu (Collapsible dengan detail lengkap) */}
                <Collapsible defaultOpen={isProductsActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isProductsActive}
                      tooltip="Katalog Produk & Menu"
                    >
                      <NavLink to="/products">
                        <Package />
                        <span>Katalog Produk & Menu</span>
                      </NavLink>
                    </SidebarMenuButton>

                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle Produk</span>
                      </SidebarMenuAction>
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
                              <span>Kategori</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === '/products' && currentTab === 'uom'}
                          >
                            <NavLink to="/products?tab=uom">
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
                              <span>Opsi Tambahan (Modifier)</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                {/* Diskon & Promosi */}
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

                {/* Pajak & Biaya Layanan */}
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

                {/* Pelanggan & Member */}
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

                {/* Pemasok & Vendor */}
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

                {/* Denah Meja */}
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

                {/* Desain Nota & Struk */}
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
            </SidebarGroup>

            {/* GRUP 3: AKUNTANSI & INVENTARIS */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Akuntansi & Inventaris</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/expenses' && currentType !== 'PURCHASE_STOCK'}
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
                    isActive={location.pathname === '/expenses' && currentType === 'PURCHASE_STOCK'}
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
            </SidebarGroup>

            {/* GRUP 4: LAPORAN & ANALITIK */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Laporan & Analitik</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === '/reports' && (!currentTab || currentTab === 'pnl')
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
            </SidebarGroup>

            {/* GRUP 5: SISTEM */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>Sistem</SidebarGroupLabel>
              <SidebarMenu>
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
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Sidebar Footer: NavUser Profile Dropdown */}
      <SidebarFooter className="p-2 border-t">
        <NavUser
          user={{
            name: storeName,
            role: roleLabel,
            deviceName: deviceName,
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
