import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/main-layout';
import DashboardPage from '@/app/pages/dashboard-page';
import CashierPage from '@/app/pages/cashier-page';
import ProductsPage from '@/app/pages/products-page';
import StockAdjustmentPage from '@/app/pages/stock-adjustment-page';
import OrdersPage from '@/app/pages/orders-page';
import ReportsPage from '@/app/pages/reports-page';
import SyncPage from '@/app/pages/sync-page';
import SettingsPage from '@/app/pages/settings-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <CashierPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'stock-adjustment',
        element: <StockAdjustmentPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'sync',
        element: <SyncPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

export default router;
