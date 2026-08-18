import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/testing/test-utils';
import { UomManagerTab } from '../uom-manager-tab';
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

describe('UomManagerTab', () => {
  beforeEach(async () => {
    await db.masterUoms.clear();
  });

  it('renders default UOM units with stats', async () => {
    renderWithProviders(<UomManagerTab products={mockProducts} />);

    await waitFor(() => {
      expect(screen.getByText('Pieces / Buah')).toBeInTheDocument();
    });

    expect(screen.getByText('Cup Gelas')).toBeInTheDocument();
  });

  it('searches and filters UOM units by symbol or name', async () => {
    renderWithProviders(<UomManagerTab products={mockProducts} />);

    await waitFor(() => {
      expect(screen.getByText('Pieces / Buah')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Cari satuan unit/i);
    fireEvent.change(searchInput, { target: { value: 'cup' } });

    expect(screen.getByText('Cup Gelas')).toBeInTheDocument();
  });
});
