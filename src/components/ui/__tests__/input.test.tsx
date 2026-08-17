import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '../input';

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    render(<Input placeholder="Masukkan nama produk" />);
    expect(screen.getByPlaceholderText('Masukkan nama produk')).toBeInTheDocument();
  });

  it('renders disabled input when disabled prop is true', () => {
    render(<Input placeholder="Nama" disabled />);
    expect(screen.getByPlaceholderText('Nama')).toBeDisabled();
  });
});
