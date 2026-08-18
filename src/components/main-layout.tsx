import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Package, Receipt, RefreshCw, Settings, LayoutGrid, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeaderStatusBadge } from '@/components/header-status-badge';
import { AppModeSwitcher } from '@/components/app-mode-switcher';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from '@/components/app-sidebar';
import { useAppMode } from '@/hooks/use-app-mode';

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isAdvanced } = useAppMode();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen h-[100dvh] w-full flex-col bg-background text-foreground overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6 bg-card/80 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
              T
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                {t('common.appName')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global App Mode Switcher (Simple vs Pro) */}
            <AppModeSwitcher variant="header" />
            <HeaderStatusBadge isOnline={navigator.onLine} peerCount={0} />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop Sidebar Navigation */}
          <AppSidebar />

          {/* Dynamic Page Router Outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 bg-background">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar (Fixed sticky on mobile with safe-area support) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md flex items-center justify-around py-2 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            <span>{t('nav.cashier', 'Kasir')}</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Package className="h-4.5 w-4.5" />
            <span>{t('nav.products', 'Produk')}</span>
          </NavLink>

          {isAdvanced && (
            <NavLink
              to="/tables"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <LayoutGrid className="h-4.5 w-4.5" />
              <span>{t('nav.tables', 'Meja')}</span>
            </NavLink>
          )}

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Receipt className="h-4.5 w-4.5" />
            <span>{t('nav.orders', 'Riwayat')}</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Wallet className="h-4.5 w-4.5" />
            <span>Biaya</span>
          </NavLink>

          {isAdvanced && (
            <NavLink
              to="/sync"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <RefreshCw className="h-4.5 w-4.5" />
              <span>{t('nav.sync', 'Sinkron')}</span>
            </NavLink>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Settings className="h-4.5 w-4.5" />
            <span>{t('nav.settings', 'Pengaturan')}</span>
          </NavLink>
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default MainLayout;
