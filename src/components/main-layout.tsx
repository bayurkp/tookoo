import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Package, Receipt, QrCode } from 'lucide-react';
import { HeaderStatusBadge } from '@/components/header-status-badge';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b px-6 bg-card/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            T
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Tookoo
              <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Local-First
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <HeaderStatusBadge isOnline={navigator.onLine} peerCount={0} />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-card/30 p-4 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1.5">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              <ShoppingCart className="h-4 w-4" />
              Kasir
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              <Package className="h-4 w-4" />
              Produk & Stok
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              <Receipt className="h-4 w-4" />
              Riwayat Transaksi
            </NavLink>

            <NavLink
              to="/sync"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              <QrCode className="h-4 w-4" />
              P2P Sync & Pairing
            </NavLink>
          </nav>

          <div className="text-xs text-muted-foreground text-center py-2 border-t">
            Tookoo POS v0.1.0 • P2P Mesh
          </div>
        </aside>

        {/* Dynamic Page Router Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-zinc-950/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
