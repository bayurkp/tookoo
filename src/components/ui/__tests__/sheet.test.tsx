import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../sheet';

describe('Sheet', () => {
  it('renders trigger and displays sheet drawer content when opened', () => {
    render(
      <Sheet>
        <SheetTrigger>Buka Keranjang</SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Keranjang Belanja</SheetTitle>
            <SheetDescription>Daftar pesanan kasir</SheetDescription>
          </SheetHeader>
          <p>Konten Item Keranjang</p>
        </SheetContent>
      </Sheet>
    );

    const trigger = screen.getByText('Buka Keranjang');
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByText('Keranjang Belanja')).toBeInTheDocument();
    expect(screen.getByText('Konten Item Keranjang')).toBeInTheDocument();
  });
});
