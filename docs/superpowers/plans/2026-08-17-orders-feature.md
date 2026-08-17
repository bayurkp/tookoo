# Sales History & Daily Summary Reports Implementation Plan

Implement the Sales History and Daily Revenue analytics module (`src/features/orders`) with summary metrics, payment breakdowns, receipt viewing and reprinting, and responsive page composition.

---

### Proposed Changes

#### Orders Feature Layer (`src/features/orders`)

- [NEW] `src/features/orders/hooks/use-orders.ts`
- [NEW] `src/features/orders/hooks/__tests__/use-orders.test.tsx`
- [NEW] `src/features/orders/components/daily-summary-card.tsx`
- [NEW] `src/features/orders/components/order-receipt-dialog.tsx`
- [NEW] `src/features/orders/components/__tests__/daily-summary-card.test.tsx`
- [NEW] `src/features/orders/components/__tests__/order-receipt-dialog.test.tsx`

#### Application Pages Layer (`src/app/pages`)

- [MODIFY] `src/app/pages/orders-page.tsx`
- [NEW] `src/app/pages/__tests__/orders-page.test.tsx`

---

## Tasks

### Task 1: Orders TanStack Query Hooks (`use-orders.ts`)

- Implement `useOrders()` hook wrapping `getOrders()` from Dexie.
- Write unit test in `src/features/orders/hooks/__tests__/use-orders.test.tsx`.

### Task 2: Daily Sales Analytics & Receipt Dialog Components

- Implement `DailySummaryCard` calculating today's revenue, order volume, average ticket size, and payment method share.
- Implement `OrderReceiptDialog` with thermal print action.
- Write unit tests.

### Task 3: Orders Page Composition & Integration

- Integrate filters, analytics cards, order list/cards, and receipt dialog in `src/app/pages/orders-page.tsx`.
- Write integration tests in `src/app/pages/__tests__/orders-page.test.tsx`.

### Task 4: Full Quality Pipeline & Commits

- Run Prettier, Oxlint, Vitest, and Vite build verification.
