# 🛒 Tookoo — Local-First P2P Point of Sale (POS)

> **"Tuku di Toko"** — Smart, 100% Self-Sovereign, Zero-Server-Cost, and Lightning-Fast POS Solution for MSMEs.

---

## 📌 Executive Summary & Product Requirements Document (PRD)

**Tookoo** is a modern Point of Sale (POS) **Progressive Web App (PWA)** built on the principles of **Local-First Software** and **Peer-to-Peer (P2P) Architecture** (inspired by _Anytype_ and _Syncthing_).

This application solves the single biggest issue faced by micro, small, and medium enterprises (MSMEs): **expensive recurring POS subscription fees (_subscription fatigue_)** and **vulnerability to cloud server downtime or internet outages**.

With Tookoo, all transactions are processed instantly (0 ms latency) in the local memory of the device browser (IndexedDB / Dexie.js) and synchronized automatically between cashier terminals and the store owner's smartphone directly over **Local Wi-Fi (LAN)** and **WebRTC P2P DataChannels** without requiring any paid central backend server (Zero Server Cost).

---

## 🎯 Value Proposition & Key Highlights

1. **Zero Server Cost ($0 / Rp 0 Operational Expenses):**
   Hosted as a static Progressive Web App on free platforms like Cloudflare Pages or Vercel. No recurring 24/7 cloud database hosting fees.
2. **100% Offline Resilience (Anti-Internet Downtime):**
   Cashier operations, cart calculations, receipts, and inventory updates continue seamlessly even during internet blackouts or network disruptions.
3. **Self-Sovereign Data Privacy:**
   Business data, customer records, and profit margins are never transmitted to third-party SaaS vendors. All data remains 100% encrypted on the store owner's local devices.
4. **Zero-Config Pairing (Anytype-style):**
   Connect new cashier terminals in seconds via **1x QR Code Scan** or by entering a **12-Word Mnemonic Passphrase (BIP-39)** without complex networking, static IPs, or database configuration.

---

## 👥 User Personas & Scenarios

### Persona 1: Store Owner

- **Goal:** Monitor daily sales revenue from home or on the go without paying expensive software subscriptions per outlet.
- **Workflow:** Opens `tookoo.app` on laptop ➔ Enters store name ➔ Store is initialized, producing a Master QR Code and 12-word passphrase ➔ Shares QR code with the cashier ➔ Receives sales transactions in real time via P2P.

### Persona 2: Cashier / Store Staff

- **Goal:** Serve queues of customers quickly with zero loading spinners or network lag.
- **Workflow:** Opens Tookoo on cashier tablet ➔ Clicks "Join Store" ➔ Scans QR from owner's device ➔ Selects items to cart ➔ Collects payment (Cash / QRIS / Transfer) ➔ Completes transaction in seconds.

---

## 📋 Functional Requirements

### 1. Store Initialization & Dual-Method Pairing

- **Store Creation:** Generates store UUID v4, Store Name, P2P Encryption Secret Key, and a 12-word BIP-39 mnemonic passphrase.
- **Pairing Method A (Scan QR):** Uses device camera to scan and pair instantly with the store's Master QR Code.
- **Pairing Method B (Manual Passphrase):** Enters the 12-word BIP-39 passphrase (ideal for desktops/laptops without cameras).
- **Connection Status Indicator:** Displays dynamic status in the header:
  - 🟢 **Connected (Real-time P2P)**
  - 🟡 **Local Store Mode (Offline)**

### 2. Cashier & Transaction Flow

- Responsive product catalog (Grid & List views) with category filtering and instant search.
- Reactive Shopping Cart (_Cart Drawer / Sheet_):
  - Increment / decrement item quantities.
  - Automatic calculation of subtotal, discounts, and total due.
- Payment Modal:
  - Methods: **Cash**, **QRIS**, **Bank Transfer**.
  - Received cash input and instant change calculator.
- Post-Payment:
  - Persists order in Dexie.js `orders` table.
  - Automatically decrements product stock in `products` table.
  - Broadcasts `UPSERT` sync message to connected peers via WebRTC DataChannel.

### 3. Product Catalog & Inventory Management

- Product catalog list with real-time stock levels.
- Add / Edit Product Dialog (Name, Category, Price, Stock, Image/Icon).
- Soft delete functionality (populates `deletedAt` timestamp).

### 4. Sales History & Daily Summary

- Daily summary metric cards: Today's Revenue, Total Orders Count, and Average Order Value.
- Historical receipts list with date filters.
- Detailed receipt dialog (line items, timestamps, payment method, responsible cashier).

---

## 🗄️ Core Data Models (TypeScript Schemas)

All data entities enforce **UUID v4**, **Audit Timestamps**, and **Last-Write-Wins (LWW)** conflict resolution:

```typescript
// 1. Product Model
export interface Product {
  id: string // UUID v4
  name: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  createdAt: number // Timestamp ms
  updatedAt: number // Timestamp ms
  deletedAt: number | null // Soft delete timestamp or null
}

// 2. Order Model
export interface Order {
  id: string // UUID v4
  orderNumber: string // e.g., "TKD-001"
  items: Array<{
    productId: string // Product UUID
    name: string
    price: number
    qty: number
    subtotal: number
  }>
  totalAmount: number
  paymentMethod: "CASH" | "QRIS" | "TRANSFER"
  cashierName: string
  createdAt: number // Timestamp ms
  updatedAt: number // Timestamp ms
  deletedAt: number | null
}

// 3. Store Settings Model
export interface StoreSettings {
  id: string // UUID v4 (Store ID)
  storeName: string
  passphrase: string // 12-word BIP-39 mnemonic
  storeSecretKey: string // P2P encryption secret key
  createdAt: number // Timestamp ms
  updatedAt: number // Timestamp ms
  deletedAt: number | null
}
```

---

## 🏗️ Tech Stack & Architecture

- **Framework:** React 19 + Vite (TypeScript Strict Mode).
- **Architecture:** Bulletproof React Architecture (Unidirectional Codebase).
- **State Management:** Zustand (Cart & Notifications) + TanStack Query v5 (Dexie DB Cache).
- **Local Database:** Dexie.js (IndexedDB).
- **Styling & UI:** Tailwind CSS + shadcn/ui + Lucide Icons.
- **P2P Networking:** WebRTC DataChannel (Direct LAN & Google STUN).
- **Testing:** Vitest + React Testing Library + `fake-indexeddb` + Playwright.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Run automated tests
npm run test

# 4. Build for production
npm run build
```
