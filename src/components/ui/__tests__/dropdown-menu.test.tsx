import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../dropdown-menu';

describe('DropdownMenu', () => {
  it('renders trigger and shows items when open is true', () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuTrigger>Opsi Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pilihan 1</DropdownMenuItem>
          <DropdownMenuItem>Pilihan 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Opsi Menu');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Pilihan 1')).toBeInTheDocument();
    expect(screen.getByText('Pilihan 2')).toBeInTheDocument();
  });
});
