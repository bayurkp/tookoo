import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../product-card';
import type { Product } from '@/types/product.types';

const mockProduct: Product = {
  id: 'prod-123',
  name: 'Espresso Single Shot',
  category: 'Kopi',
  price: 15000,
  stock: 20,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('ProductCard', () => {
  it('renders product details correctly', () => {
    render(<ProductCard product={mockProduct} onEdit={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('Espresso Single Shot')).toBeInTheDocument();
    expect(screen.getByText('Kopi')).toBeInTheDocument();
    expect(screen.getByText(/15\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Stok: 20/i)).toBeInTheDocument();
  });

  it('shows out of stock badge when stock is 0', () => {
    render(
      <ProductCard product={{ ...mockProduct, stock: 0 }} onEdit={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByText(/Stok Habis/i)).toBeInTheDocument();
  });

  it('triggers onEdit and onDelete handlers', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(<ProductCard product={mockProduct} onEdit={handleEdit} onDelete={handleDelete} />);

    const editBtn = screen.getByRole('button', { name: /edit/i });
    const deleteBtn = screen.getByRole('button', { name: /delete/i });

    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockProduct);

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(mockProduct.id);
  });
});
