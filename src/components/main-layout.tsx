import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Receipt,
  QrCode,
  Settings,
  Languages,
  Moon,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeaderStatusBadge } from '@/components/header-status-badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';

export const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(nextLang);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6 bg-card/80 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                {t('common.appName')}
                <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  POS Kasir
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="h-8 px-2.5 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Languages className="h-3.5 w-3.5" />
                  <span className="uppercase">{i18n.language?.startsWith('en') ? 'EN' : 'ID'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {i18n.language?.startsWith('en')
                  ? 'Ganti ke Bahasa Indonesia'
                  : 'Switch to English'}
              </TooltipContent>
            </Tooltip>

            {/* Dark / Light Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-600 transition-transform duration-200" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isDark ? 'Mode Terang' : 'Mode Gelap'}
              </TooltipContent>
            </Tooltip>

            {/* Settings Quick Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink to="/settings">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t('nav.settings', 'Pengaturan')}
              </TooltipContent>
            </Tooltip>

            <HeaderStatusBadge isOnline={navigator.onLine} peerCount={0} />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop Sidebar Navigation */}
          <aside className="w-64 border-r bg-card/40 p-4 flex flex-col justify-between hidden md:flex shrink-0">
            <nav className="space-y-1.5">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{t('nav.cashier')}</span>
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <Package className="h-4 w-4" />
                <span>{t('nav.products')}</span>
              </NavLink>

              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <Receipt className="h-4 w-4" />
                <span>{t('nav.orders')}</span>
              </NavLink>

              <NavLink
                to="/sync"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <QrCode className="h-4 w-4" />
                <span>{t('nav.sync')}</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <Settings className="h-4 w-4" />
                <span>{t('nav.settings', 'Pengaturan')}</span>
              </NavLink>
            </nav>

            <div className="text-xs text-muted-foreground text-center py-2 border-t">
              Tookoo POS • Kasir Mandiri
            </div>
          </aside>

          {/* Dynamic Page Router Outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 bg-background">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar (Visible only on mobile screens) */}
        <nav className="md:hidden border-t bg-card/90 backdrop-blur z-20 flex items-center justify-around py-2 px-1 shrink-0">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            <span>{t('nav.cashier')}</span>
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
            <span>{t('nav.products')}</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Receipt className="h-4.5 w-4.5" />
            <span>{t('nav.orders')}</span>
          </NavLink>

          <NavLink
            to="/sync"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <QrCode className="h-4.5 w-4.5" />
            <span>{t('nav.sync')}</span>
          </NavLink>

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
