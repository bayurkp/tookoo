import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/main-layout';

const CashierPage = lazy(() => import('@/app/pages/cashier-page'));
const ProductsPage = lazy(() => import('@/app/pages/products-page'));
const OrdersPage = lazy(() => import('@/app/pages/orders-page'));
const SyncPage = lazy(() => import('@/app/pages/sync-page'));

const SuspenseFallback = () => (
  <div className="flex h-full w-full items-center justify-center p-8">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <CashierPage />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <ProductsPage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <OrdersPage />
          </Suspense>
        ),
      },
      {
        path: 'sync',
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <SyncPage />
          </Suspense>
        ),
      },
    ],
  },
]);
