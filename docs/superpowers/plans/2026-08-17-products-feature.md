# Products Management Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, offline-first Products Management feature in `src/features/products` with Dexie.js data layer, TanStack Query hooks, Zod validation, shared UI primitives (Input & Dialog), and complete integration into `products-route.tsx`.

**Architecture:** Bulletproof React architecture (Unidirectional Codebase). Shared UI primitives in `src/components/ui/`, pure Dexie CRUD operations in `src/features/products/api/`, TanStack Query hooks in `src/features/products/hooks/`, React Hook Form + Zod modal and UI cards in `src/features/products/components/`, and route composition in `src/app/routes/products-route.tsx`.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Dexie.js, TanStack Query v5, React Hook Form, Zod, Vitest, Testing Library, fake-indexeddb.

## Global Constraints
- Absolute imports with `@/*` alias only.
- Strict kebab-case filenames (`kebab-case.tsx` / `kebab-case.ts`).
- No barrel files (`index.ts`). Direct imports only.
- No cross-feature imports.
- UUID v4 for IDs via `crypto.randomUUID()`.
- Timestamps: `createdAt`, `updatedAt`, `deletedAt: number | null`.
- Soft delete pattern only (do not physically drop rows).
- Zero runtime CSS (pure Tailwind CSS).

---

### Task 1: Testing & Vitest Configuration with `fake-indexeddb`

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/testing/setup-tests.ts`
- Create: `src/utils/__tests__/format-currency.test.ts`

**Interfaces:**
- Produces: Vitest setup with IndexedDB polyfill and `@testing-library/jest-dom` assertions for all subsequent test tasks.

- [ ] **Step 1: Write test script & Vitest config**

Modify `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup-tests.ts'],
  },
} as any);
```

Modify `package.json` scripts:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "test": "vitest run",
  "test:watch": "vitest",
  "preview": "vite preview"
}
```

- [ ] **Step 2: Create test setup file**

Create `src/testing/setup-tests.ts`:
```typescript
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
```

- [ ] **Step 3: Write test for format-currency utility**

Create `src/utils/__tests__/format-currency.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/utils/format-currency';

describe('formatCurrency', () => {
  it('formats positive integers to IDR string', () => {
    expect(formatCurrency(15000)).toMatch(/Rp\s*15\.000/);
  });

  it('formats 0 to Rp 0', () => {
    expect(formatCurrency(0)).toMatch(/Rp\s*0/);
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: 1 test file passed.

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts src/testing/setup-tests.ts src/utils/__tests__/format-currency.test.ts
git commit -m "test: setup vitest with fake-indexeddb and format-currency test"
```

---

### Task 2: Shared UI Primitives (`Input` and `Dialog`)

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/dialog.tsx`
- Test: `src/components/ui/__tests__/input.test.tsx`

**Interfaces:**
- Produces: `<Input />` supporting standard HTML input props with Tailwind styles.
- Produces: `<Dialog />`, `<DialogContent />`, `<DialogHeader />`, `<DialogTitle />`, `<DialogDescription />`, `<DialogFooter />`.

- [ ] **Step 1: Write the failing test for Input component**

Create `src/components/ui/__tests__/input.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders input with placeholder and handles value', () => {
    render(<Input placeholder="Masukkan nama produk" defaultValue="Kopi Susu" />);
    const input = screen.getByPlaceholderText('Masukkan nama produk') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Kopi Susu');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/__tests__/input.test.tsx`
Expected: FAIL (Cannot find module '@/components/ui/input')

- [ ] **Step 3: Implement Input component**

Create `src/components/ui/input.tsx`:
```typescript
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

- [ ] **Step 4: Implement Dialog component**

Create `src/components/ui/dialog.tsx`:
```typescript
import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg p-6 bg-background rounded-xl border border-border shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-left mb-4', className)} {...props} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6', className)} {...props} />
);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/ui/__tests__/input.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/input.tsx src/components/ui/dialog.tsx src/components/ui/__tests__/input.test.tsx
git commit -m "feat(ui): add shared input and dialog modal primitives"
```

---

### Task 3: Products Data Layer & APIs (`get-products`, `upsert-product`, `delete-product`)

**Files:**
- Create: `src/features/products/types/product-form.types.ts`
- Create: `src/features/products/api/get-products.ts`
- Create: `src/features/products/api/upsert-product.ts`
- Create: `src/features/products/api/delete-product.ts`
- Test: `src/features/products/api/__tests__/products-api.test.ts`

**Interfaces:**
- Produces: `getProducts(): Promise<Product[]>` (active products only, sorted desc)
- Produces: `upsertProduct(input: UpsertProductInput): Promise<Product>`
- Produces: `deleteProduct(id: string): Promise<void>` (soft delete)

- [ ] **Step 1: Define Form Schema & Types**

Create `src/features/products/types/product-form.types.ts`:
```typescript
import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(2, 'Nama produk minimal 2 karakter'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.coerce.number().int('Stok harus berupa angka bulat').min(0, 'Stok tidak boleh negatif'),
  imageUrl: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export type UpsertProductInput = ProductFormValues & {
  id?: string;
};
```

- [ ] **Step 2: Write failing test for Products API operations**

Create `src/features/products/api/__tests__/products-api.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { getProducts } from '@/features/products/api/get-products';
import { upsertProduct } from '@/features/products/api/upsert-product';
import { deleteProduct } from '@/features/products/api/delete-product';

describe('Products Data Layer', () => {
  beforeEach(async () => {
    await db.products.clear();
  });

  it('creates a new product with UUID and audit timestamps', async () => {
    const product = await upsertProduct({
      name: 'Kopi Espresso',
      category: 'Minuman',
      price: 18000,
      stock: 50,
    });

    expect(product.id).toBeDefined();
    expect(product.name).toBe('Kopi Espresso');
    expect(product.deletedAt).toBeNull();
    expect(product.createdAt).toBeGreaterThan(0);

    const list = await getProducts();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(product.id);
  });

  it('updates an existing product without changing id or createdAt', async () => {
    const original = await upsertProduct({
      name: 'Roti Bakar',
      category: 'Makanan',
      price: 15000,
      stock: 20,
    });

    const updated = await upsertProduct({
      id: original.id,
      name: 'Roti Bakar Cokelat',
      category: 'Makanan',
      price: 18000,
      stock: 15,
    });

    expect(updated.id).toBe(original.id);
    expect(updated.name).toBe('Roti Bakar Cokelat');
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.updatedAt).toBeGreaterThanOrEqual(original.updatedAt);
  });

  it('performs soft delete and filters out from getProducts', async () => {
    const product = await upsertProduct({
      name: 'Teh Tarik',
      category: 'Minuman',
      price: 10000,
      stock: 30,
    });

    await deleteProduct(product.id);

    const activeList = await getProducts();
    expect(activeList).toHaveLength(0);

    // Verify row still exists in raw DB with deletedAt
    const raw = await db.products.get(product.id);
    expect(raw).toBeDefined();
    expect(raw?.deletedAt).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/features/products/api/__tests__/products-api.test.ts`
Expected: FAIL (Cannot find modules)

- [ ] **Step 4: Implement API functions**

Create `src/features/products/api/get-products.ts`:
```typescript
import { db } from '@/lib/db';
import { Product } from '@/types/product.types';

export const getProducts = async (): Promise<Product[]> => {
  const products = await db.products
    .filter((item) => item.deletedAt === null)
    .toArray();

  return products.sort((a, b) => b.createdAt - a.createdAt);
};
```

Create `src/features/products/api/upsert-product.ts`:
```typescript
import { db } from '@/lib/db';
import { Product } from '@/types/product.types';
import { generateUUID } from '@/utils/uuid';
import { UpsertProductInput } from '@/features/products/types/product-form.types';

export const upsertProduct = async (input: UpsertProductInput): Promise<Product> => {
  const now = Date.now();

  if (input.id) {
    const existing = await db.products.get(input.id);
    if (!existing) {
      throw new Error(`Product with ID ${input.id} not found`);
    }

    const updated: Product = {
      ...existing,
      name: input.name,
      category: input.category,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl || undefined,
      updatedAt: now,
    };

    await db.products.put(updated);
    return updated;
  }

  const newProduct: Product = {
    id: generateUUID(),
    name: input.name,
    category: input.category,
    price: input.price,
    stock: input.stock,
    imageUrl: input.imageUrl || undefined,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.products.put(newProduct);
  return newProduct;
};
```

Create `src/features/products/api/delete-product.ts`:
```typescript
import { db } from '@/lib/db';

export const deleteProduct = async (id: string): Promise<void> => {
  const existing = await db.products.get(id);
  if (!existing) {
    throw new Error(`Product with ID ${id} not found`);
  }

  const now = Date.now();
  await db.products.update(id, {
    deletedAt: now,
    updatedAt: now,
  });
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/products/api/__tests__/products-api.test.ts`
Expected: PASS (All 3 tests passed)

- [ ] **Step 6: Commit**

```bash
git add src/features/products/types/product-form.types.ts src/features/products/api/ src/features/products/api/__tests__/
git commit -m "feat(products): implement dexie data layer with soft delete and unit tests"
```

---

### Task 4: Products React Query Hooks (`use-products`)

**Files:**
- Create: `src/features/products/hooks/use-products.ts`
- Test: `src/features/products/hooks/__tests__/use-products.test.tsx`

**Interfaces:**
- Produces: `useProducts()` -> `useQuery` with `queryKey: ['products']`
- Produces: `useUpsertProduct()` -> `useMutation` with automatic query invalidation
- Produces: `useDeleteProduct()` -> `useMutation` with automatic query invalidation

- [ ] **Step 1: Write failing hook test**

Create `src/features/products/hooks/__tests__/use-products.test.tsx`:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { useProducts, useUpsertProduct, useDeleteProduct } from '@/features/products/hooks/use-products';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProducts hooks', () => {
  beforeEach(async () => {
    await db.products.clear();
  });

  it('fetches and mutates products through TanStack Query', async () => {
    const { result } = renderHook(() => ({
      products: useProducts(),
      upsert: useUpsertProduct(),
      remove: useDeleteProduct(),
    }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.products.isSuccess).toBe(true));
    expect(result.current.products.data).toEqual([]);

    // Mutate: create product
    await result.current.upsert.mutateAsync({
      name: 'Matcha Latte',
      category: 'Minuman',
      price: 22000,
      stock: 40,
    });

    await waitFor(() => expect(result.current.products.data?.length).toBe(1));
    expect(result.current.products.data?.[0].name).toBe('Matcha Latte');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/products/hooks/__tests__/use-products.test.tsx`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement use-products hooks**

Create `src/features/products/hooks/use-products.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts } from '@/features/products/api/get-products';
import { upsertProduct } from '@/features/products/api/upsert-product';
import { deleteProduct } from '@/features/products/api/delete-product';
import { UpsertProductInput } from '@/features/products/types/product-form.types';

export const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: getProducts,
  });
};

export const useUpsertProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertProductInput) => upsertProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/products/hooks/__tests__/use-products.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/products/hooks/ src/features/products/hooks/__tests__/
git commit -m "feat(products): add tanstack query hooks with automatic cache invalidation"
```

---

### Task 5: Product Components (`ProductCard` and `ProductFormDialog`)

**Files:**
- Create: `src/features/products/components/product-card.tsx`
- Create: `src/features/products/components/product-form-dialog.tsx`
- Test: `src/features/products/components/__tests__/product-card.test.tsx`

**Interfaces:**
- Produces: `<ProductCard product={product} onEdit={fn} onDelete={fn} />`
- Produces: `<ProductFormDialog open={open} onOpenChange={fn} productToEdit={product | null} />`

- [ ] **Step 1: Write test for ProductCard**

Create `src/features/products/components/__tests__/product-card.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '@/features/products/components/product-card';
import { Product } from '@/types/product.types';

const mockProduct: Product = {
  id: 'test-uuid-1',
  name: 'Kopi Susu Gula Aren',
  category: 'Minuman',
  price: 18000,
  stock: 4,
  createdAt: 1000,
  updatedAt: 1000,
  deletedAt: null,
};

describe('ProductCard', () => {
  it('renders product details and triggers edit/delete callbacks', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<ProductCard product={mockProduct} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Kopi Susu Gula Aren')).toBeInTheDocument();
    expect(screen.getByText(/18\.000/)).toBeInTheDocument();
    expect(screen.getByText('Minuman')).toBeInTheDocument();
    expect(screen.getByText('Stok: 4')).toBeInTheDocument();

    const editBtn = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockProduct);

    const deleteBtn = screen.getByRole('button', { name: /hapus/i });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/products/components/__tests__/product-card.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ProductCard**

Create `src/features/products/components/product-card.tsx`:
```typescript
import * as React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format-currency';
import { Product } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const isLowStock = product.stock <= 5;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video w-full bg-muted flex items-center justify-center relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-10 w-10 text-muted-foreground/50" />
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-xs text-xs">
            {product.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-base leading-tight line-clamp-1" title={product.name}>
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-primary">
            {formatCurrency(product.price)}
          </span>
          <Badge variant={isLowStock ? 'destructive' : 'outline'} className="text-xs">
            Stok: {product.stock}
          </Badge>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={() => onEdit(product)}
            aria-label="Edit produk"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(product.id)}
            aria-label="Hapus produk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 4: Implement ProductFormDialog**

Create `src/features/products/components/product-form-dialog.tsx`:
```typescript
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product.types';
import {
  productFormSchema,
  ProductFormValues,
} from '@/features/products/types/product-form.types';
import { useUpsertProduct } from '@/features/products/hooks/use-products';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  productToEdit,
}) => {
  const upsertMutation = useUpsertProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      stock: 0,
      imageUrl: '',
    },
  });

  React.useEffect(() => {
    if (productToEdit) {
      reset({
        name: productToEdit.name,
        category: productToEdit.category,
        price: productToEdit.price,
        stock: productToEdit.stock,
        imageUrl: productToEdit.imageUrl || '',
      });
    } else {
      reset({
        name: '',
        category: '',
        price: 0,
        stock: 0,
        imageUrl: '',
      });
    }
  }, [productToEdit, open, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    await upsertMutation.mutateAsync({
      ...values,
      id: productToEdit?.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {productToEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </DialogTitle>
        <DialogDescription>
          {productToEdit
            ? 'Perbarui rincian harga, stok, atau nama produk.'
            : 'Masukkan rincian produk baru ke dalam katalog tokomu.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Nama Produk *
          </label>
          <Input
            placeholder="Contoh: Kopi Americano"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Kategori *
          </label>
          <Input
            placeholder="Contoh: Minuman / Makanan"
            {...register('category')}
            error={errors.category?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Harga (Rp) *
            </label>
            <Input
              type="number"
              placeholder="0"
              {...register('price')}
              error={errors.price?.message}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Jumlah Stok *
            </label>
            <Input
              type="number"
              placeholder="0"
              {...register('stock')}
              error={errors.stock?.message}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            URL Foto Produk (Opsional)
          </label>
          <Input
            placeholder="https://..."
            {...register('imageUrl')}
            error={errors.imageUrl?.message}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : productToEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/products/components/__tests__/product-card.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/products/components/ src/features/products/components/__tests__/
git commit -m "feat(products): add product card and form dialog with zod validation"
```

---

#### Task 6: Page Composition & Full Feature Integration (`products-page.tsx`)

**Files:**
- Modify: `src/app/pages/products-page.tsx`
- Create: `src/app/pages/__tests__/products-page.test.tsx`

**Interfaces:**
- Connects `useProducts`, `useDeleteProduct`, category filters, and `<ProductFormDialog />`.

- [ ] **Step 1: Write Page Integration Test**

Create `src/app/pages/__tests__/products-page.test.tsx`:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { ProductsPage } from '@/app/pages/products-page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProductsPage', () => {
  beforeEach(async () => {
    await db.products.clear();
  });

  it('shows empty state when no products exist and opens form dialog', async () => {
    render(<ProductsPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Kelola Produk/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Belum ada produk/i)).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Tambah Produk/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { name: /Tambah Produk Baru/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement full ProductsPage component**

Update `src/app/pages/products-page.tsx`:
```typescript
import React, { useState, useMemo } from 'react';
import { Plus, Search, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts, useDeleteProduct } from '@/features/products/hooks/use-products';
import { ProductCard } from '@/features/products/components/product-card';
import { ProductFormDialog } from '@/features/products/components/product-form-dialog';
import type { Product } from '@/types/product.types';

export const ProductsPage: React.FC = () => {
  const { data: products = [], isLoading } = useProducts();
  const deleteMutation = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kelola Produk</h2>
          <p className="text-muted-foreground text-sm">
            Daftar master data produk, inventaris stok, dan kategori tokomu.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Badge
            variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => setSelectedCategory('ALL')}
          >
            Semua ({products.length})
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1 text-xs"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card">
          <PackageOpen className="h-12 w-12 text-muted-foreground/60 mb-4" />
          <h3 className="font-semibold text-lg">Belum ada produk</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih.'
              : 'Tambahkan produk pertama tokomu untuk mulai melayani transaksi kasir.'}
          </p>
          <Button onClick={handleOpenCreate} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default ProductsPage;
```

- [ ] **Step 3: Run all tests to verify full suite passes**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/products-page.tsx src/app/pages/__tests__/products-page.test.tsx
git commit -m "feat(products): integrate products management page with catalog grid and dialogs"
```
