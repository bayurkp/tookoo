import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/testing/test-utils';
import { OrderReceiptDialog } from '../order-receipt-dialog';
import type { Order } from '@/types/order.types';

const mockOrder: Order = {
  id: 'ord-1',
  orderNumber: 'TK-20260817-0099',
  items: [
    {
      productId: 'p-1',
      name: 'Caramel Macchiato',
      price: 25000,
      qty: 2,
      subtotal: 50000,
    },
  ],
  subtotal: 50000,
  discount: 5000,
  totalAmount: 45000,
  paymentMethod: 'CASH',
  amountPaid: 50000,
  changeDue: 5000,
  cashierName: 'Kasir Utama',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
};

describe('OrderReceiptDialog', () => {
  it('renders order receipt breakdown and triggers print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderWithProviders(<OrderReceiptDialog order={mockOrder} open={true} onOpenChange={() => {}} />);

    expect(screen.getByText('TK-20260817-0099')).toBeInTheDocument();
    expect(screen.getByText('Caramel Macchiato')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cetak.*Struk/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cetak.*Struk/i }));
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });
});
