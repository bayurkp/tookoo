import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuthStore } from '@/stores/auth-store';
import { useAppMode } from '@/hooks/use-app-mode';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppModeSwitcher } from '@/components/app-mode-switcher';
import { cn } from '@/lib/cn';

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRole = useAuthStore((state) => state.currentRole);
  const { isSimple } = useAppMode();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  // Smart collapsible group states
  const [isSalesOpen, setIsSalesOpen] = useState(
    () =>
      location.pathname === '/' ||
      location.pathname.startsWith('/orders') ||
      location.pathname.startsWith('/shifts')
  );

  const [isStoreDataOpen, setIsStoreDataOpen] = useState(
    () =>
      location.pathname.startsWith('/products') ||
      location.pathname.startsWith('/discounts') ||
      location.pathname.startsWith('/customers') ||
      location.pathname.startsWith('/suppliers') ||
      location.pathname.startsWith('/tables') ||
      (location.pathname.startsWith('/settings') &&
        (currentTab === 'general' || currentTab === 'taxes' || currentTab === 'receipt'))
  );

  const [isProductSubOpen, setIsProductSubOpen] = useState(() =>
    location.pathname.startsWith('/products')
  );

  const [isInventoryOpen, setIsInventoryOpen] = useState(
    () => location.pathname.startsWith('/inventory') || location.pathname.startsWith('/expenses')
  );

  const [isReportsOpen, setIsReportsOpen] = useState(() =>
    location.pathname.startsWith('/reports')
  );

  const [isSystemOpen, setIsSystemOpen] = useState(
    () =>
      location.pathname.startsWith('/sync') ||
      (location.pathname.startsWith('/settings') &&
        (currentTab === 'appearance' || currentTab === 'security' || currentTab === 'data'))
  );

  // Auto-expand active group on route changes
  useEffect(() => {
    if (
      location.pathname === '/' ||
      location.pathname.startsWith('/orders') ||
      location.pathname.startsWith('/shifts')
    ) {
      setIsSalesOpen(true);
    }

    if (
      location.pathname.startsWith('/products') ||
      location.pathname.startsWith('/discounts') ||
      location.pathname.startsWith('/customers') ||
      location.pathname.startsWith('/suppliers') ||
      location.pathname.startsWith('/tables') ||
      (location.pathname.startsWith('/settings') &&
        (currentTab === 'general' || currentTab === 'taxes' || currentTab === 'receipt'))
    ) {
      setIsStoreDataOpen(true);
    }

    if (location.pathname.startsWith('/products')) {
      setIsProductSubOpen(true);
    }

    if (location.pathname.startsWith('/inventory') || location.pathname.startsWith('/expenses')) {
      setIsInventoryOpen(true);
    }

    if (location.pathname.startsWith('/reports')) {
      setIsReportsOpen(true);
    }

    if (
      location.pathname.startsWith('/sync') ||
      (location.pathname.startsWith('/settings') &&
        (currentTab === 'appearance' || currentTab === 'security' || currentTab === 'data'))
    ) {
      setIsSystemOpen(true);
    }
  }, [location.pathname, currentTab]);

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
    currentRole === 'OWNER' ? 'Pemilik Toko' : currentRole === 'MANAGER' ? 'Manajer Toko' : 'Kasir';

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 relative group select-none',
      isActive
        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
    );

  const subNavItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-all duration-150 select-none',
      isActive
        ? 'bg-primary/10 text-primary font-bold'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    );

  const groupHeaderClass = (isOpen: boolean, isSectionActive: boolean) =>
    cn(
      'w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-150 select-none cursor-pointer',
      isSectionActive
        ? 'text-foreground bg-muted/60'
        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
    );

  return (
    <aside className="w-64 border-r bg-card/80 backdrop-blur-md p-3 flex flex-col justify-between hidden md:flex shrink-0 select-none overflow-hidden h-full z-10">
      {/* Sidebar Header: Store Identity */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shrink-0 shadow-xs">
            {storeName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-xs font-bold tracking-tight text-foreground truncate"
              title={storeName}
            >
              {storeName}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold h-4">
                {roleLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups inside ScrollArea */}
      <ScrollArea className="flex-1 min-h-0 -mx-1.5 px-1.5 my-2">
        <div className="space-y-2 pr-1 py-1">
          {/* ========================================================================= */}
          {/* 1. SIMPLE MODE NAVIGATION (Fast, Focused Essential Menus) */}
          {/* ========================================================================= */}
          {isSimple ? (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Menu Kasir
              </p>
              <nav className="space-y-0.5">
                <NavLink to="/" className={({ isActive }) => navItemClass(isActive)}>
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span>Kasir (POS)</span>
                </NavLink>

                <NavLink to="/orders" className={({ isActive }) => navItemClass(isActive)}>
                  <Receipt className="h-4 w-4 shrink-0" />
                  <span>Riwayat Transaksi</span>
                </NavLink>

                <NavLink to="/products" className={({ isActive }) => navItemClass(isActive)}>
                  <Package className="h-4 w-4 shrink-0" />
                  <span>Produk & Menu</span>
                </NavLink>

                <NavLink to="/customers" className={({ isActive }) => navItemClass(isActive)}>
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Pelanggan & Member</span>
                </NavLink>

                <NavLink to="/expenses" className={({ isActive }) => navItemClass(isActive)}>
                  <Wallet className="h-4 w-4 shrink-0" />
                  <span>Biaya Operasional</span>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => navItemClass(isActive)}>
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Pengaturan Toko</span>
                </NavLink>
              </nav>
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. ADVANCED MODE: 100% ALIGNED WITH BUSINESS DOMAINS HIERARCHY */
            /* ========================================================================= */
            <>
              {/* ----------------------------------------------------------------- */}
              {/* ITEM 1: DASBOR (SATU ITEM MANDIRI PALING ATAS) */}
              {/* ----------------------------------------------------------------- */}
              <div className="pb-1">
                <NavLink to="/dashboard" className={({ isActive }) => navItemClass(isActive)}>
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span className="font-bold">Dasbor</span>
                </NavLink>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* GROUP 1: PENJUALAN (COLLAPSIBLE) */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setIsSalesOpen((prev) => !prev)}
                  className={groupHeaderClass(
                    isSalesOpen,
                    location.pathname === '/' ||
                      location.pathname.startsWith('/orders') ||
                      location.pathname.startsWith('/shifts')
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                    <span>Penjualan</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground',
                      !isSalesOpen && '-rotate-90'
                    )}
                  />
                </button>

                {isSalesOpen && (
                  <nav className="ml-2 pl-2 border-l border-border/60 space-y-0.5 mt-0.5 animate-in fade-in-50 duration-150">
                    <NavLink to="/" className={({ isActive }) => navItemClass(isActive)}>
                      <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                      <span>Kasir (POS)</span>
                    </NavLink>

                    <NavLink to="/orders" className={({ isActive }) => navItemClass(isActive)}>
                      <Receipt className="h-3.5 w-3.5 shrink-0" />
                      <span>Riwayat Transaksi</span>
                    </NavLink>

                    <NavLink to="/shifts" className={({ isActive }) => navItemClass(isActive)}>
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1">Shift & Uang Kas</span>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4 text-muted-foreground border-muted-foreground/30 font-medium"
                      >
                        Segera
                      </Badge>
                    </NavLink>
                  </nav>
                )}
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* GROUP 2: DATA TOKO (COLLAPSIBLE DENGAN URUTAN FLOW BISNIS) */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setIsStoreDataOpen((prev) => !prev)}
                  className={groupHeaderClass(
                    isStoreDataOpen,
                    location.pathname.startsWith('/products') ||
                      location.pathname.startsWith('/discounts') ||
                      location.pathname.startsWith('/customers') ||
                      location.pathname.startsWith('/suppliers') ||
                      location.pathname.startsWith('/tables') ||
                      (location.pathname.startsWith('/settings') &&
                        (currentTab === 'general' ||
                          currentTab === 'taxes' ||
                          currentTab === 'receipt'))
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 text-primary" />
                    <span>Data Toko</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground',
                      !isStoreDataOpen && '-rotate-90'
                    )}
                  />
                </button>

                {isStoreDataOpen && (
                  <nav className="ml-2 pl-2 border-l border-border/60 space-y-0.5 mt-0.5 animate-in fade-in-50 duration-150">
                    {/* 1. Profil Toko */}
                    <NavLink
                      to="/settings?tab=general"
                      className={subNavItemClass(
                        location.pathname === '/settings' &&
                          (!currentTab || currentTab === 'general')
                      )}
                    >
                      <Store className="h-3.5 w-3.5 shrink-0" />
                      <span>Profil Toko</span>
                    </NavLink>

                    {/* 2. Produk (Nested Collapsible) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!location.pathname.startsWith('/products')) {
                            navigate('/products');
                          }
                          setIsProductSubOpen((prev) => !prev);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between rounded-md px-2 py-1 text-[11px] font-medium transition-all duration-150 cursor-pointer',
                          location.pathname.startsWith('/products')
                            ? 'bg-muted/70 text-foreground font-bold'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 shrink-0" />
                          <span>Produk & Menu</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            'h-3 w-3 transition-transform duration-200 text-muted-foreground',
                            !isProductSubOpen && '-rotate-90'
                          )}
                        />
                      </button>

                      {isProductSubOpen && (
                        <div className="ml-3 pl-2 border-l border-border/50 my-0.5 space-y-0.5">
                          <NavLink
                            to="/products?tab=products"
                            className={subNavItemClass(
                              location.pathname === '/products' &&
                                (!currentTab || currentTab === 'products')
                            )}
                          >
                            <Package className="h-3 w-3 shrink-0" />
                            <span>Daftar Produk</span>
                          </NavLink>

                          <NavLink
                            to="/products?tab=categories"
                            className={subNavItemClass(
                              location.pathname === '/products' && currentTab === 'categories'
                            )}
                          >
                            <Folder className="h-3 w-3 shrink-0" />
                            <span>Kategori</span>
                          </NavLink>

                          <NavLink
                            to="/products?tab=uom"
                            className={subNavItemClass(
                              location.pathname === '/products' && currentTab === 'uom'
                            )}
                          >
                            <Scale className="h-3 w-3 shrink-0" />
                            <span>Satuan (UOM)</span>
                          </NavLink>

                          <NavLink
                            to="/products?tab=variants"
                            className={subNavItemClass(
                              location.pathname === '/products' && currentTab === 'variants'
                            )}
                          >
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span>Varian Produk</span>
                          </NavLink>

                          <NavLink
                            to="/products?tab=modifiers"
                            className={subNavItemClass(
                              location.pathname === '/products' && currentTab === 'modifiers'
                            )}
                          >
                            <Layers className="h-3 w-3 shrink-0" />
                            <span>Opsi Tambahan (Modifier)</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* 3. Diskon & Promosi */}
                    <NavLink to="/discounts" className={({ isActive }) => navItemClass(isActive)}>
                      <Tag className="h-3.5 w-3.5 shrink-0" />
                      <span>Diskon & Promosi</span>
                    </NavLink>

                    {/* 4. Pajak & Biaya Layanan */}
                    <NavLink
                      to="/settings?tab=taxes"
                      className={subNavItemClass(
                        location.pathname === '/settings' && currentTab === 'taxes'
                      )}
                    >
                      <Receipt className="h-3.5 w-3.5 shrink-0" />
                      <span>Pajak & Biaya Layanan</span>
                    </NavLink>

                    {/* 5. Pelanggan & Member */}
                    <NavLink to="/customers" className={({ isActive }) => navItemClass(isActive)}>
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>Pelanggan & Member</span>
                    </NavLink>

                    {/* 6. Pemasok & Vendor */}
                    <NavLink to="/suppliers" className={({ isActive }) => navItemClass(isActive)}>
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Pemasok & Vendor</span>
                    </NavLink>

                    {/* 7. Denah Meja */}
                    <NavLink
                      to="/tables"
                      className={({ isActive }) =>
                        navItemClass(isActive || location.pathname.startsWith('/layout'))
                      }
                    >
                      <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                      <span>Denah Meja</span>
                    </NavLink>

                    {/* 8. Format Struk & Nota */}
                    <NavLink
                      to="/settings?tab=receipt"
                      className={subNavItemClass(
                        location.pathname === '/settings' && currentTab === 'receipt'
                      )}
                    >
                      <Printer className="h-3.5 w-3.5 shrink-0" />
                      <span>Desain Nota & Struk</span>
                    </NavLink>
                  </nav>
                )}
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* GROUP 3: AKUNTANSI & INVENTARIS (COLLAPSIBLE) */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setIsInventoryOpen((prev) => !prev)}
                  className={groupHeaderClass(
                    isInventoryOpen,
                    location.pathname.startsWith('/inventory') ||
                      location.pathname.startsWith('/expenses')
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                    <span>Akuntansi & Inventaris</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground',
                      !isInventoryOpen && '-rotate-90'
                    )}
                  />
                </button>

                {isInventoryOpen && (
                  <nav className="ml-2 pl-2 border-l border-border/60 space-y-0.5 mt-0.5 animate-in fade-in-50 duration-150">
                    {/* 1. Pengeluaran Operasional (Expenses) */}
                    <NavLink to="/expenses" className={({ isActive }) => navItemClass(isActive)}>
                      <Wallet className="h-3.5 w-3.5 shrink-0" />
                      <span>Pengeluaran Kas (Expenses)</span>
                    </NavLink>

                    {/* 2. Pembelian Stok & Purchase Order */}
                    <NavLink
                      to="/expenses?type=PURCHASE_STOCK"
                      className={subNavItemClass(
                        location.pathname === '/expenses' &&
                          searchParams.get('type') === 'PURCHASE_STOCK'
                      )}
                    >
                      <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                      <span>Pembelian Stok (PO)</span>
                    </NavLink>

                    {/* 3. Penyesuaian Stok (Opname) */}
                    <NavLink
                      to="/inventory/adjustments"
                      className={({ isActive }) => navItemClass(isActive)}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                      <span>Penyesuaian Stok (Opname)</span>
                    </NavLink>
                  </nav>
                )}
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* GROUP 4: LAPORAN & ANALITIK (COLLAPSIBLE) */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (location.pathname !== '/reports') {
                      navigate('/reports');
                    }
                    setIsReportsOpen((prev) => !prev);
                  }}
                  className={groupHeaderClass(
                    isReportsOpen,
                    location.pathname.startsWith('/reports')
                  )}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span>Laporan & Analitik</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground',
                      !isReportsOpen && '-rotate-90'
                    )}
                  />
                </button>

                {isReportsOpen && (
                  <nav className="ml-2 pl-2 border-l border-border/60 space-y-0.5 mt-0.5 animate-in fade-in-50 duration-150">
                    <NavLink
                      to="/reports?tab=pnl"
                      className={subNavItemClass(
                        location.pathname === '/reports' && (!currentTab || currentTab === 'pnl')
                      )}
                    >
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>Laba & Rugi (P&L)</span>
                    </NavLink>

                    <NavLink
                      to="/reports?tab=products"
                      className={subNavItemClass(
                        location.pathname === '/reports' && currentTab === 'products'
                      )}
                    >
                      <Package className="h-3 w-3 shrink-0" />
                      <span>Penjualan Produk</span>
                    </NavLink>

                    <NavLink
                      to="/reports?tab=payments"
                      className={subNavItemClass(
                        location.pathname === '/reports' && currentTab === 'payments'
                      )}
                    >
                      <CreditCard className="h-3 w-3 shrink-0" />
                      <span>Metode Pembayaran</span>
                    </NavLink>

                    <NavLink
                      to="/reports?tab=export"
                      className={subNavItemClass(
                        location.pathname === '/reports' && currentTab === 'export'
                      )}
                    >
                      <Download className="h-3 w-3 shrink-0" />
                      <span>Ekspor & Tutup Buku</span>
                    </NavLink>
                  </nav>
                )}
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* GROUP 5: SISTEM (COLLAPSIBLE) */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setIsSystemOpen((prev) => !prev)}
                  className={groupHeaderClass(
                    isSystemOpen,
                    location.pathname.startsWith('/sync') ||
                      (location.pathname.startsWith('/settings') &&
                        (currentTab === 'appearance' ||
                          currentTab === 'security' ||
                          currentTab === 'data'))
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5 text-primary" />
                    <span>Sistem</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground',
                      !isSystemOpen && '-rotate-90'
                    )}
                  />
                </button>

                {isSystemOpen && (
                  <nav className="ml-2 pl-2 border-l border-border/60 space-y-0.5 mt-0.5 animate-in fade-in-50 duration-150">
                    <NavLink to="/sync" className={({ isActive }) => navItemClass(isActive)}>
                      <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                      <span>Sinkronisasi Perangkat (P2P)</span>
                    </NavLink>

                    <NavLink
                      to="/settings?tab=appearance"
                      className={subNavItemClass(
                        location.pathname === '/settings' && currentTab === 'appearance'
                      )}
                    >
                      <Palette className="h-3.5 w-3.5 shrink-0" />
                      <span>Tampilan & Suara</span>
                    </NavLink>

                    <NavLink
                      to="/settings?tab=security"
                      className={subNavItemClass(
                        location.pathname === '/settings' && currentTab === 'security'
                      )}
                    >
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span>Keamanan & Hak Akses</span>
                    </NavLink>

                    <NavLink
                      to="/settings?tab=data"
                      className={subNavItemClass(
                        location.pathname === '/settings' && currentTab === 'data'
                      )}
                    >
                      <Database className="h-3.5 w-3.5 shrink-0" />
                      <span>Cadangkan & Reset Data</span>
                    </NavLink>
                  </nav>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Sidebar Footer: Mode Switcher & Device Info */}
      <div className="pt-2 border-t border-border/80 space-y-1.5 shrink-0">
        <AppModeSwitcher variant="sidebar" />

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
