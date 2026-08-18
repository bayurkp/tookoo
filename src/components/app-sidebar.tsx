import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  TrendingUp,
  Settings,
  Store,
  Wallet,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuthStore } from '@/stores/auth-store';
import { useAppMode } from '@/hooks/use-app-mode';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain, type NavMainItem } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const currentRole = useAuthStore((state) => state.currentRole);
  const { isSimple } = useAppMode();

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

  // Active domain state indicators
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

  // Simple Mode Navigation Data
  const simpleNavItems: NavMainItem[] = [
    {
      title: 'Kasir',
      url: '/',
      icon: ShoppingCart,
    },
    {
      title: 'Riwayat Transaksi',
      url: '/orders',
      icon: Receipt,
    },
    {
      title: 'Produk & Menu',
      url: '/products',
      icon: Package,
    },
    {
      title: 'Pelanggan & Member',
      url: '/customers',
      icon: Users,
    },
    {
      title: 'Biaya Operasional',
      url: '/expenses',
      icon: Wallet,
    },
    {
      title: 'Pengaturan Toko',
      url: '/settings',
      icon: Settings,
    },
  ];

  // Advanced / Pro Mode: 100% aligned with 4-Domain Framework & Business Flow
  const advancedNavItems: NavMainItem[] = [
    {
      title: 'Dasbor',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Penjualan',
      url: '/',
      icon: ShoppingCart,
      isActive: isSalesActive,
      items: [
        { title: 'Kasir', url: '/' },
        { title: 'Riwayat Transaksi', url: '/orders' },
        { title: 'Shift & Uang Kas', url: '/shifts', badge: 'Segera' },
      ],
    },
    {
      title: 'Data Toko',
      url: '/store-profile',
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
      url: '/expenses',
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
      url: '/reports?tab=pnl',
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
      url: '/sync',
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

      {/* Sidebar Content: Navigation Sections */}
      <SidebarContent>
        {isSimple ? (
          <NavMain items={simpleNavItems} label="Menu Kasir" />
        ) : (
          <NavMain items={advancedNavItems} label="Platform" />
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
