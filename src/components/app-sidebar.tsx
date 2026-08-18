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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const location = useLocation();
  const currentRole = useAuthStore((state) => state.currentRole);
  const { isSimple } = useAppMode();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const currentType = searchParams.get('type');

  // Fetch active store settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  const storeName = settings?.storeName || 'Tookoo POS';
  const deviceName = settings?.deviceName || 'Terminal Kasir';

  const roleLabel =
    currentRole === 'OWNER'
      ? t('auth.roles.owner', 'Pemilik Toko')
      : currentRole === 'MANAGER'
        ? t('auth.roles.manager', 'Manajer Toko')
        : t('auth.roles.cashier', 'Kasir');

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
          /* Simple Mode Navigation */
          <SidebarGroup>
            <SidebarGroupLabel>{t('nav.cashier', 'Kasir')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/'}
                    tooltip={t('nav.items.cashier', 'Kasir')}
                  >
                    <NavLink to="/">
                      <ShoppingCart />
                      <span>{t('nav.items.cashier', 'Kasir')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/orders')}
                    tooltip={t('nav.items.orders', 'Riwayat Transaksi')}
                  >
                    <NavLink to="/orders">
                      <Receipt />
                      <span>{t('nav.items.orders', 'Riwayat Transaksi')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/products')}
                    tooltip={t('nav.items.productCatalog', 'Produk & Menu')}
                  >
                    <NavLink to="/products">
                      <Package />
                      <span>{t('nav.items.productCatalog', 'Produk & Menu')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/customers')}
                    tooltip={t('nav.items.customers', 'Pelanggan & Member')}
                  >
                    <NavLink to="/customers">
                      <Users />
                      <span>{t('nav.items.customers', 'Pelanggan & Member')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/expenses')}
                    tooltip={t('nav.items.expenses', 'Biaya Operasional')}
                  >
                    <NavLink to="/expenses">
                      <Wallet />
                      <span>{t('nav.items.expenses', 'Biaya Operasional')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/settings')}
                    tooltip={t('nav.settings', 'Pengaturan')}
                  >
                    <NavLink to="/settings">
                      <Settings />
                      <span>{t('nav.settings', 'Pengaturan')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          /* Advanced / Pro Mode Navigation */
          <>
            {/* Dashboard Standalone Item */}
            <SidebarGroup className="py-1">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/dashboard'}
                    tooltip={t('nav.items.dashboard', 'Dasbor')}
                  >
                    <NavLink to="/dashboard">
                      <LayoutDashboard />
                      <span>{t('nav.items.dashboard', 'Dasbor')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Domain Group 1: Sales */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>{t('nav.groups.sales', 'Penjualan')}</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/'}
                    tooltip={t('nav.items.cashier', 'Kasir')}
                  >
                    <NavLink to="/">
                      <ShoppingCart />
                      <span>{t('nav.items.cashier', 'Kasir')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/orders')}
                    tooltip={t('nav.items.orders', 'Riwayat Transaksi')}
                  >
                    <NavLink to="/orders">
                      <Receipt />
                      <span>{t('nav.items.orders', 'Riwayat Transaksi')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/shifts')}
                    tooltip={t('nav.items.shifts', 'Shift & Uang Kas')}
                  >
                    <NavLink to="/shifts">
                      <Clock />
                      <span>{t('nav.items.shifts', 'Shift & Uang Kas')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Domain Group 2: Store Data */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>{t('nav.groups.storeData', 'Data Toko')}</SidebarGroupLabel>
              <SidebarMenu>
                {/* Store Profile */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/store-profile')}
                    tooltip={t('nav.items.storeProfile', 'Profil Toko')}
                  >
                    <NavLink to="/store-profile">
                      <Store />
                      <span>{t('nav.items.storeProfile', 'Profil Toko')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Collapsible Product Catalog */}
                <Collapsible defaultOpen={isProductsActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isProductsActive}
                      tooltip={t('nav.items.productCatalog', 'Katalog Produk & Menu')}
                    >
                      <NavLink to="/products">
                        <Package />
                        <span>{t('nav.items.productCatalog', 'Katalog Produk & Menu')}</span>
                      </NavLink>
                    </SidebarMenuButton>

                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
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
                              <span>{t('nav.items.productsList', 'Daftar Produk')}</span>
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
                              <span>{t('nav.items.categories', 'Kategori')}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === '/products' && currentTab === 'uom'}
                          >
                            <NavLink to="/products?tab=uom">
                              <span>{t('nav.items.uom', 'Satuan (UOM)')}</span>
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
                              <span>{t('nav.items.variants', 'Varian Produk')}</span>
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
                              <span>{t('nav.items.modifiers', 'Opsi Tambahan (Modifier)')}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                {/* Discounts & Promotions */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/discounts')}
                    tooltip={t('nav.items.discounts', 'Diskon & Promosi')}
                  >
                    <NavLink to="/discounts">
                      <Tag />
                      <span>{t('nav.items.discounts', 'Diskon & Promosi')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Taxes & Service Charge */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/taxes')}
                    tooltip={t('nav.items.taxes', 'Pajak & Biaya Layanan')}
                  >
                    <NavLink to="/taxes">
                      <Receipt />
                      <span>{t('nav.items.taxes', 'Pajak & Biaya Layanan')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Customers & Members */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/customers')}
                    tooltip={t('nav.items.customers', 'Pelanggan & Member')}
                  >
                    <NavLink to="/customers">
                      <Users />
                      <span>{t('nav.items.customers', 'Pelanggan & Member')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Suppliers & Vendors */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/suppliers')}
                    tooltip={t('nav.items.suppliers', 'Pemasok & Vendor')}
                  >
                    <NavLink to="/suppliers">
                      <Building2 />
                      <span>{t('nav.items.suppliers', 'Pemasok & Vendor')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Tables & Layout */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname.startsWith('/tables') ||
                      location.pathname.startsWith('/layout')
                    }
                    tooltip={t('nav.items.tables', 'Denah Meja')}
                  >
                    <NavLink to="/tables">
                      <LayoutGrid />
                      <span>{t('nav.items.tables', 'Denah Meja')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Receipt & Bill Design */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/receipt-settings')}
                    tooltip={t('nav.items.receiptSettings', 'Desain Nota & Struk')}
                  >
                    <NavLink to="/receipt-settings">
                      <Printer />
                      <span>{t('nav.items.receiptSettings', 'Desain Nota & Struk')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Domain Group 3: Accounting & Inventory */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>
                {t('nav.groups.accounting', 'Akuntansi & Inventaris')}
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/expenses' && currentType !== 'PURCHASE_STOCK'}
                    tooltip={t('nav.items.expenses', 'Pengeluaran Kas (Expenses)')}
                  >
                    <NavLink to="/expenses?type=EXPENSE">
                      <Wallet />
                      <span>{t('nav.items.expenses', 'Pengeluaran Kas (Expenses)')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === '/purchases' ||
                      (location.pathname === '/expenses' && currentType === 'PURCHASE_STOCK')
                    }
                    tooltip={t('nav.items.purchaseStock', 'Pembelian Stok (PO)')}
                  >
                    <NavLink to="/expenses?type=PURCHASE_STOCK">
                      <ShoppingBag />
                      <span>{t('nav.items.purchaseStock', 'Pembelian Stok (PO)')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/inventory/adjustments')}
                    tooltip={t('nav.items.inventoryAdjustments', 'Penyesuaian Stok (Opname)')}
                  >
                    <NavLink to="/inventory/adjustments">
                      <SlidersHorizontal />
                      <span>
                        {t('nav.items.inventoryAdjustments', 'Penyesuaian Stok (Opname)')}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Domain Group 4: Reports & Analytics */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>{t('nav.groups.reports', 'Laporan & Analitik')}</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === '/reports' && (!currentTab || currentTab === 'pnl')
                    }
                    tooltip={t('nav.items.pnlReport', 'Laba & Rugi (P&L)')}
                  >
                    <NavLink to="/reports?tab=pnl">
                      <DollarSign />
                      <span>{t('nav.items.pnlReport', 'Laba & Rugi (P&L)')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/reports' && currentTab === 'products'}
                    tooltip={t('nav.items.productsReport', 'Penjualan Produk')}
                  >
                    <NavLink to="/reports?tab=products">
                      <Package />
                      <span>{t('nav.items.productsReport', 'Penjualan Produk')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/reports' && currentTab === 'payments'}
                    tooltip={t('nav.items.paymentsReport', 'Metode Pembayaran')}
                  >
                    <NavLink to="/reports?tab=payments">
                      <CreditCard />
                      <span>{t('nav.items.paymentsReport', 'Metode Pembayaran')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/reports' && currentTab === 'export'}
                    tooltip={t('nav.items.exportReport', 'Ekspor & Tutup Buku')}
                  >
                    <NavLink to="/reports?tab=export">
                      <Download />
                      <span>{t('nav.items.exportReport', 'Ekspor & Tutup Buku')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Domain Group 5: System */}
            <SidebarGroup className="py-1">
              <SidebarGroupLabel>{t('nav.groups.system', 'Sistem')}</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/sync')}
                    tooltip={t('nav.items.p2pSync', 'Sinkronisasi Perangkat (P2P)')}
                  >
                    <NavLink to="/sync">
                      <RefreshCw />
                      <span>{t('nav.items.p2pSync', 'Sinkronisasi Perangkat (P2P)')}</span>
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
                    tooltip={t('nav.items.appearance', 'Tampilan & Suara')}
                  >
                    <NavLink to="/settings?tab=appearance">
                      <Palette />
                      <span>{t('nav.items.appearance', 'Tampilan & Suara')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/settings' && currentTab === 'security'}
                    tooltip={t('nav.items.security', 'Keamanan & Hak Akses')}
                  >
                    <NavLink to="/settings?tab=security">
                      <Shield />
                      <span>{t('nav.items.security', 'Keamanan & Hak Akses')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/settings' && currentTab === 'data'}
                    tooltip={t('nav.items.dataBackup', 'Cadangkan & Reset Data')}
                  >
                    <NavLink to="/settings?tab=data">
                      <Database />
                      <span>{t('nav.items.dataBackup', 'Cadangkan & Reset Data')}</span>
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
