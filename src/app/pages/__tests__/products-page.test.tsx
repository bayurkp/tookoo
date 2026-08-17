import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import { ProductsPage } from '../products-page';
import { useAuthStore } from '@/stores/auth-store';

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
    useAuthStore.setState({ currentRole: 'OWNER' });
  });

  it('shows empty state when no products exist and opens form dialog', async () => {
    render(<ProductsPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Daftar Produk|Kelola Produk/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Belum ada produk/i)).toBeInTheDocument();
    });

    const addBtns = screen.getAllByRole('button', { name: /Tambah Produk/i });
    fireEvent.click(addBtns[0]);

    expect(screen.getByText('Tambah Produk Baru')).toBeInTheDocument();
  });

  it('renders products and filters by category', async () => {
    await db.products.bulkPut([
      {
        id: 'p1',
        name: 'Kopi Hitam',
        category: 'Minuman',
        price: 10000,
        stock: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null,
      },
      {
        id: 'p2',
        name: 'Donat Cokelat',
        category: 'Makanan',
        price: 8000,
        stock: 5,
        createdAt: Date.now() + 1,
        updatedAt: Date.now() + 1,
        deletedAt: null,
      },
    ]);

    render(<ProductsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Kopi Hitam')).toBeInTheDocument();
      expect(screen.getByText('Donat Cokelat')).toBeInTheDocument();
    });

    // Click category filter "Makanan" (first occurrence is the category pill)
    const makananBadges = screen.getAllByText('Makanan');
    fireEvent.click(makananBadges[0]);

    expect(screen.queryByText('Kopi Hitam')).not.toBeInTheDocument();
    expect(screen.getByText('Donat Cokelat')).toBeInTheDocument();
  });

  it('opens AlertDialog and deletes product upon confirmation', async () => {
    await db.products.put({
      id: 'p-del',
      name: 'Produk Dihapus',
      category: 'Lainnya',
      price: 15000,
      stock: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    render(<ProductsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Produk Dihapus')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByLabelText('Delete');
    fireEvent.click(deleteBtn);

    // AlertDialog should appear
    expect(screen.getByText(/Hapus Produk Ini\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Ya, Hapus Produk/i });
    fireEvent.click(confirmBtn);

    await waitFor(async () => {
      const productInDb = await db.products.get('p-del');
      expect(productInDb?.deletedAt).not.toBeNull();
    });
  });
});
