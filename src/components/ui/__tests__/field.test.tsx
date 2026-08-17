import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '../field';
import { Input } from '../input';

describe('Field Components', () => {
  it('renders Field with FieldLabel, Input, and FieldDescription', () => {
    render(
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="test-name">Nama Pelanggan</FieldLabel>
          <Input id="test-name" placeholder="Budi Santoso" />
          <FieldDescription>Masukkan nama lengkap pelanggan.</FieldDescription>
        </Field>
      </FieldGroup>
    );

    expect(screen.getByText('Nama Pelanggan')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Masukkan nama lengkap pelanggan.')).toBeInTheDocument();
  });

  it('renders FieldError with error message', () => {
    render(
      <Field>
        <FieldError errors={[{ message: 'Nama produk wajib diisi' }]} />
      </Field>
    );

    expect(screen.getByText('Nama produk wajib diisi')).toBeInTheDocument();
  });
});
