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

  it('renders create mode with Simple Mode by default', () => {
    render(<ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={null} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Tambah Produk Baru/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mode Sederhana/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Produk/i)).toHaveValue('');
  });

  it('populates fields when productToEdit is supplied', () => {
    const product = {
      id: 'prod-1',
      name: 'Cappuccino Hot',
      category: 'Kopi',
      unit: 'cup',
      price: 20000,
      stock: 15,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    render(<ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={product} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Edit Data Produk/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Produk/i)).toHaveValue('Cappuccino Hot');
    expect(screen.getByLabelText(/^kategori produk/i)).toHaveValue('Kopi');
  });

  it('validates required fields on empty submit in Simple Mode', async () => {
    render(<ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={null} />, {
      wrapper: createWrapper(),
    });

    const submitBtn = screen.getByRole('button', { name: /Simpan Produk/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Nama produk wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/Kategori.*wajib diisi/i)).toBeInTheDocument();
    });
  });

  it('switches between Simple Mode and Advance Mode seamlessly', () => {
    render(<ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={null} />, {
      wrapper: createWrapper(),
    });

    const modeToggleBtn = screen.getByRole('button', { name: /Mode Sederhana/i });
    fireEvent.click(modeToggleBtn);

    // Should now show Advance Mode tabs
    expect(screen.getByRole('tab', { name: /Varian/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Modifier/i })).toBeInTheDocument();

    // Toggle back to Simple Mode
    const advanceBtn = screen.getByRole('button', { name: /Mode Lengkap/i });
    fireEvent.click(advanceBtn);

    expect(screen.queryByRole('tab', { name: /Varian/i })).not.toBeInTheDocument();
  });

  it('allows defining multi-level dimensions in Advance Mode and generates variant matrix', async () => {
    render(<ProductFormDialog open={true} onOpenChange={() => {}} productToEdit={null} />, {
      wrapper: createWrapper(),
    });

    // 1. Switch to Advance Mode
    const modeToggleBtn = screen.getByRole('button', { name: /Mode Sederhana/i });
    fireEvent.click(modeToggleBtn);

    // 2. Switch to Variants tab
    const variantsTab = screen.getByRole('tab', { name: /Varian/i });
    fireEvent.keyDown(variantsTab, { key: 'Enter' });

    // 3. Add dimension level 1
    const addDimBtn = await screen.findByRole('button', { name: /Tambah Tingkat Dimensi/i });
    fireEvent.click(addDimBtn);

    expect(screen.getByDisplayValue('Ukuran')).toBeInTheDocument();

    // Add option to Dimension 1
    const optionInput = screen.getByPlaceholderText(/\+ Ketik opsi lalu Tekan Enter/i);
    fireEvent.change(optionInput, { target: { value: 'S' } });
    fireEvent.keyDown(optionInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('S')).toBeInTheDocument();
  });
});
