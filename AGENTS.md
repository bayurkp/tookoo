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
- **Shared Isolation:** Modul di `src/components`, `src/lib`, `src/types`, `src/utils`, dan `src/hooks` DILARANG mengimpor dari `src/features` atau `src/app`.
- **No Barrel Files:** Hindari `index.ts` barrel files untuk memaksimalkan *tree-shaking* dan performa bundling Vite. Impor langsung ke file spesifik (contoh: `import { Button } from '@/components/ui/button';`).
- **No Raw Data Mutation:** Data mutation strictly follows `get`, `upsert`, and `delete`.

---

## 2. Technology Stack

| Concern | Solution / Package |
| :--- | :--- |
| **Framework & Language** | React 19 + TypeScript (Strict Mode, no `any`) |
| **Build Tool & Bundler** | Vite |
| **Architecture** | Bulletproof React (Feature-Based Modular) |
| **Client / App State** | Zustand (Cart store, Notification toast store) |
| **DB Cache & Queries** | TanStack Query v5 (React Query) |
| **Local Database** | Dexie.js (`dexie` + `dexie-react-hooks`) over IndexedDB |
| **P2P Networking** | WebRTC DataChannel (Direct LAN & Google STUN) |
| **UI Components & Styling** | Tailwind CSS + shadcn/ui + Lucide React Icons |
| **Form & Validation** | React Hook Form + Zod (`@hookform/resolvers`) |
| **Routing** | React Router v7/v6 (Lazy-loaded routes) |
| **Testing Suite** | Vitest + React Testing Library + `fake-indexeddb` + Playwright |
| **PWA Support** | `vite-plugin-pwa` (Service Worker offline caching) |

---

## 3. Project Structure

```text
.
├── .husky/                           // Git Hooks (pre-commit lint, format, typecheck)
├── e2e/                              // Playwright End-to-End Tests
│   └── tests/
│       ├── smoke.spec.ts             // Cek load aplikasi & PWA offline readiness
│       └── cashier-checkout.spec.ts  // Alur transaksi kasir lengkap
│
├── src/
│   ├── app/                          // Application Layer
│   │   ├── routes/                   // Route & Page compositions (Lazy Loaded)
│   │   │   ├── __tests__/            // Integration tests per-route
│   │   │   │   └── cashier-route.test.tsx
│   │   │   ├── cashier-route.tsx     // Komposisi layar kasir & keranjang
│   │   │   ├── products-route.tsx    // Komposisi layar kelola produk
│   │   │   ├── orders-route.tsx      // Komposisi layar riwayat struk
│   │   │   └── sync-route.tsx        // Komposisi layar pairing P2P
│   │   ├── app.tsx                     // Root App component with ErrorBoundary & MainLayout
│   │   ├── provider.tsx              // Global Providers (QueryClientProvider, ErrorBoundary, Toaster)
│   │   └── router.tsx                // Router configuration with React.lazy & localized ErrorBoundaries
│   │
│   ├── assets/                       // Static assets (images, icons, fonts)
│   │
│   ├── components/                   // Shared Global UI Components (shadcn/ui)
│   │   ├── ui/                       // button.tsx, card.tsx, dialog.tsx, input.tsx, badge.tsx, form.tsx
│   │   │   └── __tests__/            // Unit tests for core UI components
│   │   ├── error-fallback.tsx        // Fallback UI saat terjadi error di component
│   │   ├── header-status-badge.tsx   // Indikator status P2P WebRTC
│   │   └── main-layout.tsx           // Kerangka layout navigasi utama
│   │
│   ├── config/                       // Global configuration & constants
│   │   └── env.ts
│   │
│   ├── features/                     // Feature-Based Modules
│   │   ├── cashier/                  // Fitur Kasir & Transaksi
│   │   │   ├── components/           // product-grid.tsx, cart-sheet.tsx, payment-modal.tsx
│   │   │   ├── hooks/                // use-cashier-actions.ts
│   │   │   ├── stores/               // cart-store.ts (Zustand with selectors)
│   │   │   └── types/                // cart.types.ts
│   │   │
│   │   ├── products/                 // Fitur Manajemen Produk
│   │   │   ├── api/                  // get-products.ts, upsert-product.ts, delete-product.ts
│   │   │   ├── components/           // product-card.tsx, product-form-dialog.tsx (React Hook Form + Zod)
│   │   │   └── hooks/                // use-products.ts (TanStack Query hooks)
│   │   │
│   │   ├── orders/                   // Fitur Riwayat & Laporan
│   │   │   ├── api/                  // get-orders.ts, upsert-order.ts
│   │   │   ├── components/           // order-receipt-dialog.tsx, daily-summary-card.tsx
│   │   │   └── hooks/                // use-orders.ts (TanStack Query hooks)
│   │   │
│   │   └── sync/                     // Fitur P2P Pairing & Kunci Toko
│   │       ├── components/           // qr-display-card.tsx, qr-scanner-modal.tsx, passphrase-form.tsx
│   │       └── hooks/                // use-p2p-sync.ts
│   │
│   ├── hooks/                        // Shared Global Hooks
│   │   └── use-online-status.ts
│   │
│   ├── lib/                          // Preconfigured Reusable Libraries
│   │   ├── db.ts                     // Instance Dexie.js (tabel products, orders, settings)
│   │   ├── webrtc.ts                 // Engine WebRTC DataChannel Client
│   │   ├── passphrase.ts             // Helper BIP-39 12 kata acak
│   │   ├── query-client.ts           // TanStack QueryClient setup with global error handler
│   │   └── utils.ts                  // cn helper dari shadcn
│   │
│   ├── stores/                       // Global Application State (Zustand)
│   │   └── notification-store.ts     // Global Toast Notifications
│   │
│   ├── testing/                      // Testing Utilities, Fixtures & Setup
│   │   ├── setup-tests.ts            // Vitest global setup (fake-indexeddb)
│   │   ├── test-utils.tsx            // Custom renderWithProviders helper
│   │   └── mocks/                    // Mock data generator (products, orders)
│   │
│   ├── types/                        // Shared TypeScript Types
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   ├── store.types.ts
│   │   └── sync.types.ts
│   │
│   ├── utils/                        // Shared Pure Utility Functions
│   │   ├── __tests__/                // Unit tests for helpers
│   │   ├── uuid.ts                   // crypto.randomUUID()
│   │   └── format-currency.ts        // Format IDR Rupiah
│   │
│   └── main.tsx                      // Entry Point
```

---

# Part 2 — Data & Synchronization Rules

## 4. Entity Standards & Identity (UUID v4)

- Semua entitas data WAJIB menggunakan **UUID v4** yang di-generate via `crypto.randomUUID()`.
- DILARANG KERAS menggunakan auto-increment integer ID untuk menghindari tabrakan data (*ID collision*) antar perangkat offline.

### Strict Timestamps:
Setiap entitas data WAJIB memiliki 3 field audit timestamp:
1. `createdAt: number` — Timestamp milidetik saat pertama kali dibuat.
2. `updatedAt: number` — Timestamp milidetik saat mutasi terakhir (kunci utama resolusi konflik LWW).
3. `deletedAt: number | null` — `null` jika aktif, dan timestamp angka jika dihapus.

---

## 5. The 3 Data Operations (`get`, `upsert`, `delete`)

Untuk mencegah *race condition* dan kompleksitas sinkronisasi, seluruh operasi data disederhanakan hanya menjadi 3 metode:

1. **`get(id: string)` / `getAll()`:** Membaca data dari Dexie.js lokal (filter otomatis `deletedAt === null`).
2. **`upsert(entity: T)`:** Menambah jika baru, atau memperbarui jika ID sudah ada. Wajib meng-update `updatedAt = Date.now()`.
3. **`delete(id: string)`:** **Soft Delete**. Mengisi `deletedAt = Date.now()` dan `updatedAt = Date.now()`. Jangan lakukan hard delete pada tabel fisik kecuali diminta reset toko.

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
Saat menerima pesan sinkronisasi dari peer lain via WebRTC:
1. Periksa entitas lokal di Dexie berdasarkan `data.id`.
2. **Aturan LWW (Last-Write-Wins):** Jika data belum ada, atau `msg.updatedAt > localEntity.updatedAt`, terapkan perubahan via `table.put(msg.data)`.
3. Jika `msg.updatedAt <= localEntity.updatedAt`, abaikan pesan (karena data lokal lebih baru).
4. Panggil `queryClient.invalidateQueries({ queryKey: [msg.collection] })` agar UI langsung reaktif.

---

# Part 3 — State Management & UI Standards

## 7. The 5-Tier State Management

1. **Component State (`useState`, `useReducer`):** Khusus untuk UI lokal (toggle modal, dropdown terbuka).
2. **Application State (Zustand):**
   - Keranjang kasir (`cart-store.ts`): items, add/remove, qty increment, discount.
   - Global Toast Notifications (`notification-store.ts`).
   - Gunakan **Atomic Selectors** (`useCartStore(state => state.items)`) untuk mencegah re-render yang tidak perlu.
3. **Database / Cache State (TanStack Query):**
   - Seluruh pembacaan tabel Dexie dibungkus dalam `useQuery`.
   - Seluruh penulisan dibungkus dalam `useMutation` dengan callback `onSuccess` yang memicu `invalidateQueries`.
4. **Form State (React Hook Form + Zod):**
   - Semua form input (Tambah Produk, Input Passphrase) WAJIB menggunakan validasi skema Zod.
5. **URL State (React Router):**
   - Filter kategori dan search query kasir disimpan di `useSearchParams()`.

---

## 8. Code & Quality Standards

- **Absolute Imports:** Wajib menggunakan alias `@/*`. Dilarang relative imports bertingkat (`../../../`).
- **Strict Kebab-Case:** Seluruh nama file wajib berformat `kebab-case.tsx` atau `kebab-case.ts`.
- **Zero Runtime CSS:** Gunakan utilitas Tailwind CSS murni.
- **Children Prop Pattern:** Terapkan pola `children` pada komponen pembungkus untuk isolasi Virtual DOM.
- **Error Boundaries:** Pasang `react-error-boundary` di level route dan widget penting dengan UI fallback yang ramah bagi kasir.

---

# Part 4 — Testing Standards

## 9. Testing Strategy & Execution

1. **Unit Testing (Vitest):**
   - Letak: Berdampingan di folder `__tests__/` atau di `src/utils/__tests__/`.
   - Menguji logika murni, format rupiah, UUID generator, dan algoritma timestamp LWW.
2. **Integration Testing (Testing Library + `fake-indexeddb`):**
   - Menguji interaksi hook TanStack Query dengan Dexie DB lokal.
   - Menguji aksi keranjang belanja kasir dari tambah item hingga checkout.
3. **End-to-End Testing (Playwright):**
   - Letak: `e2e/tests/`.
   - Menguji skenario nyata dari inisialisasi toko, input produk, hingga transaksi selesai.

---

# Part 5 — The Golden Do's & Don'ts

### ✅ DO'S
- Selalu gunakan `crypto.randomUUID()` untuk ID entitas baru.
- Selalu isi `updatedAt = Date.now()` pada setiap operasi `upsert` dan `delete`.
- Selalu filter `where('deletedAt').equals(null)` saat membaca data aktif untuk kasir.
- Selalu gunakan selector spesifik saat membaca data dari Zustand store.
- Pisahkan halaman rute menggunakan `React.lazy()` di `src/app/router.tsx`.

### ❌ DON'TS
- DILARANG melakukan *Cross-Feature Import* (misal: `features/cashier` mengimpor langsung dari `features/products/components`).
- DILARANG menggunakan barrel files (`index.ts` re-exporting everything).
- DILARANG melakukan mutasi *hard delete* langsung ke database tanpa soft-delete.
- DILARANG menaruh logika komputasi berat langsung di dalam *render phase* komponen.
- DILARANG menggunakan tipe `any` di TypeScript.
