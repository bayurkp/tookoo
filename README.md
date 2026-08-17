# 🛒 Tookoo — Local-First P2P Point of Sale (POS)

> **"Tuku di Toko"** — Solusi Kasir Cerdas, 100% Mandiri, Bebas Biaya Server, dan Berkecepatan Kilat untuk UMKM.

---

## 📌 Executive Summary & Product Requirements Document (PRD)

**Tookoo** adalah sistem kasir (Point of Sale - POS) modern berbasis **Progressive Web App (PWA)** yang mengadopsi filosofi **Local-First Software** dan **Peer-to-Peer (P2P) Architecture** (terinspirasi dari *Anytype* dan *Syncthing*).

Aplikasi ini memecahkan masalah terbesar yang dialami pelaku UMKM saat ini: **Biaya langganan bulanan software kasir yang mahal (*subscription fatigue*)** dan **ketergantungan fatal pada koneksi internet cloud**.

Dengan Tookoo, seluruh transaksi diproses secara instan (0 ms latency) di memori lokal browser perangkat kasir (IndexedDB/Dexie.js), dan disinkronisasikan secara otomatis antar-perangkat kasir dan HP pemilik toko secara langsung via jaringan **Wi-Fi Lokal (LAN)** maupun **WebRTC P2P DataChannel** tanpa membutuhkan server backend terpusat yang berbayar (Zero Server Cost).

---

## 🎯 Value Proposition & Key Highlights

1. **Zero Server Cost (Rp 0 Biaya Operasional):**
   Aplikasi di-host sebagai file statis gratis di platform seperti Cloudflare Pages/Vercel. Tidak ada biaya server database cloud 24/7.
2. **Anti Mati Internet (100% Offline Resilience):**
   Toko tetap bisa melakukan transaksi, kalkulasi belanja, dan cetak struk meskipun kabel internet terputus atau sedang mati lampu.
3. **Privasi & Kedaulatan Data (Self-Sovereign Data):**
   Data transaksi dan margin keuntungan tidak dikirim ke server vendor pihak ketiga. Data 100% tersimpan aman terenkripsi di perangkat pemilik toko.
4. **Zero-Config Pairing (Ala Anytype):**
   Menghubungkan kasir baru cukup dengan **1x Scan QR Code** atau mengetik **12 Kata Mnemonic Passphrase (BIP-39)** tanpa perlu setting IP address atau database yang rumit.

---

## 👥 User Personas & Scenarios

### Persona 1: Budi (Pemilik Toko / Owner)
- **Tujuan:** Ingin memantau penjualan harian dari rumah tanpa harus membayar biaya langganan software kasir Rp 300.000+/bulan per cabang.
- **Pengalaman:** Buka web `tookoo.app` di laptop ➔ Masukkan nama toko ➔ Toko siap dan menghasilkan Master QR Code / 12 Kata Passphrase ➔ Berikan QR kepada kasir di toko ➔ Laporan penjualan masuk secara real-time.

### Persona 2: Siti (Kasir / Staff Toko)
- **Tujuan:** Melayani antrean pembeli dengan cepat tanpa loading screen atau gangguan koneksi.
- **Pengalaman:** Buka web Tookoo di tablet kasir ➔ Klik "Gabung Toko" ➔ Scan QR dari HP Owner ➔ Pilih menu kopi/makanan ➔ Masuk keranjang ➔ Terima pembayaran (Tunai/QRIS) ➔ Selesai dalam hitungan detik.

---

## 📋 Spesifikasi Fungsional (Functional Requirements)

### 1. Inisialisasi Toko & Dual-Method Pairing
- **Pembuatan Toko:** Meng-generate UUID v4 toko, Nama Toko, Kunci Enkripsi P2P, dan 12 kata acak (BIP-39).
- **Metode Pairing A (Scan QR):** Menggunakan kamera perangkat untuk membaca QR Code toko.
- **Metode Pairing B (Passphrase Manual):** Input 12 kata acak (berguna untuk laptop/PC tanpa kamera).
- **Indikator Status:** Menampilkan status koneksi P2P di header:
  - 🟢 **Tersambung (Real-time P2P)**
  - 🟡 **Mode Toko Lokal (Offline)**

### 2. Transaksi & Kasir (Cashier Flow)
- Katalog produk responsif (Grid & List) dengan filter kategori dan pencarian instan.
- Keranjang belanja reaktif (*Cart Sheet/Drawer*):
  - Penambahan/pengurangan kuantitas item.
  - Perhitungan subtotal, diskon, dan total bayar otomatis.
- Modal Pembayaran:
  - Pilihan metode: **Tunai (Cash)**, **QRIS**, **Transfer**.
  - Kalkulator uang diterima & hitung uang kembalian instan.
- Setelah pembayaran:
  - Simpan transaksi ke tabel `orders` Dexie.js.
  - Kurangi stok barang di tabel `products` secara otomatis.
  - Kirim pesan mutasi (`UPSERT`) ke semua peer yang terhubung via WebRTC.

### 3. Manajemen Produk & Inventaris (Product Catalog)
- Daftar produk dengan indikator sisa stok barang.
- Form Dialog Tambah / Edit Produk (Nama, Kategori, Harga, Stok, Foto/Icon).
- Fitur Soft Delete produk (menandai `deletedAt`).

### 4. Riwayat & Laporan Penjualan (History & Reporting)
- Ringkasan statistik harian: Total Omzet Hari Ini, Jumlah Transaksi, dan Rata-rata Nilai Transaksi.
- Daftar riwayat struk penjualan dengan filter tanggal.
- Dialog rincian struk (detail item belanja, waktu transaksi, kasir penanggung jawab).

---

## 🗄️ Model Data Utama (TypeScript Schema)

Semua entitas data menggunakan standar **UUID v4**, **Audit Timestamps**, dan **Last-Write-Wins (LWW)**:

```typescript
// 1. Model Produk (Product)
interface Product {
  id: string;              // UUID v4
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: number;       // Timestamp ms
  updatedAt: number;       // Timestamp ms
  deletedAt: number | null;// Soft delete
}

// 2. Model Transaksi (Order)
interface Order {
  id: string;              // UUID v4
  orderNumber: string;     // Contoh: "TKD-001"
  items: Array<{
    productId: string;     // UUID Produk
    name: string;
    price: number;
    qty: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  cashierName: string;
  createdAt: number;       // Timestamp ms
  updatedAt: number;       // Timestamp ms
  deletedAt: number | null;
}

// 3. Pengaturan Toko (StoreSettings)
interface StoreSettings {
  id: string;              // UUID v4 (Store ID)
  storeName: string;
  passphrase: string;      // 12 kata acak
  storeSecretKey: string;  // Kunci enkripsi P2P
  createdAt: number;       // Timestamp ms
  updatedAt: number;       // Timestamp ms
  deletedAt: number | null;
}
```

---

## 🏗️ Tech Stack & Arsitektur

* **Framework:** React 19 + Vite (TypeScript Strict Mode).
* **Architecture:** Bulletproof React Architecture (Unidirectional Codebase).
* **State Management:** Zustand (Cart & Notifications) + TanStack Query v5 (Dexie DB Cache).
* **Database Lokal:** Dexie.js (IndexedDB).
* **Styling & UI:** Tailwind CSS + shadcn/ui + Lucide Icons.
* **Jaringan P2P:** WebRTC DataChannel (Direct LAN & Google STUN).
* **Testing:** Vitest + React Testing Library + Playwright.

---

## 🚀 Panduan Menjalankan Aplikasi

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Jalankan automated test
npm run test

# 4. Build untuk production
npm run build
```
