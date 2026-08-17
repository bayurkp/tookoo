import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DailySummaryCard } from '../daily-summary-card';
import type { Order } from '@/types/order.types';

describe('DailySummaryCard', () => {
  it('calculates total revenue and order count for today with insightful microcopy', () => {
    const today = Date.now();
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'TK-001',
        items: [],
        subtotal: 50000,
        discount: 0,
        totalAmount: 50000,
        paymentMethod: 'CASH',
        amountPaid: 50000,
        changeDue: 0,
        cashierName: 'Kasir',
        createdAt: today,
        updatedAt: today,
        deletedAt: null,
      },
      {
        id: '2',
        orderNumber: 'TK-002',
        items: [],
        subtotal: 30000,
        discount: 0,
        totalAmount: 30000,
        paymentMethod: 'QRIS',
        amountPaid: 30000,
        changeDue: 0,
        cashierName: 'Kasir',
        createdAt: today,
        updatedAt: today,
        deletedAt: null,
      },
    ];

    render(<DailySummaryCard orders={mockOrders} />);

    expect(screen.getByText('Omzet Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Total Transaksi')).toBeInTheDocument();
  });
});
