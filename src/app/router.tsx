import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/main-layout';
import CashierPage from '@/app/pages/cashier-page';
import ProductsPage from '@/app/pages/products-page';
import OrdersPage from '@/app/pages/orders-page';
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
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
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
