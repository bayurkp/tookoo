# Design Document: Products Management Feature (`src/features/products`)

**Date:** 2026-08-17  
**Status:** Approved  
**Topic:** Products Management (Local-First CRUD, TanStack Query, React Hook Form + Zod, Dexie.js)

---

## 1. Overview & Objectives

The **Products Management** feature allows store owners and cashiers to manage the store's product catalog offline-first. It handles creating, updating, soft-deleting, searching, and filtering products using Dexie.js (IndexedDB) as the source of truth, integrated reactively via TanStack Query v5.

---

## 2. Architecture & Directory Structure

Adhering to Bulletproof React and Unidirectional Codebase guidelines:

```text
src/
├── components/ui/
│   ├── input.tsx                  # Base input field
│   └── dialog.tsx                 # Base modal dialog component
│
├── features/products/
│   ├── api/
│   │   ├── get-products.ts        # Dexie get query (active items only)
│   │   ├── upsert-product.ts      # Dexie upsert mutation
│   │   └── delete-product.ts      # Dexie soft delete mutation
│   ├── components/
│   │   ├── product-card.tsx       # Single product display card
│   │   └── product-form-dialog.tsx# Create / edit product modal form (Zod + RHF)
│   ├── hooks/
│   │   └── use-products.ts        # TanStack Query & Mutation hooks
│   └── types/
│       └── product-form.types.ts  # Zod schema & inferred form types
│
└── app/routes/
    └── products-route.tsx         # Route composition & page layout
```

---

## 3. Data Layer Specifications

### Entity Model (`Product` from `src/types/product.types.ts`)
```typescript
export interface Product {
  id: string;              // UUID v4
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: number;       // Timestamp ms
  updatedAt: number;       // Timestamp ms
  deletedAt: number | null;// Soft delete timestamp or null if active
}
```

### Operations
1. **`getProducts()`**: Queries `db.products.filter(item => item.deletedAt === null).toArray()` sorted by `createdAt desc`.
2. **`upsertProduct(input)`**:
   - If `input.id` exists, updates with `updatedAt: Date.now()`.
   - If new, assigns `id: crypto.randomUUID()`, `createdAt: Date.now()`, `updatedAt: Date.now()`, and `deletedAt: null`.
3. **`deleteProduct(id)`**:
   - Soft deletes by updating `deletedAt = Date.now()` and `updatedAt = Date.now()`.

---

## 4. UI & Form Validation

### Zod Schema
```typescript
import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(2, 'Nama produk minimal 2 karakter'),
  category: z.string().min(1, 'Kategori wajib dipilih atau diisi'),
  price: z.number({ invalid_type_error: 'Harga harus berupa angka' }).min(0, 'Harga tidak boleh negatif'),
  stock: z.number({ invalid_type_error: 'Stok harus berupa angka' }).int('Stok harus berupa bilangan bulat').min(0, 'Stok tidak boleh negatif'),
  imageUrl: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
```

### Component Breakdown
- **`ProductFormDialog`**:
  - Controlled by open state.
  - Supports both "Tambah Produk" (create) and "Edit Produk" (update).
  - Handles loading states during Dexie write and closes on success.
- **`ProductCard`**:
  - Displays product thumbnail / fallback category icon.
  - Shows price in IDR format (`formatCurrency`).
  - Displays stock badge with color warning when low stock (e.g. $\le 5$).
  - Quick action buttons: Edit and Delete with confirmation.
- **`ProductsRoute`**:
  - Search bar by product name.
  - Category pill filter tabs (e.g., "Semua", "Makanan", "Minuman", etc.).
  - Empty state CTA when no products exist yet.

---

## 5. Verification Plan

1. **Unit / Integration**:
   - Verify `upsertProduct` writes to Dexie with correct UUID and timestamps.
   - Verify `deleteProduct` sets `deletedAt` without deleting the record row.
   - Verify `getProducts` excludes soft-deleted items.
2. **End-to-End Flow**:
   - Open products page, add a product via form, verify immediate card rendering in the grid.
   - Edit the product, verify instant update.
   - Delete the product, verify removal from active view.
