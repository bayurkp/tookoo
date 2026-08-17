# Feature Design: Cashier Terminal & Transaction System (`src/features/cashier`)

## 1. Overview

The Cashier Terminal is the core operational hub of the Tookoo POS application. It allows cashiers and store owners to quickly search and select products, manage a real-time shopping cart with quantity and discount adjustments, process payments with automatic change calculation, and record completed orders to local IndexedDB while updating stock levels.

---

## 2. User Experience & Workflow

### 2.1 Workflow

1. **Catalog Navigation & Search:**
   - Cashier views active products from Dexie.js in a responsive grid.
   - Cashier can search by name or filter by category pills.
   - Out-of-stock items are visually dimmed and cannot be added to the cart.
2. **Cart Management:**
   - Cashier clicks a product card to add 1 unit to the cart.
   - Subsequent clicks increment the quantity (up to available stock).
   - Cashier can adjust quantity via `+` / `-` buttons, delete an item, or apply a fixed / percentage discount.
   - Subtotal, discount deduction, and total due are recalculated in 0ms via Zustand atomic selectors.
3. **Payment & Checkout:**
   - Cashier clicks **"Bayar Sekarang"** (Pay Now).
   - Modal opens with payment method selection: **Tunai (Cash)**, **QRIS**, **Transfer**.
   - For cash payments: Cashier enters amount received or selects quick cash buttons (Uang Pas, Rp 10.000, Rp 20.000, Rp 50.000, Rp 100.000).
   - Change due is computed automatically.
   - Cashier clicks **"Konfirmasi Pembayaran"** (Confirm Payment).
4. **Order Persistence & Stock Deduction:**
   - An `Order` record with UUID v4 and audit timestamps is created in `db.orders`.
   - In a Dexie transaction, each purchased product's `stock` in `db.products` is decremented.
   - TanStack Query caches for `['products']` and `['orders']` are invalidated.
5. **Success & Receipt View:**
   - Success modal displays change due prominently with actions: **"Cetak Struk"** and **"Transaksi Baru"**.

---

## 3. Architecture & Modular Boundaries

```text
src/
├── features/
│   ├── cashier/
│   │   ├── components/
│   │   │   ├── product-grid.tsx
│   │   │   ├── cart-panel.tsx
│   │   │   ├── payment-modal.tsx
│   │   │   └── order-success-dialog.tsx
│   │   ├── hooks/
│   │   │   └── use-cashier-checkout.ts
│   │   ├── stores/
│   │   │   └── cart-store.ts
│   │   └── types/
│   │       └── cart.types.ts
│   │
│   └── orders/
│       └── api/
│           ├── get-orders.ts
│           └── create-order.ts
│
└── app/
    └── pages/
        ├── cashier-page.tsx
        └── __tests__/
            └── cashier-page.test.tsx
```

---

## 4. State Management & Data Schema

### 4.1 Cart Types (`src/features/cashier/types/cart.types.ts`)

```typescript
import type { Product } from '@/types/product.types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface CartDiscount {
  type: DiscountType;
  value: number;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';
```

### 4.2 Zustand Cart Store (`src/features/cashier/stores/cart-store.ts`)

- State: `items: CartItem[]`, `discount: CartDiscount | null`
- Actions: `addItem(product, qty?)`, `removeItem(productId)`, `updateQuantity(productId, qty)`, `setDiscount(discount)`, `clearCart()`
- Selectors / Helpers: `selectCartSubtotal`, `selectCartDiscountAmount`, `selectCartTotal`, `selectCartItemCount`

---

## 5. Security, Resilience & Voice / Tone

- **Security:** Strict validation of amount tendered ($\ge$ total due). No negative prices or stocks.
- **Voice & Tone:** Fast, direct POS copy (e.g. `"Pembayaran Berhasil. Kembalian: Rp 15.000"`), no cheer filler or raw emojis.
- **Offline First:** 100% resilient on IndexedDB with 0ms latency.
