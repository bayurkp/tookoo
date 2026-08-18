import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableCanvas } from '../table-canvas';
import type { StoreTable } from '@/types/table.types';

const mockTables: StoreTable[] = [
  {
    id: 'tbl-1',
    name: 'Meja 01',
    zone: 'Area Utama',
    x: 40,
    y: 40,
    width: 100,
    height: 80,
    capacity: 4,
    shape: 'RECTANGLE',
    status: 'AVAILABLE',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
  },
  {
    id: 'tbl-2',
    name: 'Meja 02',
    zone: 'Area Utama',
    x: 180,
    y: 40,
    width: 100,
    height: 80,
    capacity: 4,
    shape: 'RECTANGLE',
    status: 'OCCUPIED',
    currentCustomerName: 'Meja Keluarga',
    activeOrderTotal: 85000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
  },
];

describe('TableCanvas', () => {
  it('renders tables on canvas with status badges and capacity', () => {
    render(<TableCanvas tables={mockTables} isEditable={true} />);

    expect(screen.getByText('Meja 01')).toBeInTheDocument();
    expect(screen.getByText('Meja 02')).toBeInTheDocument();
    expect(screen.getByText('Kosong')).toBeInTheDocument();
    expect(screen.getByText('Terisi')).toBeInTheDocument();
    expect(screen.getByText('Meja Keluarga')).toBeInTheDocument();
  });

  it('selects table when clicked', () => {
    const onSelect = vi.fn();
    render(<TableCanvas tables={mockTables} onSelectTable={onSelect} />);

    fireEvent.click(screen.getByText('Meja 01'));
    expect(onSelect).toHaveBeenCalledWith(mockTables[0]);
  });
});
