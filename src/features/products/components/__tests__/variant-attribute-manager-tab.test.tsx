import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { VariantAttributeManagerTab } from '../variant-attribute-manager-tab';
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
    variants: [
      {
        id: 'var-1',
        name: 'Small (S)',
        price: 15000,
        costPrice: 8000,
        stock: 10,
        minStock: 5,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
  },
];

describe('VariantAttributeManagerTab', () => {
  const onEditProduct = vi.fn();

  beforeEach(async () => {
    await db.masterVariantAttributes.clear();
  });

  it('renders default master variant attributes', async () => {
    renderWithProviders(
      <VariantAttributeManagerTab products={mockProducts} onEditProduct={onEditProduct} />
    );

    await waitFor(() => {
      expect(screen.getByText('Ukuran (Size)')).toBeInTheDocument();
    });

    expect(screen.getByText('Suhu Penyajian')).toBeInTheDocument();
  });

  it('switches between Master Dimensi and Tabel Flat view modes', async () => {
    renderWithProviders(
      <VariantAttributeManagerTab products={mockProducts} onEditProduct={onEditProduct} />
    );

    await waitFor(() => {
      expect(screen.getByText('Ukuran (Size)')).toBeInTheDocument();
    });

    const flatTableBtn = screen.getByRole('button', { name: /Tabel Flat Varian Toko/i });
    fireEvent.click(flatTableBtn);

    expect(screen.getByText('Total 1 varian aktif')).toBeInTheDocument();
  });
});
