import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../table';

describe('Table Component', () => {
  it('renders table elements with correct roles and styles', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead>Harga</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Kopi Latte</TableCell>
            <TableCell>Rp 20.000</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Produk')).toBeInTheDocument();
    expect(screen.getByText('Harga')).toBeInTheDocument();
    expect(screen.getByText('Kopi Latte')).toBeInTheDocument();
    expect(screen.getByText('Rp 20.000')).toBeInTheDocument();
  });
});
