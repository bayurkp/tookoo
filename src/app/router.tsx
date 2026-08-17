import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/main-layout';

const CashierRoute = lazy(() => import('@/app/routes/cashier-route'));
const ProductsRoute = lazy(() => import('@/app/routes/products-route'));
const OrdersRoute = lazy(() => import('@/app/routes/orders-route'));
const SyncRoute = lazy(() => import('@/app/routes/sync-route'));

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
            <CashierRoute />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <ProductsRoute />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <OrdersRoute />
          </Suspense>
        ),
      },
      {
        path: 'sync',
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <SyncRoute />
          </Suspense>
        ),
      },
    ],
  },
]);
