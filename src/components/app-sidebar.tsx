import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  Receipt,
  Package,
  SlidersHorizontal,
  RefreshCw,
  Settings,
  ShieldCheck,
  Laptop,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';

export const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const currentRole = useAuthStore((state) => state.role);

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
    <aside className="w-64 border-r bg-card/60 backdrop-blur-md p-4 flex flex-col justify-between hidden md:flex shrink-0 select-none">
      {/* Sidebar Header: Store Identity */}
      <div className="space-y-4">
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

        {/* Navigation Groupings */}
        <div className="space-y-4">
          {/* Group 1: Operasional Kasir */}
          <div>
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Operasional Kasir
            </p>
            <nav className="space-y-1">
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

          {/* Group 2: Katalog & Stok */}
          <div>
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Katalog & Stok
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`
                }
              >
                <Package className="h-4 w-4 shrink-0" />
                <span>{t('nav.products', 'Katalog Produk')}</span>
              </NavLink>

              <NavLink
                to="/stock-adjustment"
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

          {/* Group 3: Pengaturan & Jaringan */}
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
      </div>

      {/* Sidebar Footer: Terminal & P2P Offline Indicator */}
      <div className="pt-3 border-t border-border/80 space-y-2">
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
