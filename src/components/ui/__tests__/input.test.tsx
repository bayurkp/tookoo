import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '../input';

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    render(<Input placeholder="Masukkan nama produk" />);
    expect(screen.getByPlaceholderText('Masukkan nama produk')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Input placeholder="Nama" error="Nama wajib diisi" />);
    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
  });
});
