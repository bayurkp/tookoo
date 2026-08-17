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

Dependencies flow **inward only**: `App Routes → Features → Shared Modules (Components, Hooks, Lib, Types, Utils)`.

```text
User interaction in UI Route
  ↓ triggers action   →  Zustand Store (UI state) or TanStack Mutation Hook
  ↓ calls API layer   →  Dexie.js Repository (Local DB Mutation)
  ↓ broadcasts event  →  WebRTC P2P DataChannel (SyncMessage to connected peers)
  ↑ mutates IndexedDB →  Dexie reactive write (0ms latency)
  ↑ invalidates query →  TanStack Query refetches from Dexie
  ↑ UI re-renders     →  Component updates with zero lag
```

### Hard Rules:

- **No Cross-Feature Imports:** Code in `src/features/orders` MUST NEVER import from `src/features/products`. Cross-feature composition is strictly done at the application level (`src/app/routes/`).
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
│   │   ├── routes/                   // Route & Page compositions (Lazy Loaded)
│   │   │   ├── __tests__/            // Route integration tests
│   │   │   │   └── cashier-route.test.tsx
│   │   │   ├── cashier-route.tsx     // Cashier terminal & cart layout composition
│   │   │   ├── products-route.tsx    // Product catalog management screen
│   │   │   ├── orders-route.tsx      // Receipts history & daily sales report
│   │   │   └── sync-route.tsx        // P2P pairing & synchronization screen
│   │   ├── app.tsx                   // Root App component with ErrorBoundary & MainLayout
│   │   ├── provider.tsx              // Global Providers (QueryClientProvider, ErrorBoundary, Toaster)
│   │   └── router.tsx                // Router configuration with React.lazy & localized ErrorBoundaries
│   │
│   ├── assets/                       // Static assets (images, icons, fonts)
│   │
│   ├── components/                   // Shared Global UI Components (shadcn/ui model)
│   │   ├── ui/                       // button.tsx, card.tsx, dialog.tsx, input.tsx, badge.tsx...
│   │   │   └── __tests__/            // Unit tests for core UI components
│   │   ├── error-fallback.tsx        // Fallback UI for caught runtime component errors
│   │   ├── header-status-badge.tsx   // Dynamic P2P WebRTC connection status indicator
│   │   └── main-layout.tsx           // Primary navigation layout frame
│   │
│   ├── config/                       // Global configuration & environment constants
│   │   └── env.ts
│   │
│   ├── features/                     // Feature-Based Modules
│   │   ├── cashier/                  // Cashier terminal & transaction flow
│   │   │   ├── components/           // product-grid.tsx, cart-sheet.tsx, payment-modal.tsx
│   │   │   ├── hooks/                // use-cashier-actions.ts
│   │   │   ├── stores/               // cart-store.ts (Zustand with atomic selectors)
│   │   │   └── types/                // cart.types.ts
│   │   │
│   │   ├── products/                 // Product Catalog & Inventory Management
│   │   │   ├── api/                  // get-products.ts, upsert-product.ts, delete-product.ts
│   │   │   ├── components/           // product-card.tsx, product-form-dialog.tsx (RHF + Zod)
│   │   │   ├── hooks/                // use-products.ts (TanStack Query hooks)
│   │   │   └── types/                // product-form.types.ts
│   │   │
│   │   ├── orders/                   // Sales History & Receipts
│   │   │   ├── api/                  // get-orders.ts, upsert-order.ts
│   │   │   ├── components/           // order-receipt-dialog.tsx, daily-summary-card.tsx
│   │   │   └── hooks/                // use-orders.ts (TanStack Query hooks)
│   │   │
│   │   └── sync/                     // P2P Pairing & Store Keys
│   │       ├── components/           // qr-display-card.tsx, qr-scanner-modal.tsx, passphrase-form.tsx
│   │       └── hooks/                // use-p2p-sync.ts
│   │
│   ├── hooks/                        // Shared Global Hooks
│   │   └── use-online-status.ts
│   │
│   ├── lib/                          // Preconfigured Reusable Libraries
│   │   ├── cn.ts                     // Class merging helper (clsx + tailwind-merge)
│   │   ├── db.ts                     // Dexie.js DB instance (products, orders, settings tables)
│   │   ├── webrtc.ts                 // WebRTC DataChannel P2P Client Engine
│   │   ├── passphrase.ts             // BIP-39 12-word mnemonic helper
│   │   └── query-client.ts           // TanStack QueryClient setup with global error handlers
│   │
│   ├── stores/                       // Global Application State (Zustand)
│   │   └── notification-store.ts     // Global Toast Notification Store
│   │
│   ├── testing/                      // Testing Utilities, Fixtures & Setup
│   │   ├── setup-tests.ts            // Vitest global setup (fake-indexeddb, jest-dom)
│   │   ├── test-utils.tsx            // Custom renderWithProviders helper
│   │   └── mocks/                    // Mock data generators (products, orders)
│   │
│   ├── types/                        // Shared TypeScript Entity Types
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   ├── store.types.ts
│   │   └── sync.types.ts
│   │
│   ├── utils/                        // Shared Pure Utility Functions
│   │   ├── __tests__/                // Unit tests for pure helpers
│   │   ├── uuid.ts                   // crypto.randomUUID()
│   │   └── format-currency.ts        // Indonesian Rupiah (IDR) currency formatter
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
  action: "UPSERT" | "DELETE"
  collection: "products" | "orders" | "settings"
  data: T
  updatedAt: number
  deviceId: string
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
   - Always use **Atomic Selectors** (`useCartStore(state => state.items)`) to eliminate unnecessary re-renders.
3. **Database / Cache State (TanStack Query):**
   - All reads from Dexie tables are wrapped in `useQuery`.
   - All writes/mutations are wrapped in `useMutation` with `onSuccess` callbacks that invalidate relevant query keys.
4. **Form State (React Hook Form + Zod):**
   - All forms (Add/Edit Product, Passphrase Input) MUST be validated against Zod schemas.
5. **URL State (React Router):**
   - Category filters and cashier search queries are synchronized with `useSearchParams()`.

---

## 8. Project Standards & Tooling

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

# Part 6 — Performance & Optimization Standards

## 17. Route-Level Code Splitting

- Always use `React.lazy()` at the route level ([`src/app/router.tsx`](file:///d:/Projects/tookoo/src/app/router.tsx)) to minimize initial JavaScript bundle size.
- Avoid micro-splitting small UI components to prevent network request waterfalls.

## 18. Component & State Optimizations

- **State Locality:** Colocate state as close as possible to the consuming component. Avoid single monolithic global stores.
- **Lazy State Initialization:** Use callback initializers `useState(() => expensiveComputation())` to prevent redundant computations on re-render.
- **Atomic Selectors (Zustand):** Always use precise selectors (`useCartStore(state => state.items)`) to ensure components only re-render when their slice of state changes.
- **Children Prop Pattern (Virtual DOM Isolation):** Use the `children` pattern on container wrappers to isolate sub-tree Virtual DOM re-renders.
- **Zero-Runtime CSS:** Build-time generated Tailwind CSS eliminates runtime CSS overhead.

## 19. Data Prefetching & Media Optimizations

- **Data Prefetching:** Use `queryClient.prefetchQuery()` on navigation hover to make page transitions feel instantaneous.
- **Image & Icon Optimization:**
  - Use vector SVG or modern WebP formats.
  - Apply `loading="lazy"` for product catalog images below the fold.
- **Web Vitals First:** Optimize Core Web Vitals (especially INP - _Interaction to Next Paint_ and LCP - _Largest Contentful Paint_) to ensure instant 0ms cashier interaction response.

---

# Part 7 — Error Handling & Resilience

## 20. Local DB & Query Error Management

- **Centralized Query Error Handling:** Configure `QueryCache` and `MutationCache` in [`src/lib/query-client.ts`](file:///d:/Projects/tookoo/src/lib/query-client.ts) with global error listeners that trigger toast notifications (`notification-store.ts`) on IndexedDB or WebRTC failures.
- **Graceful Mutation Rollback:** Failed cashier transactions must safely recover state without causing local database corruption.

## 21. Multi-Level Error Boundaries

- **Localized Error Boundaries:** Apply `react-error-boundary` across multiple levels:
  - _Route Level:_ Prevents an error in reports or history from crashing the main cashier terminal.
  - _Widget Level:_ Isolates sensitive components (e.g., QR Camera scanner or WebRTC connection widget) with cashier-friendly fallback views ([`src/components/error-fallback.tsx`](file:///d:/Projects/tookoo/src/components/error-fallback.tsx)).

## 22. Error Logging & Observability

- All uncaught runtime errors are logged with contextual metadata (component name, failed action) without exposing private store credentials or BIP-39 mnemonic passphrases.

---

# Part 8 — Testing Standards

## 23. Testing Strategy & Execution

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
