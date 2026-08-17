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

## 8. Project Standards & Tooling

### 1. ESLint & Static Analysis
- Menjaga kebersihan dan keseragaman kode dengan konfigurasi aturan ketat.
- Mencegah kesalahan umum dan pelanggaran arsitektur sejak awal penulisan kode.

### 2. Prettier
- Menjaga konsistensi format penulisan kode di seluruh *codebase*.
- Konfigurasi `.prettierrc` wajib diaktifkan bersama fitur *format on save*.

### 3. TypeScript (Strict Mode)
- Wajib menggunakan TypeScript Strict Mode tanpa tipe `any`.
- Saat melakukan *refactoring*, selalu perbarui deklarasi tipe data (`types/`) terlebih dahulu sebelum memperbaiki implementasi kode.

### 4. Husky & Git Hooks
- Menjalankan validasi otomatis sebelum *commit* (*pre-commit hooks*): *linting*, *formatting*, dan *type-checking* untuk mencegah kode rusak masuk ke repositori.

### 5. Absolute Imports (`@/*`)
- Wajib menggunakan alias `@/*` untuk seluruh *internal imports*.
- Dilarang keras menggunakan *relative imports* bertingkat (seperti `../../../../components/ui/button`).
- Konfigurasi di `tsconfig.json` & `vite.config.ts`:
  ```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  ```

### 6. File & Folder Naming Conventions (`eslint-plugin-check-file`)
- Seluruh nama berkas dan folder (kecuali `__tests__`) wajib menggunakan format **`kebab-case`**.
- Penegakan aturan via ESLint:
  ```javascript
  'check-file/filename-naming-convention': [
    'error',
    {
      '**/*.{ts,tsx}': 'KEBAB_CASE',
    },
    {
      ignoreMiddleExtensions: true, // mendukung ekstensi ganda seperti .test.tsx, .spec.ts
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
- **Zero Runtime CSS:** Gunakan utilitas Tailwind CSS murni.
- **Children Prop Pattern:** Terapkan pola `children` pada komponen pembungkus untuk isolasi Virtual DOM.
- **Error Boundaries:** Pasang `react-error-boundary` di level route dan widget penting dengan UI fallback yang ramah bagi kasir.

---

## 9. Components & Styling Best Practices

### 1. Colocation Principle
- Letakkan komponen, helper fungsi, tipe data, dan state sedekat mungkin dengan tempat komponen tersebut digunakan (`src/features/<feature>/components/`).
- Mengurangi *redundant re-renders* pada update state dan mempermudah pemeliharaan kode.

### 2. Avoid Monolithic Components & Nested Render Functions
- Dilarang membuat fungsi *inline render* bersarang (seperti `function renderItems() { ... }`) di dalam komponen besar.
- Ekstrak setiap bagian UI yang berdiri sendiri menjadi komponen terpisah dengan *Single Responsibility Principle*.

### 3. Limit Component Props & Favor Composition
- Hindari komponen yang menerima terlalu banyak *props*. Gunakan teknik komposisi via *children prop* atau *slots* untuk menyusun UI secara fleksibel dan modular.

### 4. Shared UI Abstractions (shadcn/ui Model)
- Letakkan komponen UI bersama di [`src/components/ui/`](file:///d:/Projects/tookoo/src/components/ui) dengan pendekatan *code ownership* ala shadcn/ui.
- Bungkus (*wrapper*) pustaka pihak ketiga untuk menyesuaikan kebutuhan aplikasi kasir.

### 5. Zero-Runtime Styling (Tailwind CSS)
- Wajib menggunakan utility classes Tailwind CSS murni (build-time generated) untuk performa rendering optimal tanpa overhead CSS runtime.
- Gunakan helper `cn()` (`clsx` + `tailwind-merge`) di [`src/lib/utils.ts`](file:///d:/Projects/tookoo/src/lib/utils.ts) untuk penggabungan class dinamis.

---

# Part 4 — Security & Access Control

## 10. Authentication & Store Identity
- **Self-Sovereign Store Pairing:** Tookoo tidak mengandalkan server auth terpusat. Identitas dan akses toko diamankan melalui Store Secret Key yang dihasilkan saat inisialisasi toko dan dibagikan secara aman via QR Code atau 12 Kata Passphrase (BIP-39 mnemonic).
- **Session & Key Storage:** Kunci toko disimpan di IndexedDB/Dexie table `settings` (bukan di plain `localStorage` yang rentan XSS) dan di-load ke memory state saat aplikasi aktif.

## 11. Authorization (RBAC & PBAC)
- **Role-Based Access Control (RBAC):**
  - `OWNER`: Akses penuh ke pengaturan toko, generate QR pairing, rekap laporan omzet, export data, dan reset toko.
  - `CASHIER` / `STAFF`: Dibatasi pada operasional kasir (katalog produk, keranjang belanja, proses pembayaran, cetak struk).
- **Permission-Based Access Control (PBAC):**
  - Fitur sensitif seperti penghapusan produk atau pembatalan transaksi diproteksi berdasarkan hak akses peran aktif.

## 12. Client-Side Security & XSS Mitigation
- **Input Sanitization & Schema Validation:** Seluruh input pengguna (nama produk, kategori, harga, nama kasir) WAJIB divalidasi ketat menggunakan skema Zod sebelum diproses ke database.
- **No Sensitive Data in URLs:** Secret key atau data sensitif dilarang ditaruh di query params URL (`useSearchParams`).
- **Safe Rendering:** Dilarang menggunakan `dangerouslySetInnerHTML` tanpa sanitasi HTML yang teruji.

---

# Part 5 — Voice, Tone & POS UI Copy Standards

## 13. Tookoo's Brand Voice (POS Operator Mindset)

Tookoo berbicara seperti **asisten kasir yang tangkas, ringkas, dan dapat diandalkan (*Smart, Fast & Trustworthy POS Partner*)**.
Pengguna aplikasi adalah pelaku UMKM dan kasir yang melayani antrean pembeli secara langsung. Seluruh teks antarmuka (UI copy) wajib dapat dipahami seketika dalam $\le 1$ detik tanpa beban kognitif berlebih.

### Voice Qualities

| Quality | Meaning in POS Context | What it is NOT |
| :--- | :--- | :--- |
| **Fast & Direct (Ringkas)** | Langsung ke inti aksi. Kalimat pendek, kata kerja aktif, hilangkan kata basa-basi. | Dingin, kasar, membingungkan |
| **Reliable & Reassuring (Pasti)** | Memberikan kepastian status (offline, tersimpan, kembalian, tersambung) secara akurat. | Meragukan, lambat, ambigu |
| **Pragmatic (Praktis & Solutif)** | Menggunakan istilah bisnis/kasir umum (Omzet, Stok, Kembalian, Struk) tanpa jargon rumit. | Teoretis, berbelit-belit |
| **Professional (Profesional)** | Menjaga alur kerja kasir tetap tertata, tenang, dan cepat bahkan saat antrean padat. | Kaku, penuh teks hukum panjang |

---

## 14. Voice by Moment (POS Scenarios)

### 1. Transaksi Kasir & Pembayaran Sukses
- **Tone:** Tegas, cepat, langsung menampilkan angka kunci (Kembalian & Total).
- **✅ Contoh:** `"Pembayaran Berhasil. Kembalian: Rp 15.000."`, `"Transaksi Selesai."`
- **❌ Hindari:** `"Hore! Pembayaran dari pelanggan berhasil diproses ke dalam sistem!"`

### 2. Status Stok & Inventaris
- **Tone:** Informatif, preventif, tidak mendramatisir.
- **✅ Contoh:** `"Stok tersisa 3"`, `"Stok habis"`, `"Produk berhasil ditambahkan ke katalog."`
- **❌ Hindari:** `"Gawat! Anda kehabisan stok barang ini!"`

### 3. Koneksi P2P & Status Offline
- **Tone:** Transparan dan menenangkan (memberi jaminan data tetap aman 100%).
- **✅ Contoh:** `"Mode Toko Lokal (Offline). Data tersimpan aman di perangkat."`, `"Tersambung ke 2 perangkat kasir."`
- **❌ Hindari:** `"Koneksi internet terputus! Aplikasi tidak dapat berjalan."`

### 4. Konfirmasi Aksi Destruktif (Hapus & Batal)
- **Tone:** Lugas, langsung berupa pertanyaan pendek berorientasi tindakan.
- **✅ Contoh:** `"Hapus produk ini?"`, `"Batalkan transaksi ini?"`
- **❌ Hindari:** `"Apakah Anda benar-benar yakin ingin menghapus data produk ini secara permanen dari basis data?"`

### 5. Empty States (Layar Kosong)
- **Tone:** Mengundang aksi langsung dengan tombol CTA yang jelas.
- **✅ Contoh:** `"Belum ada produk. Tambahkan produk pertamamu untuk mulai transaksi."`, `"Belum ada transaksi hari ini."`
- **❌ Hindari:** `"Oops! Tidak ada data apa pun yang ditemukan di sini."`

### 6. Error & Gangguan Teknis
- **Tone:** Jujur, tenang, langsung memberikan solusi atau retry otomatis.
- **✅ Contoh:** `"Gagal memindai QR. Pastikan kamera memiliki izin dan coba lagi."`, `"Gagal menyimpan data lokal. Mencoba kembali..."`
- **❌ Hindari:** `"Error 500: Uncaught Exception"`, `"Oopsie! Ada kesalahan teknis! 😅"`

---

## 15. What Tookoo UI Copy Never Does

- **Never uses filler or over-cheerful exclamation marks.** Maksimum 0–1 tanda seru (`!`), hindari kata basa-basi seperti "Hore", "Aduh", "Oops".
- **Never blames the cashier or store owner.** Fokus pada apa yang terjadi dan tombol aksi pemulihannya.
- **Never uses unicode emojis in UI copy.** Gunakan semantic vector icons dari `lucide-react` (misal: `<Receipt />`, `<Package />`, `<Trash2 />`).
- **Never uses cryptic developer errors.** Jangan tampilkan trace kode atau JSON error mentah di antarmuka kasir.

---

## 16. UI Copy Consistency & Microcopy Rules

### 1. Label Tombol & Aksi (Format: Kata Kerja + Objek)
Selalu gunakan format **Verb + Noun** yang konsisten di seluruh modul:

| Aksi | Tombol yang Benar | Hindari (Tidak Konsisten) |
| :--- | :--- | :--- |
| Tambah data baru | **Tambah Produk**, **Tambah Item** | "Buat Baru", "Add", "Input" |
| Simpan form/edit | **Simpan Produk**, **Simpan Pengaturan** | "Submit", "Simpan", "Save" |
| Proses transaksi | **Bayar Sekarang**, **Proses Bayar** | "OK", "Lanjut", "Checkout" |
| Cetak fisik | **Cetak Struk** | "Print", "Keluarkan Nota" |
| Hapus data | **Hapus Produk**, **Hapus Item** | "Delete", "Buang" |
| Pembatalan modal | **Batal** | "Keluar", "Tutup Saja" |

### 2. Loading State Pattern (3 Tahap: Idle → Loading → Result)
| State | Pattern | Contoh |
| :--- | :--- | :--- |
| **Idle** | Verb + Noun | `"Simpan Produk"` |
| **Loading** | Verb + `...` | `"Menyimpan..."` |
| **Success** | Past / Done | `"Produk Disimpan"` |
| **Error** | Gagal + Solusi | `"Gagal menyimpan. Coba lagi"` |

### 3. Format Mata Uang & Angka
- Seluruh angka nominal rupiah WAJIB diformat menggunakan helper [`formatCurrency()`](file:///d:/Projects/tookoo/src/utils/format-currency.ts) (contoh: `Rp 25.000`, bukan `25000` atau `IDR 25000.00`).
- Tanggal dan jam transaksi menggunakan format lokal Indonesia yang ringkas (contoh: `17 Agu 2026, 20:30`).

---

# Part 6 — Performance & Optimization Standards

## 17. Route-Level Code Splitting
- Wajib menggunakan `React.lazy()` di level rute ([`src/app/router.tsx`](file:///d:/Projects/tookoo/src/app/router.tsx)) untuk mengisolasi ukuran bundle awal (*initial bundle size*).
- Hindari *over-splitting* pada level komponen kecil agar tidak menyebabkan *request waterfall*.

## 18. Component & State Optimizations
- **State Locality:** Tempatkan state sedekat mungkin dengan komponen yang mengonsumsinya. Jangan letakkan semua state di global store.
- **Lazy State Initialization:** Gunakan callback initializer `useState(() => expensiveComputation())` untuk menghindari eksekusi ulang pada setiap siklus re-render.
- **Atomic Selectors (Zustand):** Selalu gunakan selector presisi (contoh: `useCartStore(state => state.items)`) agar komponen hanya re-render saat data spesifik tersebut berubah.
- **Children Prop Pattern (Virtual DOM Isolation):** Terapkan pola `children` pada komponen wrapper (seperti layout & modal container) untuk mengisolasi sub-tree Virtual DOM dari re-render parent.
- **Zero-Runtime CSS:** Gunakan Tailwind CSS murni (build-time generated) untuk menghilangkan kalkulasi CSS runtime.

## 19. Data Prefetching & Media Optimizations
- **Data Prefetching:** Gunakan `queryClient.prefetchQuery()` saat user melakukan hover pada navigasi atau tombol penting untuk mempercepat transisi halaman.
- **Image & Icon Optimization:**
  - Gunakan format vektor SVG atau format modern WebP.
  - Gunakan `loading="lazy"` untuk gambar produk yang berada di luar viewport awal.
- **Web Vitals First:** Pastikan skor Core Web Vitals (terutama INP - *Interaction to Next Paint* dan LCP - *Largest Contentful Paint*) optimal untuk respon kasir instan (0 ms latency).

---

# Part 7 — Error Handling & Resilience

## 20. Local DB & Query Error Management
- **Centralized Query Error Handling:** Konfigurasi `QueryCache` dan `MutationCache` di [`src/lib/query-client.ts`](file:///d:/Projects/tookoo/src/lib/query-client.ts) dengan global error handler untuk menampilkan Toast Notifikasi otomatis saat terjadi kegagalan operasi Dexie atau WebRTC.
- **Graceful Mutation Rollback:** Mutasi transaksi kasir yang gagal wajib ditangani dengan pemulihan state yang aman tanpa menyebabkan inkonsistensi data lokal.

## 21. Multi-Level Error Boundaries
- **Localized Error Boundaries:** Pasang `react-error-boundary` bertingkat:
  - *Route Level:* Menjaga agar error di satu halaman (misal: Laporan/Riwayat) tidak merusak alur transaksi kasir utama.
  - *Widget Level:* Mengisolasi komponen rentan (seperti pemindai kamera QR Code atau widget WebRTC) dengan UI fallback ramah pengguna ([`src/components/error-fallback.tsx`](file:///d:/Projects/tookoo/src/components/error-fallback.tsx)).

## 22. Error Logging & Observability
- Seluruh *uncaught errors* dicatat secara terstruktur dengan metadata konteks (nama komponen, operasi yang gagal) tanpa mengekspos data kredensial toko atau passphrase mnemonic.

---

# Part 8 — Testing Standards

## 23. Testing Strategy & Execution

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

# Part 9 — The Golden Do's & Don'ts

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
