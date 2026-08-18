import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  SlidersHorizontal,
  TrendingUp,
  RefreshCw,
  Settings,
  ShieldCheck,
  Laptop,
  ChevronDown,
  ChevronRight,
  Folder,
  Layers,
  Sparkles,
  DollarSign,
  CreditCard,
  Download,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentRole = useAuthStore((state) => state.role);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  // Accordion open states for sub-items
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);

  const isProductsActive = location.pathname.startsWith('/products');
  const isReportsActive = location.pathname.startsWith('/reports');

  // Fetch current store settings for name & device
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
      ? 'Pemilik Toko'
      : currentRole === 'MANAGER'
      ? 'Manajer Toko'
      : 'Kasir';

  return (
    <aside className="w-64 border-r bg-card/60 backdrop-blur-md p-4 flex flex-col justify-between hidden md:flex shrink-0 select-none overflow-hidden h-screen">
      {/* Sidebar Header: Store Identity */}
      <div className="space-y-4 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shrink-0 shadow-xs">
            {storeName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-foreground truncate" title={storeName}>
              {storeName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                {roleLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groupings in ScrollArea */}
      <ScrollArea className="flex-1 -mx-2 px-2 my-3">
        <div className="space-y-4 pr-1">
          {/* Group 1: Operasional Kasir */}
          <div>
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Operasional Kasir
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard Toko</span>
              </NavLink>

              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`
                }
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span>{t('nav.cashier', 'Terminal Kasir')}</span>
              </NavLink>

              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`
                }
              >
                <Receipt className="h-4 w-4 shrink-0" />
                <span>{t('nav.orders', 'Riwayat & Struk')}</span>
              </NavLink>
            </nav>
          </div>

          {/* Group 2: Katalog & Stok (With Sub-Items) */}
          <div>
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Katalog & Stok
            </p>
            <nav className="space-y-1">
              {/* Parent Product Catalog with Subitems */}
              <div>
                <div
                  onClick={() => {
                    if (location.pathname !== '/products') {
                      navigate('/products');
                    }
                    setIsProductsOpen(!isProductsOpen);
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                    location.pathname === '/products'
                      ? 'bg-muted text-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="h-4 w-4 shrink-0 text-primary" />
                    <span>{t('nav.products', 'Katalog Produk')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProductsOpen(!isProductsOpen);
                    }}
                    className="p-0.5 hover:bg-muted/80 rounded"
                  >
                    {isProductsOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Sub-items for Products */}
                {isProductsOpen && (
                  <div className="ml-4 pl-3 border-l border-border/60 mt-1 space-y-1">
                    <NavLink
                      to="/products?tab=products"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/products' && (!currentTab || currentTab === 'products')
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Package className="h-3 w-3 shrink-0" />
                      <span>Semua Produk</span>
                    </NavLink>

                    <NavLink
                      to="/products?tab=categories"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/products' && currentTab === 'categories'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Folder className="h-3 w-3 shrink-0" />
                      <span>Kategori Produk</span>
                    </NavLink>

                    <NavLink
                      to="/products?tab=variants"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/products' && currentTab === 'variants'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span>Daftar Varian</span>
                    </NavLink>

                    <NavLink
                      to="/products?tab=modifiers"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/products' && currentTab === 'modifiers'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Layers className="h-3 w-3 shrink-0" />
                      <span>Modifier & Topping</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Stok Adjustment */}
              <NavLink
                to="/inventory/adjustments"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`
                }
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0" />
                <span>{t('nav.stockAdjustment', 'Stok Adjustment')}</span>
              </NavLink>
            </nav>
          </div>

          {/* Group 3: Laporan & Analitik (With Sub-Items) */}
          <div>
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Laporan & Finansial
            </p>
            <nav className="space-y-1">
              <div>
                <div
                  onClick={() => {
                    if (location.pathname !== '/reports') {
                      navigate('/reports');
                    }
                    setIsReportsOpen(!isReportsOpen);
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                    location.pathname === '/reports'
                      ? 'bg-muted text-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Laporan & Analitik</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReportsOpen(!isReportsOpen);
                    }}
                    className="p-0.5 hover:bg-muted/80 rounded"
                  >
                    {isReportsOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Sub-items for Reports */}
                {isReportsOpen && (
                  <div className="ml-4 pl-3 border-l border-border/60 mt-1 space-y-1">
                    <NavLink
                      to="/reports?tab=pnl"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/reports' && (!currentTab || currentTab === 'pnl')
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>Laba Rugi & Penjualan</span>
                    </NavLink>

                    <NavLink
                      to="/reports?tab=products"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/reports' && currentTab === 'products'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Package className="h-3 w-3 shrink-0" />
                      <span>Performa Produk</span>
                    </NavLink>

                    <NavLink
                      to="/reports?tab=payments"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/reports' && currentTab === 'payments'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <CreditCard className="h-3 w-3 shrink-0" />
                      <span>Kas & Pembayaran</span>
                    </NavLink>

                    <NavLink
                      to="/reports?tab=export"
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        location.pathname === '/reports' && currentTab === 'export'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Download className="h-3 w-3 shrink-0" />
                      <span>Ekspor & Cetak</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Group 4: Pengaturan & Jaringan */}
          <div>
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Manajemen & Jaringan
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/sync"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`
                }
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                <span>{t('nav.sync', 'Sinkronisasi Perangkat')}</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`
                }
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>{t('nav.settings', 'Pengaturan Toko')}</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="pt-3 border-t border-border/80 space-y-2 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Laptop className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] font-medium text-foreground truncate" title={deviceName}>
              {deviceName}
            </span>
          </div>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Tookoo POS • 100% Offline P2P
        </p>
      </div>
    </aside>
  );
};

export default AppSidebar;
