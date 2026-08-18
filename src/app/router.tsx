import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { MainLayout } from '@/components/main-layout';
import ErrorFallback from '@/components/error-fallback';

// Root error boundary extracting real router error details
const RootErrorBoundary: React.FC = () => {
  const routeError = useRouteError();
  const error =
    routeError instanceof Error
      ? routeError
      : new Error(
          typeof routeError === 'string'
            ? routeError
            : 'Terjadi kendala saat memuat halaman aplikasi.'
        );

  return (
    <ErrorFallback
      error={error}
      resetErrorBoundary={() => {
        window.location.href = '/';
      }}
    />
  );
};

// Lazy loaded route pages
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
const CustomersPage = lazy(() => import('@/app/pages/customers-page'));
const SuppliersPage = lazy(() => import('@/app/pages/suppliers-page'));
const DiscountsPage = lazy(() => import('@/app/pages/discounts-page'));
const ShiftsPage = lazy(() => import('@/app/pages/shifts-page'));
const StoreProfilePage = lazy(() => import('@/app/pages/store-profile-page'));
const TaxesPage = lazy(() => import('@/app/pages/taxes-page'));
const ReceiptPage = lazy(() => import('@/app/pages/receipt-page'));

const PageLoader: React.FC = () => (
  <div className="flex h-full min-h-[320px] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-xs font-semibold">Memuat halaman...</span>
    </div>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RootErrorBoundary />,
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
        path: 'shifts',
        element: withSuspense(ShiftsPage),
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
        path: 'purchases',
        element: <Navigate to="/expenses?type=PURCHASE_STOCK" replace />,
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
        path: 'customers',
        element: withSuspense(CustomersPage),
      },
      {
        path: 'suppliers',
        element: withSuspense(SuppliersPage),
      },
      {
        path: 'discounts',
        element: withSuspense(DiscountsPage),
      },
      {
        path: 'store-profile',
        element: withSuspense(StoreProfilePage),
      },
      {
        path: 'taxes',
        element: withSuspense(TaxesPage),
      },
      {
        path: 'receipt-settings',
        element: withSuspense(ReceiptPage),
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
