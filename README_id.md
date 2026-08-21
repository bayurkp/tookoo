<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="Tookoo Logo" />
</p>

<h1 align="center">Tookoo</h1>

<p align="center">
  <strong>Aplikasi Kasir Cerdas — Gratis, Offline, Tanpa Server</strong><br/>
  <em>Local-First P2P Point of Sale untuk UMKM Indonesia</em>
</p>

<p align="center">
  <a href="#fitur-utama">Fitur</a> •
  <a href="#demo">Demo</a> •
  <a href="#mulai-cepat">Mulai Cepat</a> •
  <a href="#deploy-gratis">Deploy Gratis</a> •
  <a href="#arsitektur">Arsitektur</a> •
  <a href="#kontribusi">Kontribusi</a>
</p>

<p align="center">
  🇬🇧 <a href="README.md">Read in English</a>
</p>

---

## Mengapa Tookoo?

Sebagian besar aplikasi kasir (POS) membebankan biaya langganan bulanan dan bergantung pada server cloud — ketika internet mati, kasir lumpuh. **Tookoo menghilangkan kedua masalah itu sekaligus.**

| | POS Konvensional | Tookoo |
|:--|:--|:--|
| **Biaya Operasional** | Rp 100rb–500rb / bulan | **Rp 0 — Gratis selamanya** |
| **Saat Internet Mati** | ❌ Tidak bisa transaksi | ✅ Tetap berjalan 100% |
| **Data Bisnis** | Disimpan di server vendor | 🔒 100% di perangkat Anda |
| **Instalasi** | Download APK / installer | 🌐 Buka browser, langsung pakai |

---

## Fitur Utama

### 🏪 Terminal Kasir
- Katalog produk responsif dengan pencarian instan dan filter kategori.
- Keranjang belanja reaktif — tambah, kurangi, hapus item dengan kalkulasi otomatis.
- Modal pembayaran: **Tunai** (hitung kembalian otomatis), **QRIS**, dan **Transfer Bank**.
- Dukungan **variant & modifier** per produk (ukuran, level es, topping, dll).
- **Pesanan tertunda** — simpan pesanan sementara dan lanjutkan nanti.

### 📦 Manajemen Produk & Stok
- Tambah, edit, dan hapus produk dari katalog.
- Pelacakan stok real-time — otomatis berkurang setiap transaksi.
- Organisasi produk berdasarkan kategori.

### 📊 Riwayat & Laporan Penjualan
- Ringkasan harian: Pendapatan, Jumlah Transaksi, Rata-rata Nilai Pesanan.
- Daftar riwayat struk dengan filter tanggal.
- Detail struk lengkap (item, waktu, metode bayar, kasir).

### 🍽️ Denah Meja (Mode Restoran)
- Tata letak meja visual untuk kafe dan restoran.
- Status meja real-time — kosong, terisi, reservasi.

### 🔄 Sinkronisasi P2P Tanpa Server
- Hubungkan beberapa terminal kasir langsung via **Wi-Fi lokal** — tanpa internet.
- Pairing instan dengan **scan QR Code** atau **12 kata sandi (BIP-39)**.
- Resolusi konflik otomatis dengan algoritma **Last-Write-Wins (LWW)**.

### ☁️ Backup Google Drive (Opsional)
- Cadangkan data toko ke Google Drive pribadi Anda.
- Pulihkan data kapan saja di perangkat baru.

### 📱 Progressive Web App (PWA)
- Pasang di layar utama HP/tablet seperti aplikasi native.
- Berjalan 100% offline berkat Service Worker caching.
- Responsif — optimal di layar 5" hingga monitor 32".

### 🌏 Dwibahasa
- Antarmuka tersedia dalam **Bahasa Indonesia** (default) dan **English**.

---

## Demo

> 🚧 Demo langsung segera tersedia di **[tookoo.pages.dev](https://tookoo.pages.dev)**

---

## Mulai Cepat

### Prasyarat

- [Node.js](https://nodejs.org/) versi **18** atau lebih baru
- [Git](https://git-scm.com/)

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/bayurkp/tookoo.git
cd tookoo

# 2. Install dependensi
npm install

# 3. (Opsional) Salin file environment
cp .env.example .env

# 4. Jalankan server development
npm run dev
```

Aplikasi berjalan di **http://localhost:5173** — buka di browser Anda.

### Perintah yang Tersedia

| Perintah | Fungsi |
|:--|:--|
| `npm run dev` | Jalankan server development dengan hot-reload |
| `npm run build` | Build bundle production ke folder `dist/` |
| `npm run preview` | Preview build production secara lokal |
| `npm run typecheck` | Periksa error TypeScript |
| `npm run lint` | Jalankan linter (OxLint) |
| `npm run format` | Format kode dengan Prettier |
| `npm run test` | Jalankan unit test (Vitest) |
| `npm run test:e2e` | Jalankan end-to-end test (Playwright) |

---

## Deploy Gratis

Tookoo adalah aplikasi **statis (Static Site)** — tidak memerlukan server backend. Anda bisa meng-host-nya **100% gratis** di beberapa platform. Panduan ini menggunakan **Cloudflare Pages** yang menyediakan bandwidth tak terbatas dan CDN global.

### Opsi A: Deploy via Dashboard Cloudflare (Tanpa Terminal)

Cocok untuk pengguna awam yang tidak terbiasa dengan command line.

#### Langkah 1 — Buat Akun

1. Buka [cloudflare.com](https://www.cloudflare.com/) dan klik **Sign Up** (gratis).
2. Verifikasi email Anda.

#### Langkah 2 — Fork Repository

1. Buka [github.com/bayurkp/tookoo](https://github.com/bayurkp/tookoo).
2. Klik tombol **Fork** di pojok kanan atas untuk menyalin repository ke akun GitHub Anda.

#### Langkah 3 — Buat Project Cloudflare Pages

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Di sidebar kiri, pilih **Workers & Pages**.
3. Klik **Create** → pilih tab **Pages** → **Connect to Git**.
4. Hubungkan akun GitHub Anda dan pilih repository **tookoo** yang sudah di-fork.
5. Atur konfigurasi build:

   | Pengaturan | Nilai |
   |:--|:--|
   | **Framework preset** | `None` |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Node.js version** | `18` (atau lebih baru) |

6. Klik **Save and Deploy**.

#### Langkah 4 — Selesai! 🎉

Dalam 1–2 menit, Tookoo Anda aktif di:

```
https://<nama-project>.pages.dev
```

Setiap kali Anda push perubahan ke GitHub, Cloudflare otomatis membangun dan men-deploy versi terbaru.

---

### Opsi B: Deploy via Terminal (Wrangler CLI)

Cocok untuk developer yang terbiasa dengan command line.

```bash
# 1. Login ke Cloudflare
npx wrangler pages login

# 2. Build aplikasi
npm run build

# 3. Deploy ke Cloudflare Pages
npx wrangler pages deploy dist --project-name=tookoo
```

---

### Opsi C: Platform Alternatif

Tookoo juga bisa di-deploy gratis ke platform lain:

<details>
<summary><strong>Vercel</strong></summary>

1. Buka [vercel.com](https://vercel.com/) dan login dengan GitHub.
2. Klik **New Project** → Import repository **tookoo**.
3. Framework Preset: `Vite`.
4. Klik **Deploy**.

</details>

<details>
<summary><strong>Netlify</strong></summary>

1. Buka [netlify.com](https://www.netlify.com/) dan login dengan GitHub.
2. Klik **Add new site** → **Import an existing project**.
3. Pilih repository **tookoo**.
4. Build command: `npm run build`, Publish directory: `dist`.
5. Klik **Deploy site**.

</details>

<details>
<summary><strong>GitHub Pages</strong></summary>

1. Di repository GitHub, buka **Settings** → **Pages**.
2. Source: **GitHub Actions**.
3. Buat workflow file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

</details>

---

### Menggunakan Domain Kustom (Opsional)

Jika Anda memiliki domain sendiri (misal: `kasir.tokosaya.com`):

1. Di Cloudflare Pages → project Anda → **Custom domains**.
2. Klik **Set up a custom domain**.
3. Masukkan domain Anda dan ikuti instruksi DNS.

---

## Arsitektur

### Tech Stack

| Lapisan | Teknologi |
|:--|:--|
| **Framework** | React 19, TypeScript (Strict Mode) |
| **Build Tool** | Vite |
| **Arsitektur** | Bulletproof React — Feature-Based Modular |
| **State Management** | Zustand (UI State) + TanStack Query v5 (DB Cache) |
| **Database Lokal** | Dexie.js (IndexedDB) |
| **Styling** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **P2P Networking** | WebRTC DataChannel (LAN + Google STUN) |
| **Form & Validasi** | React Hook Form + Zod |
| **Routing** | React Router v7 (Lazy-loaded) |
| **PWA** | vite-plugin-pwa (Service Worker) |
| **Testing** | Vitest + React Testing Library + Playwright |

### Alur Data

```
Interaksi Pengguna (UI)
  ↓ memicu aksi       →  Zustand Store / TanStack Mutation
  ↓ memanggil API      →  Dexie.js Repository (Mutasi DB Lokal)
  ↓ menyiarkan event   →  WebRTC P2P DataChannel (ke terminal lain)
  ↑ memutasi IndexedDB →  Dexie reactive write (0ms latensi)
  ↑ invalidasi query   →  TanStack Query refetch dari Dexie
  ↑ UI ter-render ulang →  Komponen update tanpa delay
```

### Struktur Proyek

```
src/
├── app/              # Application layer (pages, router, providers)
├── components/       # Shared UI components (shadcn/ui model)
├── config/           # Environment & global config
├── features/         # Feature modules (cashier, products, orders, sync)
│   ├── cashier/      #   Terminal kasir & transaksi
│   ├── products/     #   Katalog & manajemen stok
│   ├── orders/       #   Riwayat penjualan & struk
│   ├── settings/     #   Pengaturan toko
│   └── sync/         #   P2P pairing & sinkronisasi
├── hooks/            # Shared React hooks
├── lib/              # Configured libraries (db, query-client, webrtc)
├── locales/          # i18n dictionaries (id, en)
├── stores/           # Global Zustand stores
├── types/            # Shared TypeScript types
└── utils/            # Pure utility functions
```

### Model Data

Semua entitas menggunakan **UUID v4** (tanpa auto-increment untuk menghindari konflik ID antar perangkat) dan menyertakan 3 audit timestamp:

```typescript
interface Product {
  id: string;          // UUID v4
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: number;   // Timestamp ms — waktu dibuat
  updatedAt: number;   // Timestamp ms — waktu terakhir diubah
  deletedAt: number | null; // null = aktif, timestamp = soft-deleted
}

interface Order {
  id: string;
  orderNumber: string; // e.g., "TKD-001"
  items: Array<{
    productId: string;
    name: string;
    price: number;
    qty: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  cashierName: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}
```

---

## Variabel Environment

| Variabel | Wajib | Keterangan |
|:--|:--|:--|
| `VITE_GOOGLE_CLIENT_ID` | Tidak | Google OAuth Client ID untuk fitur backup Google Drive |

Salin `.env.example` ke `.env` dan isi sesuai kebutuhan.

---

## Kontribusi

Kontribusi sangat diterima! Silakan buka **Issue** atau kirim **Pull Request**.

1. Fork repository ini.
2. Buat branch fitur: `git checkout -b feat/fitur-baru`.
3. Commit perubahan: `git commit -m "feat: tambah fitur baru"`.
4. Push ke branch: `git push origin feat/fitur-baru`.
5. Buka Pull Request.

Pastikan kode Anda lolos pengecekan sebelum PR:

```bash
npm run typecheck && npm run lint && npm run format:check
```

---

## Lisensi

Dibuat dengan ❤️ untuk UMKM Indonesia.

---

<p align="center">
  <strong>Tookoo</strong> — <em>Tuku di Toko</em><br/>
  Kasir Cerdas, Cepat, dan Mandiri.
</p>
