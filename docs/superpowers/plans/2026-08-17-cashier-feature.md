# Cashier Terminal & Cart System Implementation Plan

Implement the Cashier Terminal module (`src/features/cashier`) with Zustand cart state, Dexie atomic order transactions and stock deduction, payment modal, receipt summary dialog, and responsive UI composition.

---

### Proposed Changes

#### Shared UI Primitives

- [NEW] `src/components/ui/tabs.tsx`

#### Orders Feature Data Layer (`src/features/orders`)

- [NEW] `src/features/orders/api/create-order.ts`
- [NEW] `src/features/orders/api/get-orders.ts`
- [NEW] `src/features/orders/api/__tests__/orders-api.test.ts`

#### Cashier Feature (`src/features/cashier`)

- [NEW] `src/features/cashier/types/cart.types.ts`
- [NEW] `src/features/cashier/stores/cart-store.ts`
- [NEW] `src/features/cashier/stores/__tests__/cart-store.test.ts`
- [NEW] `src/features/cashier/hooks/use-cashier-checkout.ts`
- [NEW] `src/features/cashier/hooks/__tests__/use-cashier-checkout.test.tsx`
- [NEW] `src/features/cashier/components/cashier-product-card.tsx`
- [NEW] `src/features/cashier/components/product-grid.tsx`
- [NEW] `src/features/cashier/components/cart-panel.tsx`
- [NEW] `src/features/cashier/components/payment-modal.tsx`
- [NEW] `src/features/cashier/components/order-success-dialog.tsx`
- [NEW] `src/features/cashier/components/__tests__/cart-panel.test.tsx`
- [NEW] `src/features/cashier/components/__tests__/payment-modal.test.tsx`

#### Application Pages Layer (`src/app/pages`)

- [MODIFY] `src/app/pages/cashier-page.tsx`
- [NEW] `src/app/pages/__tests__/cashier-page.test.tsx`

---

## Tasks

### Task 1: Cart Store & Types (`src/features/cashier/stores/`)

- Define `CartItem`, `CartDiscount`, `PaymentMethod` in `src/features/cashier/types/cart.types.ts`.
- Implement `cart-store.ts` using Zustand.
- Write unit tests in `src/features/cashier/stores/__tests__/cart-store.test.ts`.

### Task 2: Orders API Layer & Atomic Stock Deduction (`src/features/orders/api/`)

- Implement `createOrder(orderInput)` that runs a Dexie transaction to insert an `Order` and decrement corresponding product stocks.
- Implement `getOrders()`.
- Write unit tests in `src/features/orders/api/__tests__/orders-api.test.ts`.

### Task 3: Shared UI Primitives (`Tabs`)

- Implement `src/components/ui/tabs.tsx` for payment method switching.
- Write unit test in `src/components/ui/__tests__/tabs.test.tsx`.

### Task 4: Cashier Checkout Hook & Cart Components

- Implement `useCashierCheckout()` hook integrating `createOrder`, `cartStore`, and TanStack query invalidation.
- Implement `CashierProductCard`, `ProductGrid`, `CartPanel`, `PaymentModal`, and `OrderSuccessDialog`.
- Write component unit tests.

### Task 5: Cashier Page Integration (`src/app/pages/cashier-page.tsx`)

- Compose the full Cashier Terminal interface with responsive layout, instant add-to-cart, category filters, payment modal, and success dialog.
- Write integration tests in `src/app/pages/__tests__/cashier-page.test.tsx`.

### Task 6: Full Verification & Formatting

- Run `npm run format:check`, `npm run lint`, `npm test`, `npm run build`.
