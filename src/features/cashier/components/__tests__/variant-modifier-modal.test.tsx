import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VariantModifierModal } from '../variant-modifier-modal';
import type { Product } from '@/types/product.types';

const mockProductWithVariantsAndModifiers: Product = {
  id: 'prod-kopi',
  name: 'Kopi Susu Aren',
  category: 'Minuman',
  productType: 'FNB',
  price: 18000,
  stock: 20,
  variants: [
    { id: 'v-reg', name: 'Reguler', price: 18000, stock: 15 },
    { id: 'v-lrg', name: 'Large', price: 24000, stock: 10 },
  ],
  modifierGroups: [
    {
      id: 'grp-topping',
      name: 'Topping Tambahan',
      required: false,
      maxSelect: 3,
      options: [
        { id: 'opt-boba', name: 'Ekstra Boba', price: 4000 },
        { id: 'opt-jelly', name: 'Grass Jelly', price: 3000 },
      ],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('VariantModifierModal', () => {
  it('renders product variants, modifier options, and adds selected items to cart', () => {
    const handleAddToCart = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <VariantModifierModal
        product={mockProductWithVariantsAndModifiers}
        open={true}
        onOpenChange={handleOpenChange}
        onAddToCart={handleAddToCart}
      />
    );

    expect(screen.getByText('Kopi Susu Aren')).toBeInTheDocument();
    expect(screen.getByText('Pilih Varian *')).toBeInTheDocument();
    expect(screen.getByText('Reguler')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
    expect(screen.getByText('Topping Tambahan')).toBeInTheDocument();

    // Select Large variant
    const largeBtn = screen.getByText('Large');
    fireEvent.click(largeBtn);

    // Select Extra Boba topping
    const bobaOption = screen.getByText('Ekstra Boba');
    fireEvent.click(bobaOption);

    // Click Add to Cart button (Large Rp 24.000 + Boba Rp 4.000 = Rp 28.000)
    const addBtn = screen.getByRole('button', { name: /Tambah ke Keranjang/i });
    fireEvent.click(addBtn);

    expect(handleAddToCart).toHaveBeenCalledTimes(1);
    expect(handleAddToCart).toHaveBeenCalledWith(
      mockProductWithVariantsAndModifiers,
      1,
      expect.objectContaining({ id: 'v-lrg', name: 'Large', price: 24000 }),
      expect.arrayContaining([
        expect.objectContaining({ name: 'Ekstra Boba', price: 4000 }),
      ])
    );
  });
});
