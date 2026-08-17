import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ProductFormDialog } from '../product-form-dialog';
import { db } from '@/lib/db';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProductFormDialog', () => {
  beforeEach(async () => {
    await db.products.clear();
  });

  it('renders create mode with empty form', () => {
    render(
      <ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={null} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Tambah Produk Baru')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Produk/i)).toHaveValue('');
  });

  it('populates fields when productToEdit is supplied', () => {
    const product = {
      id: 'prod-1',
      name: 'Cappuccino Hot',
      category: 'Kopi',
      price: 20000,
      stock: 15,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    render(
      <ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={product} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Edit Produk')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Produk/i)).toHaveValue('Cappuccino Hot');
    expect(screen.getByLabelText(/Kategori/i)).toHaveValue('Kopi');
  });

  it('validates required fields on empty submit', async () => {
    render(
      <ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={null} />,
      { wrapper: createWrapper() }
    );

    const submitBtn = screen.getByRole('button', { name: /Tambah Produk/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Nama produk wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/Kategori produk wajib diisi/i)).toBeInTheDocument();
    });
  });
});
