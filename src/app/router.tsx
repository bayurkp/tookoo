import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/main-layout';
import ErrorFallback from '@/components/error-fallback';

// Route-level code splitting using React.lazy (AGENTS.md Section 18 & 24)
const DashboardPage = lazy(() => import('@/app/pages/dashboard-page'));
const CashierPage = lazy(() => import('@/app/pages/cashier-page'));
const ProductsPage = lazy(() => import('@/app/pages/products-page'));
const StockAdjustmentPage = lazy(() => import('@/app/pages/stock-adjustment-page'));
const OrdersPage = lazy(() => import('@/app/pages/orders-page'));
const ReportsPage = lazy(() => import('@/app/pages/reports-page'));
const SyncPage = lazy(() => import('@/app/pages/sync-page'));
const SettingsPage = lazy(() => import('@/app/pages/settings-page'));
const TablesPage = lazy(() => import('@/app/pages/tables-page'));
const ExpensesPage = lazy(() => import('@/app/pages/expenses-page'));

const PageLoader: React.FC = () => (
  <div className="flex h-full min-h-[320px] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-xs font-semibold">Memuat halaman...</span>
    </div>
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<unknown>>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: (
      <ErrorFallback
        error={new Error('Halaman tidak ditemukan atau terjadi kesalahan routing.')}
        resetErrorBoundary={() => {
          window.location.href = '/';
        }}
      />
    ),
    children: [
      {
        index: true,
        element: withSuspense(CashierPage),
      },
      {
        path: 'dashboard',
        element: withSuspense(DashboardPage),
      },
      {
        path: 'products',
        element: withSuspense(ProductsPage),
      },
      {
        path: 'expenses',
        element: withSuspense(ExpensesPage),
      },
      {
        path: 'inventory/adjustments',
        element: withSuspense(StockAdjustmentPage),
      },
      {
        path: 'stock-adjustment',
        element: withSuspense(StockAdjustmentPage),
      },
      {
        path: 'orders',
        element: withSuspense(OrdersPage),
      },
      {
        path: 'reports',
        element: withSuspense(ReportsPage),
      },
      {
        path: 'sync',
        element: withSuspense(SyncPage),
      },
      {
        path: 'tables',
        element: withSuspense(TablesPage),
      },
      {
        path: 'layout',
        element: withSuspense(TablesPage),
      },
      {
        path: 'settings',
        element: withSuspense(SettingsPage),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
