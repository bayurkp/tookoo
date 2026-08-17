# Feature Design: Sales History & Daily Summary Reports (`src/features/orders`)

## 1. Overview

The Orders module provides store owners and cashiers with real-time visibility into historical sales transactions, daily revenue metrics, payment method distributions, and full receipt reprinting capabilities.

---

## 2. User Experience & Features

### 2.1 Daily Sales Summary Cards

- **Total Omzet Hari Ini (Total Revenue Today):** Formatted in IDR, calculated from orders created between `00:00:00` and `23:59:59` of the selected/current day.
- **Total Transaksi (Total Orders):** Count of successful orders today.
- **Rata-rata Transaksi (Average Order Value):** Total revenue divided by order count.
- **Rincian Pembayaran (Payment Method Breakdown):** Visual distribution of Tunai, QRIS, and Transfer payments.

### 2.2 Order History & Search Filter

- Search by Order Number (`TK-YYYYMMDD-XXXX`) or Cashier name.
- Filter by Payment Method (Semua / Tunai / QRIS / Transfer).
- Date selector (Hari Ini / Semua).
- Responsive list/table showing order time, item summary, payment method badge, and total amount.

### 2.3 Order Receipt Modal & Reprint

- Click any transaction to view itemized breakdown, discounts, amount paid, change due, and timestamp.
- **Cetak Ulang Struk (Reprint Receipt):** Native browser print dialog formatted for POS thermal receipts.

---

## 3. Architecture & Modular Boundaries

```text
src/
├── features/
│   └── orders/
│       ├── api/
│       │   ├── get-orders.ts
│       │   └── create-order.ts
│       ├── hooks/
│       │   └── use-orders.ts
│       └── components/
│           ├── daily-summary-card.tsx
│           ├── order-list-item.tsx
│           └── order-receipt-dialog.tsx
│
└── app/
    └── pages/
        ├── orders-page.tsx
        └── __tests__/
            └── orders-page.test.tsx
```
