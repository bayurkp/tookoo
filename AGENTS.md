# Tookoo React (PWA) — Architecture & Standards

> **One rule governs all others:** a change in one layer must never force a cascade of changes in another. The shared data layer works even if the UI changes completely; every feature is testable without a real network; every transaction works 100% offline first.

---

## Mandatory Reading (AI Agents)

Before writing any code, read:

1. `README.md` — defines product requirements, functional specifications, and business rules. Do not invent features.
2. This document in full.

---

# Part 1 — Foundation

## 1. Unidirectional Codebase & Architecture

Dependencies flow **inward only**: `App Pages → Features → Shared Modules (Components, Hooks, Lib, Types, Utils)`.

```text
User interaction in UI Page
  ↓ triggers action   →  Zustand Store (UI state) or TanStack Mutation Hook
  ↓ calls API layer   →  Dexie.js Repository (Local DB Mutation)
  ↓ broadcasts event  →  WebRTC P2P DataChannel (SyncMessage to connected peers)
  ↑ mutates IndexedDB →  Dexie reactive write (0ms latency)
  ↑ invalidates query →  TanStack Query refetches from Dexie
  ↑ UI re-renders     →  Component updates with zero lag
```

### Hard Rules:

- **No Cross-Feature Imports:** Code in `src/features/orders` MUST NEVER import from `src/features/products`. Cross-feature composition is strictly done at the application level (`src/app/pages/`).
- **Shared Isolation:** Modules in `src/components`, `src/lib`, `src/types`, `src/utils`, `src/hooks`, and `src/stores` are FORBIDDEN from importing from `src/features` or `src/app`.
- **No Barrel Files:** Avoid `index.ts` barrel files to maximize _tree-shaking_ and Vite bundling performance. Import directly from specific files (e.g., `import { Button } from '@/components/ui/button';`).
- **No Raw Data Mutation:** Data mutations strictly follow `get`, `upsert`, and `delete`.

### Feature Module Structure (`src/features/<feature-name>/`):

```text
src/features/<feature-name>/
├── api/          # TanStack Query & Dexie mutation declarations
├── components/   # UI components scoped exclusively to this feature
├── hooks/        # Custom React hooks for this feature
├── stores/       # Zustand store scoped to this feature (if any)
├── types/        # TypeScript types & Zod schemas for this feature
└── utils/        # Helper pure logic scoped to this feature
```

### Boundary Enforcement (ESLint `import/no-restricted-paths`):

```javascript
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      // 1. Forbid cross-feature imports
      { target: './src/features/cashier', from: './src/features', except: ['./cashier'] },
      { target: './src/features/products', from: './src/features', except: ['./products'] },
      { target: './src/features/orders', from: './src/features', except: ['./orders'] },
      { target: './src/features/sync', from: './src/features', except: ['./sync'] },

      // 2. Enforce unidirectional flow (Features cannot import from App)
      { target: './src/features', from: './src/app' },

      // 3. Enforce shared isolation (Shared modules cannot import from Features or App)
      {
        target: ['./src/components', './src/hooks', './src/lib', './src/types', './src/utils', './src/stores'],
        from: ['./src/features', './src/app'],
      },
    ],
  },
]
```

---

## 2. Technology Stack

| Concern                     | Solution / Package                                             |
| :-------------------------- | :------------------------------------------------------------- |
| **Framework & Language**    | React 19 + TypeScript (Strict Mode, no `any`)                  |
| **Build Tool & Bundler**    | Vite                                                           |
| **Architecture**            | Bulletproof React (Feature-Based Modular)                      |
| **Client / App State**      | Zustand (Cart store, Notification toast store)                 |
| **DB Cache & Queries**      | TanStack Query v5 (React Query)                                |
| **Local Database**          | Dexie.js (`dexie` + `dexie-react-hooks`) over IndexedDB        |
| **P2P Networking**          | WebRTC DataChannel (Direct LAN & Google STUN)                  |
| **UI Components & Styling** | Tailwind CSS + shadcn/ui + Lucide React Icons                  |
| **Form & Validation**       | React Hook Form + Zod (`@hookform/resolvers`)                  |
| **Routing**                 | React Router v7/v6 (Lazy-loaded routes)                        |
| **Testing Suite**           | Vitest + React Testing Library + `fake-indexeddb` + Playwright |
| **PWA Support**             | `vite-plugin-pwa` (Service Worker offline caching)             |

---

## 3. Project Structure

```text
.
├── .husky/                           // Git Hooks (pre-commit lint, format, typecheck)
├── components.json                   // shadcn/ui configuration file (configured to @/lib/cn)
├── e2e/                              // Playwright End-to-End Tests
│   └── tests/
│       ├── smoke.spec.ts             // App loading & PWA offline readiness check
│       └── cashier-checkout.spec.ts  // Full cashier checkout transaction flow
│
├── src/
│   ├── app/                          // Application Layer
│   │   ├── pages/                    // Page compositions (Lazy Loaded)
│   │   │   ├── cashier-page.tsx      // [Domain 1] Front-End Kasir Terminal POS
│   │   │   ├── orders-page.tsx       // [Domain 1] Riwayat Transaksi & Cetak Ulang Struk
│   │   │   ├── shifts-page.tsx       // [Domain 1] Shift & Uang Kas (Coming Soon)
│   │   │   ├── store-profile-page.tsx// [Domain 2] Profil Toko, Mata Uang, & Terminal
│   │   │   ├── products-page.tsx     // [Domain 2] Katalog Produk, Kategori, UOM, Varian, Modifiers
│   │   │   ├── discounts-page.tsx    // [Domain 2] Pengaturan Diskon & Promosi
│   │   │   ├── taxes-page.tsx        // [Domain 2] Pajak PB1/PPN & Biaya Layanan Service Charge
│   │   │   ├── customers-page.tsx    // [Domain 2] Database Pelanggan & Member Toko
│   │   │   ├── suppliers-page.tsx    // [Domain 2] Database Pemasok & Vendor Kulakan
│   │   │   ├── tables-page.tsx       // [Domain 2] Denah Meja & Ruangan Interaktif
│   │   │   ├── receipt-page.tsx      // [Domain 2] Desain & Kustomisasi Nota/Struk Thermal
│   │   │   ├── expenses-page.tsx     // [Domain 3] Pengeluaran Operasional & Pembelian Stok (PO)
│   │   │   ├── stock-adjustment-page.tsx // [Domain 3] Penyesuaian Stok (Stock Opname)
│   │   │   ├── dashboard-page.tsx    // [Domain 4] Dasbor Ringkasan Bisnis & Penjualan Hari Ini
│   │   │   ├── reports-page.tsx      // [Domain 4] Laporan P&L, Produk, Pembayaran, & Tutup Buku
│   │   │   ├── sync-page.tsx         // [Domain 5] Sinkronisasi WebRTC P2P & QR Code Pairing
│   │   │   └── settings-page.tsx     // [Domain 5] Pengaturan Sistem (Tampilan, PIN, Backup Data)
│   │   ├── app.tsx                   // Root App component with ErrorBoundary & MainLayout
│   │   ├── provider.tsx              // Global Providers (QueryClientProvider, ErrorBoundary, Toaster)
│   │   └── router.tsx                // Router configuration with React.lazy & RootErrorBoundary
│   │
│   ├── assets/                       // Static assets (images, icons, fonts)
│   │
│   ├── components/                   // Shared Global UI Components (shadcn/ui model)
│   │   ├── ui/                       // button.tsx, card.tsx, dialog.tsx, input.tsx, sidebar.tsx...
│   │   ├── app-sidebar.tsx           // 4-Domain Collapsible Sidebar Navigation
│   │   ├── nav-main.tsx              // Modular Tree Navigation for Sidebar
│   │   ├── nav-user.tsx              // Store Profile & User Role Switcher Dropdown
│   │   ├── nav-secondary.tsx         // Secondary Navigation Items
│   │   ├── error-fallback.tsx        // Fallback UI for caught runtime component errors
│   │   ├── header-status-badge.tsx   // Dynamic P2P WebRTC connection status indicator
│   │   └── main-layout.tsx           // Primary navigation layout frame (SidebarProvider + SidebarInset)
│   │
│   ├── config/                       // Global configuration & environment constants
│   │   └── env.ts
│   │
│   ├── features/                     // Feature-Based Modules
│   │   ├── cashier/                  // Cashier terminal, cart store, & payment dialogs
│   │   ├── customers/                // Customer database & membership tiers
│   │   ├── expenses/                 // Operational expenses & purchase orders (PO)
│   │   ├── inventory/                // Stock opname & inventory adjustments
│   │   ├── onboarding/               // Store initialization wizard & starter templates
│   │   ├── orders/                   // Sales history, receipt preview, & daily sales card
│   │   ├── products/                 // Product catalog, categories, UOM, variants, & modifiers
│   │   ├── reports/                  // Profit & Loss (P&L), sales analytics, & book closing
│   │   ├── settings/                 // Data backup, import/export, & system preferences
│   │   ├── suppliers/                // Supplier & vendor directory
│   │   ├── sync/                     // WebRTC DataChannel P2P sync engine & QR pairing
│   │   └── tables/                   // Interactive table layout & canvas floor plan
│   │
│   ├── hooks/                        // Shared Global Hooks
│   │   ├── use-app-mode.ts           // Simple (Lite) vs Advanced (Pro) mode switcher
│   │   ├── use-mobile.ts             // Responsive viewport breakpoint detector
│   │   ├── use-online-status.ts      // Network online/offline status
│   │   └── use-theme.ts              // Light/Dark mode state & system theme sync
│   │
│   ├── lib/                          // Preconfigured Reusable Libraries
│   │   ├── cn.ts                     // Class merging helper (clsx + tailwind-merge)
│   │   ├── db.ts                     // Dexie.js DB instance (IndexedDB V7 with 13 tables)
│   │   ├── i18n.ts                   // Internationalization (i18next) configuration
│   │   ├── passphrase.ts             // BIP-39 12-word mnemonic helper
│   │   ├── query-client.ts           // TanStack QueryClient setup with global error handlers
│   │   └── webrtc.ts                 // WebRTC DataChannel P2P Client Engine
│   │
│   ├── locales/                      // i18n Translation Dictionaries
│   │   ├── en.json                   // English dictionary
│   │   └── id.json                   // Bahasa Indonesia dictionary (Default)
│   │
│   ├── stores/                       // Global Application State (Zustand)
│   │   ├── auth-store.ts             // Current User Role & RBAC permissions state
│   │   └── notification-store.ts     // Global Toast Notification Store
│   │
│   ├── testing/                      // Testing Utilities, Fixtures & Setup
│   │   ├── setup-tests.ts            // Vitest global setup (fake-indexeddb, jest-dom)
│   │   ├── test-utils.tsx            // Custom renderWithProviders helper
│   │   └── mocks/                    // Mock data generators (products, orders)
│   │
│   ├── types/                        // Shared TypeScript Entity Types
│   │   ├── cloud-backup.types.ts
│   │   ├── currency.types.ts
│   │   ├── customer.types.ts
│   │   ├── expense.types.ts
│   │   ├── master-data.types.ts
│   │   ├── order.types.ts
│   │   ├── product.types.ts
│   │   ├── stock-adjustment.types.ts
│   │   ├── store.types.ts
│   │   ├── supplier.types.ts
│   │   ├── sync.types.ts
│   │   └── table.types.ts
│   │
│   ├── utils/                        // Shared Pure Utility Functions
│   │   ├── audio.ts                  // POS notification sounds synthesizer
│   │   ├── currency-config.ts        // Multi-currency formatter & symbols
│   │   ├── format-currency.ts        // Currency formatter helper
│   │   ├── image-compressor.ts       // Client-side image compression for offline DB
│   │   └── uuid.ts                   // crypto.randomUUID() generator
│   │
│   └── main.tsx                      // React Root Application Entry Point
```

---

# Part 2 — Data & Synchronization Rules

## 4. Entity Standards & Identity (UUID v4)

- All data entities MUST use **UUID v4** generated via `crypto.randomUUID()`.
- Auto-incrementing integer IDs are STRICTLY FORBIDDEN to eliminate ID collisions between offline peer devices.

### Strict Timestamps:

Every data entity MUST include 3 audit timestamp fields:

1. `createdAt: number` — Millisecond timestamp of initial creation.
2. `updatedAt: number` — Millisecond timestamp of latest mutation (primary key for LWW conflict resolution).
3. `deletedAt: number | null` — `null` if active, or millisecond timestamp if soft-deleted.

---

## 5. The 3 Data Operations (`get`, `upsert`, `delete`)

To prevent race conditions and synchronize data cleanly across devices, all data operations are simplified into 3 standard methods:

1. **`get(id: string)` / `getAll()`:** Reads data from local Dexie.js (automatically filtered where `deletedAt === null`).
2. **`upsert(entity: T)`:** Inserts if new, or updates if the ID already exists. Always updates `updatedAt = Date.now()`.
3. **`delete(id: string)`:** **Soft Delete**. Populates `deletedAt = Date.now()` and `updatedAt = Date.now()`. Never perform physical hard deletes on IndexedDB tables unless a full store reset is requested.

---

## 6. P2P Synchronization Protocol & Last-Write-Wins (LWW)

### Sync Message Shape (`src/types/sync.types.ts`):

```typescript
export interface SyncMessage<T = unknown> {
  action: 'UPSERT' | 'DELETE';
  collection: 'products' | 'orders' | 'settings';
  data: T;
  updatedAt: number;
  deviceId: string;
}
```

### Ingestion Logic (Handling Incoming Messages):

When receiving a sync message from a peer over WebRTC:

1. Check the local entity in Dexie using `data.id`.
2. **LWW (Last-Write-Wins) Rule:** If the entity does not exist locally, or `msg.updatedAt > localEntity.updatedAt`, apply the mutation via `table.put(msg.data)`.
3. If `msg.updatedAt <= localEntity.updatedAt`, ignore the incoming message (the local copy is newer or identical).
4. Trigger `queryClient.invalidateQueries({ queryKey: [msg.collection] })` to update UI immediately with zero latency.

---

# Part 3 — State Management & UI Standards

## 7. The 5-Tier State Management

1. **Component State (`useState`, `useReducer`):** Strictly for localized UI state (modal visibility, open dropdowns).
2. **Application State (Zustand):**
   - Cashier Shopping Cart (`cart-store.ts`): items, add/remove, quantity adjustment, discount.
   - Global Toast Notifications (`notification-store.ts`).
   - Current User Role & RBAC permissions (`auth-store.ts`).
   - Always use **Atomic Selectors** (`useCartStore(state => state.items)`) to eliminate unnecessary re-renders.
3. **Database / Cache State (TanStack Query):**
   - All reads from Dexie tables are wrapped in `useQuery`.
   - All writes/mutations are wrapped in `useMutation` with `onSuccess` callbacks that invalidate relevant query keys.
4. **Form State (React Hook Form + Zod):**
   - All forms (Add/Edit Product, Passphrase Input) MUST be validated against Zod schemas.
5. **URL State (React Router):**
   - Category filters, cashier search queries, and settings sub-tabs are synchronized with `useSearchParams()`.

---

## 8. The 4-Domain Information Architecture (POS Operating Model)

To keep the application intuitive, modular, and aligned with retail and F&B business flows, all features and navigation are organized into 4 primary operational domains plus 1 infrastructure domain:

| Domain                                                     | Scope & Purpose                                                                                                              | Core Pages & Routes                                                                                                                                                                                                                               |
| :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Domain Penjualan** _(Front-End Kasir)_                | Interaksi transaksi langsung di toko, kecepatan kasir, keranjang belanja, holding cart, struk, dan laci kasir.               | `/` (Kasir POS), `/orders` (Riwayat Transaksi), `/shifts` (Shift & Uang Kas)                                                                                                                                                                      |
| **2. Domain Data Toko** _(Pusat Data Induk)_               | Master data & parameter operasional yang ditarik saat transaksi kasir.                                                       | `/store-profile` (Profil Toko), `/products` (Katalog, Kategori, UOM, Varian, Modifier), `/discounts` (Promo), `/taxes` (PB1/PPN/Service Charge), `/customers` (Member), `/suppliers` (Vendor), `/tables` (Denah Meja), `/receipt-settings` (Nota) |
| **3. Domain Akuntansi & Inventaris** _(Back-Office)_       | Arus kas keluar (biaya sewa, gaji, utilitas), pengadaan barang (PO kulakan), dan pencocokan fisik stok.                      | `/expenses` (Pengeluaran Kas), `/expenses?type=PURCHASE_STOCK` (Pembelian PO), `/inventory/adjustments` (Stock Opname)                                                                                                                            |
| **4. Domain Laporan & Analitik** _(Business Intelligence)_ | Dashboard performa penjualan real-time, grafik tren harian, metode pembayaran terlaris, dan perhitungan P&L bersih.          | `/dashboard` (Dasbor Ringkasan), `/reports?tab=pnl` (Laba Rugi P&L), `/reports?tab=products` (Produk Terlaris), `/reports?tab=payments` (Metode Bayar), `/reports?tab=export` (Tutup Buku)                                                        |
| **5. Domain Sistem & Infrastruktur** _(Platform & P2P)_    | Sinkronisasi terdesentralisasi antar-perangkat, preferensi visual/suara, otorisasi PIN, dan manajemen cadangan data offline. | `/sync` (Sinkronisasi P2P WebRTC), `/settings?tab=appearance` (Tampilan & Suara), `/settings?tab=security` (Keamanan PIN), `/settings?tab=data` (Backup & Reset DB)                                                                               |

---

## 9. Project Standards & Tooling

### 1. ESLint & Static Analysis

- Maintain strict code cleanliness and consistency across the codebase.
- Prevent architectural boundary violations early during development.

### 2. Prettier

- Enforce consistent code formatting.
- `.prettierrc` configuration must be active alongside editor "format on save".

### 3. TypeScript (Strict Mode)

- Strict Mode enabled without using the `any` type.
- When refactoring, always update type definitions (`types/`) first before adjusting implementation code.

### 4. Husky & Git Hooks

- Run automated pre-commit checks: _linting_, _formatting_, and _type-checking_ to ensure clean repository commits.

### 5. Absolute Imports (`@/*`)

- Always use the `@/*` alias for internal imports.
- Multi-level relative imports (such as `../../../../components/ui/button`) are strictly forbidden.
- Configured in `tsconfig.json` & `vite.config.ts`:
  ```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  ```

### 6. File & Folder Naming Conventions (`eslint-plugin-check-file`)

- All files and folders (except `__tests__`) MUST follow **`kebab-case`**.
- ESLint configuration rule:
  ```javascript
  'check-file/filename-naming-convention': [
    'error',
    {
      '**/*.{ts,tsx}': 'KEBAB_CASE',
    },
    {
      ignoreMiddleExtensions: true, // supports extensions like .test.tsx, .spec.ts
    },
  ],
  'check-file/folder-naming-convention': [
    'error',
    {
      'src/**/!(__tests__)': 'KEBAB_CASE',
    },
  ],
  ```

### 7. Core Quality Principles

- **Zero Runtime CSS:** Use pure Tailwind CSS utility classes.
- **Children Prop Pattern:** Apply the `children` pattern on container wrappers for Virtual DOM isolation.
- **Error Boundaries:** Wrap routes and critical widgets in `react-error-boundary` with cashier-friendly fallback views.

---

## 9. Components & Styling Best Practices

### 1. Colocation Principle

- Keep components, helper functions, types, and state as close as possible to where they are used (`src/features/<feature>/components/`).
- Reduces redundant re-renders and simplifies code maintenance.

### 2. Avoid Monolithic Components & Nested Render Functions

- Do not create nested inline rendering functions (such as `function renderItems() { ... }`) inside large components.
- Extract self-contained UI fragments into dedicated components with a Single Responsibility Principle.

### 3. Limit Component Props & Favor Composition

- Avoid passing too many props. Use composition techniques via _children props_ or _slots_ to build flexible, modular interfaces.

### 4. Maximize shadcn/ui Primitives (`src/components/ui/`)

- Place all shared UI primitives in [`src/components/ui/`](file:///d:/Projects/tookoo/src/components/ui) following the shadcn/ui code ownership model.
- Maximize the use of standard shadcn/ui components (`Button`, `Card`, `Badge`, `Dialog`, `Input`, `Sheet`, `Table`, `Tabs`, `DropdownMenu`, `Toast`, `ScrollArea`) for UI consistency, accessibility, and clean design tokens.
- Wrap third-party components to adapt them to POS application requirements.

### 5. Zero-Runtime Styling (Tailwind CSS) & `cn` Helper

- Build-time generated Tailwind CSS utility classes only.
- Use the `cn()` helper (`clsx` + `tailwind-merge`) in [`src/lib/cn.ts`](file:///d:/Projects/tookoo/src/lib/cn.ts) for dynamic class combination. Configured in `components.json` as the standard utils alias (`@/lib/cn`).

---

# Part 4 — Security & Access Control

## 10. Authentication & Store Identity

- **Self-Sovereign Store Pairing:** Tookoo does not rely on a centralized authentication server. Store identity and access are secured via a Store Secret Key generated during store initialization and shared securely via QR Code or 12-Word BIP-39 mnemonic passphrase.
- **Session & Key Storage:** Store keys are stored in IndexedDB/Dexie table `settings` (never in plain `localStorage` which is vulnerable to XSS) and loaded into memory state when active.

## 11. Authorization (RBAC & PBAC)

- **Role-Based Access Control (RBAC):**
  - `OWNER`: Full access to store settings, QR pairing generation, revenue reports, database export, and store reset.
  - `CASHIER` / `STAFF`: Restricted to sales operations (product catalog, shopping cart, checkout, receipt printing).
- **Permission-Based Access Control (PBAC):**
  - Sensitive operations such as deleting catalog products or voiding orders require active role authorization.

## 12. Client-Side Security & XSS Mitigation

- **Input Sanitization & Schema Validation:** All user inputs (product names, categories, prices, cashier names) MUST be validated against strict Zod schemas before being persisted.
- **No Sensitive Data in URLs:** Secret keys or sensitive store tokens must never be placed in URL query parameters (`useSearchParams`).
- **Safe Rendering:** Never use `dangerouslySetInnerHTML` without verified HTML sanitization.

---

# Part 5 — Voice, Tone & POS UI Copy Standards

## 13. Tookoo's Brand Voice (POS Operator Mindset)

Tookoo speaks like a **smart, fast, and trustworthy cashier assistant (_Smart, Fast & Trustworthy POS Partner_)**.
Our users are MSME business owners and cashiers serving customers in fast-paced retail and F&B queues. All interface text (UI copy) must be immediately understood in $\le 1$ second with zero cognitive friction.

### Voice Qualities

| Quality                   | Meaning in POS Context                                                       | What it is NOT                  |
| :------------------------ | :--------------------------------------------------------------------------- | :------------------------------ |
| **Fast & Direct**         | Straight to the action. Short sentences, active verbs, zero fluff.           | Cold, abrupt, confusing         |
| **Reliable & Reassuring** | Confirms status (offline, saved, change due, connected) with exact numbers.  | Uncertain, slow, ambiguous      |
| **Pragmatic**             | Clear retail terms (Revenue, Stock, Change, Receipt) without complex jargon. | Over-engineered, verbose        |
| **Professional**          | Keeps cashier workflows calm, orderly, and fast during rush hours.           | Stiff, legalistic, bureaucratic |

---

## 14. Voice by Moment (POS Scenarios)

### 1. Checkout & Successful Payment

- **Tone:** Decisive, fast, highlighting key numbers (Change Due & Total).
- **✅ Examples:** `"Payment Successful. Change Due: Rp 15,000."`, `"Transaction Complete."`
- **❌ Avoid:** `"Hooray! The customer payment has been successfully recorded into the database!"`

### 2. Inventory & Stock Status

- **Tone:** Informative, proactive, non-alarmist.
- **✅ Examples:** `"3 left in stock"`, `"Out of stock"`, `"Product added to catalog."`
- **❌ Avoid:** `"Oh no! You have completely run out of stock for this item!"`

### 3. P2P Connectivity & Offline Status

- **Tone:** Transparent and reassuring (100% data safety guarantee).
- **✅ Examples:** `"Local Store Mode (Offline). Data safely stored on device."`, `"Connected to 2 cashier terminals."`
- **❌ Avoid:** `"Internet connection lost! Application cannot function."`

### 4. Confirmations & Destructive Actions

- **Tone:** Direct, concise question focused on action.
- **✅ Examples:** `"Delete this product?"`, `"Cancel this order?"`
- **❌ Avoid:** `"Are you entirely sure you want to permanently delete this product from the database?"`

### 5. Empty States

- **Tone:** Welcoming and action-oriented with a clear CTA.
- **✅ Examples:** `"No products yet. Add your first product to start sales."`, `"No transactions recorded today."`
- **❌ Avoid:** `"Oops! No data was found here."`

### 6. Errors & Technical Issues

- **Tone:** Honest, calm, immediately providing a solution or auto-retry.
- **✅ Examples:** `"Failed to scan QR. Check camera permissions and try again."`, `"Unable to save locally. Retrying..."`
- **❌ Avoid:** `"Error 500: Uncaught Exception"`, `"Oopsie! Something went wrong! 😅"`

---

## 15. What Tookoo UI Copy Never Does

- **Never uses filler or over-cheerful exclamation marks.** Maximum 0–1 exclamation mark (`!`), avoiding cheer words like "Hooray", "Oops", "Yay".
- **Never blames the cashier or store owner.** Focus on what happened and how to proceed.
- **Never uses unicode emojis in UI copy.** Use semantic vector icons from `lucide-react` (e.g., `<Receipt />`, `<Package />`, `<Trash2 />`).
- **Never displays raw developer errors or unformatted stack traces.**

---

## 16. UI Copy Consistency & Microcopy Rules

### 1. Button & Action Labels (Format: Verb + Noun)

Always use consistent **Verb + Noun** patterns across all modules:

| Action              | Correct Label                       | Avoid (Inconsistent)             |
| :------------------ | :---------------------------------- | :------------------------------- |
| Add new item        | **Add Product**, **Add Item**       | "Create New", "Input", "Add"     |
| Save form / changes | **Save Product**, **Save Settings** | "Submit", "Save", "OK"           |
| Process payment     | **Pay Now**, **Process Payment**    | "Checkout", "Continue", "Finish" |
| Print receipt       | **Print Receipt**                   | "Print", "Generate Slip"         |
| Delete data         | **Delete Product**, **Delete Item** | "Remove", "Trash", "Discard"     |
| Dismiss modal       | **Cancel**                          | "Close", "Dismiss", "Exit"       |

### 2. Loading State Pattern (3 Steps: Idle → Loading → Result)

| State       | Pattern           | Example                       |
| :---------- | :---------------- | :---------------------------- |
| **Idle**    | Verb + Noun       | `"Save Product"`              |
| **Loading** | Verb + `...`      | `"Saving..."`                 |
| **Success** | Past / Done       | `"Product Saved"`             |
| **Error**   | Action + Solution | `"Failed to save. Try again"` |

### 3. Currency & Date Formatting

- All monetary amounts MUST be formatted with the [`formatCurrency()`](file:///d:/Projects/tookoo/src/utils/format-currency.ts) helper (e.g., `Rp 25.000`, not `25000` or `IDR 25000.00`).
- Transaction dates and timestamps use concise local formats (e.g., `Aug 17, 2026, 20:30`).

---

## 17. Internationalization (i18n) & Multi-Language Support

- **Default Language:** **Bahasa Indonesia (`id`)** is the primary default language for Tookoo, with English (`en`) supported out of the box.
- **Library & Setup:** Powered by `i18next` and `react-i18next` configured in [`src/lib/i18n.ts`](file:///d:/Projects/tookoo/src/lib/i18n.ts).
- **Locale Dictionaries:** All user-facing strings are maintained in [`src/locales/id.json`](file:///d:/Projects/tookoo/src/locales/id.json) and [`src/locales/en.json`](file:///d:/Projects/tookoo/src/locales/en.json) grouped by feature namespaces (`common`, `nav`, `status`, `cashier`, `products`, `orders`, `sync`).
- **No Hardcoded UI Strings:** All components MUST use `const { t } = useTranslation()` for labels, placeholders, dialogs, button texts, and error alerts.
- **Dynamic Language Switching:** Language state can be switched dynamically (e.g., via the header language button) without full page reload.

---

# Part 6 — Performance & Optimization Standards

## 18. Route-Level Code Splitting

- Always use `React.lazy()` at the route level ([`src/app/router.tsx`](file:///d:/Projects/tookoo/src/app/router.tsx)) to minimize initial JavaScript bundle size.
- Avoid micro-splitting small UI components to prevent network request waterfalls.

## 19. Component & State Optimizations

- **State Locality:** Colocate state as close as possible to the consuming component. Avoid single monolithic global stores.
- **Lazy State Initialization:** Use callback initializers `useState(() => expensiveComputation())` to prevent redundant computations on re-render.
- **Atomic Selectors (Zustand):** Always use precise selectors (`useCartStore(state => state.items)`) to ensure components only re-render when their slice of state changes.
- **Children Prop Pattern (Virtual DOM Isolation):** Use the `children` pattern on container wrappers to isolate sub-tree Virtual DOM re-renders.
- **Zero-Runtime CSS:** Build-time generated Tailwind CSS eliminates runtime CSS overhead.

## 20. Data Prefetching & Media Optimizations

- **Data Prefetching:** Use `queryClient.prefetchQuery()` on navigation hover to make page transitions feel instantaneous.
- **Image & Icon Optimization:**
  - Use vector SVG or modern WebP formats.
  - Apply `loading="lazy"` for product catalog images below the fold.
- **Web Vitals First:** Optimize Core Web Vitals (especially INP - _Interaction to Next Paint_ and LCP - _Largest Contentful Paint_) to ensure instant 0ms cashier interaction response.

---

# Part 7 — Error Handling & Resilience

## 21. Local DB & Query Error Management

- **Centralized Query Error Handling:** Configure `QueryCache` and `MutationCache` in [`src/lib/query-client.ts`](file:///d:/Projects/tookoo/src/lib/query-client.ts) with global error listeners that trigger toast notifications (`notification-store.ts`) on IndexedDB or WebRTC failures.
- **Graceful Mutation Rollback:** Failed cashier transactions must safely recover state without causing local database corruption.

## 22. Multi-Level Error Boundaries

- **Localized Error Boundaries:** Apply `react-error-boundary` across multiple levels:
  - _Route Level:_ Prevents an error in reports or history from crashing the main cashier terminal.
  - _Widget Level:_ Isolates sensitive components (e.g., QR Camera scanner or WebRTC connection widget) with cashier-friendly fallback views ([`src/components/error-fallback.tsx`](file:///d:/Projects/tookoo/src/components/error-fallback.tsx)).

## 23. Error Logging & Observability

- All uncaught runtime errors are logged with contextual metadata (component name, failed action) without exposing private store credentials or BIP-39 mnemonic passphrases.

---

# Part 8 — Testing Standards

## 24. Testing Strategy & Execution

1. **Unit Testing (Vitest):**
   - Location: Colocated in `__tests__/` or `src/utils/__tests__/`.
   - Tests pure business logic, currency formatting, UUID generator, and LWW timestamp algorithms.
2. **Integration Testing (Testing Library + `fake-indexeddb`):**
   - Tests TanStack Query hooks interacting with the local Dexie DB.
   - Tests cashier cart actions from item selection to checkout.
3. **End-to-End Testing (Playwright):**
   - Location: `e2e/tests/`.
   - Tests real-world end-to-end user flows from store pairing to payment completion.

---

# Part 9 — The Golden Do's & Don'ts

### ✅ DO'S

- Always use `crypto.randomUUID()` for new entity IDs.
- Always update `updatedAt = Date.now()` on every `upsert` and `delete` operation.
- Always filter `where('deletedAt').equals(null)` when querying active records for cashier views.
- Always use specific atomic selectors when reading state from Zustand stores.
- Always split route pages using `React.lazy()` in `src/app/router.tsx`.

### ❌ DON'TS

- NEVER perform _Cross-Feature Imports_ (e.g., `features/cashier` importing directly from `features/products/components`).
- NEVER use barrel files (`index.ts` re-exporting modules).
- NEVER perform hard deletes on physical database tables unless a full store reset is explicitly requested.
- NEVER execute heavy synchronous computations directly in component render phases.
- NEVER use the `any` type in TypeScript.
