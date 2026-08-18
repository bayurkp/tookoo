import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { CategoryManagerTab } from '../category-manager-tab';
import { db } from '@/lib/db';
import type { Product } from '@/types/product.types';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Kopi Susu Gula Aren',
    category: 'Minuman',
    unit: 'cup',
    price: 18000,
    stock: 25,
    minStock: 5,
    isActive: true,
    productType: 'FNB',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
  },
];

describe('CategoryManagerTab', () => {
  const onSelectCategoryFilter = vi.fn();
  const onOpenCreateProduct = vi.fn();

  beforeEach(async () => {
    await db.masterCategories.clear();
  });

  it('renders seeded master categories', async () => {
    renderWithProviders(
      <CategoryManagerTab
        products={mockProducts}
        onSelectCategoryFilter={onSelectCategoryFilter}
        onOpenCreateProduct={onOpenCreateProduct}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Minuman')).toBeInTheDocument();
    });

    expect(screen.getByText('1 Produk terdaftar')).toBeInTheDocument();
  });

  it('filters categories with search input', async () => {
    renderWithProviders(
      <CategoryManagerTab
        products={mockProducts}
        onSelectCategoryFilter={onSelectCategoryFilter}
        onOpenCreateProduct={onOpenCreateProduct}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Minuman')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Cari kategori/i);
    fireEvent.change(searchInput, { target: { value: 'Minuman' } });

    expect(screen.getByText('Minuman')).toBeInTheDocument();
  });

  it('calls onSelectCategoryFilter when clicking Lihat Produk', async () => {
    renderWithProviders(
      <CategoryManagerTab
        products={mockProducts}
        onSelectCategoryFilter={onSelectCategoryFilter}
        onOpenCreateProduct={onOpenCreateProduct}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Minuman')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button', { name: /Lihat Produk/i });
    fireEvent.click(viewButtons[0]);

    expect(onSelectCategoryFilter).toHaveBeenCalledWith('Minuman');
  });
});
