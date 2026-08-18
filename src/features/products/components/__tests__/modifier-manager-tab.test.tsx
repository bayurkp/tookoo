import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { ModifierManagerTab } from '../modifier-manager-tab';
import { db } from '@/lib/db';
import type { Product } from '@/types/product.types';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Kopi Susu Aren',
    category: 'Minuman',
    unit: 'cup',
    price: 18000,
    stock: 25,
    minStock: 5,
    isActive: true,
    productType: 'FNB',
    modifierGroups: [
      {
        id: 'mod-1',
        name: 'Topping Minuman Tambahan',
        required: false,
        options: [{ id: 'opt-1', name: 'Ekstra Boba Brown Sugar', price: 3000 }],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
  },
];

describe('ModifierManagerTab', () => {
  const onOpenEditProduct = vi.fn();
  const onOpenCreateProduct = vi.fn();

  beforeEach(async () => {
    await db.masterModifierGroups.clear();
  });

  it('renders default master modifier groups and options', async () => {
    renderWithProviders(
      <ModifierManagerTab
        products={mockProducts}
        onOpenEditProduct={onOpenEditProduct}
        onOpenCreateProduct={onOpenCreateProduct}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Topping Minuman Tambahan')).toBeInTheDocument();
    });

    expect(screen.getByText('Ekstra Boba Brown Sugar')).toBeInTheDocument();
    expect(screen.getByText('Pilihan Jenis Susu (Dairy Option)')).toBeInTheDocument();
  });

  it('filters master modifiers by search query', async () => {
    renderWithProviders(
      <ModifierManagerTab
        products={mockProducts}
        onOpenEditProduct={onOpenEditProduct}
        onOpenCreateProduct={onOpenCreateProduct}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Topping Minuman Tambahan')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Cari grup master modifier/i);
    fireEvent.change(searchInput, { target: { value: 'Susu' } });

    expect(screen.getByText('Pilihan Jenis Susu (Dairy Option)')).toBeInTheDocument();
  });
});
