import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';

describe('Tabs', () => {
  it('renders active tab content and switches tabs on trigger click', () => {
    const handleValueChange = vi.fn();

    render(
      <Tabs defaultValue="cash" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="cash">Tunai</TabsTrigger>
          <TabsTrigger value="qris">QRIS</TabsTrigger>
        </TabsList>
        <TabsContent value="cash">
          <p>Konten Tunai</p>
        </TabsContent>
        <TabsContent value="qris">
          <p>Konten QRIS</p>
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Konten Tunai')).toBeInTheDocument();
    expect(screen.queryByText('Konten QRIS')).not.toBeInTheDocument();

    const qrisTrigger = screen.getByRole('tab', { name: /QRIS/i });
    fireEvent.keyDown(qrisTrigger, { key: 'Enter' });

    expect(screen.getByText('Konten QRIS')).toBeInTheDocument();
    expect(screen.queryByText('Konten Tunai')).not.toBeInTheDocument();
  });
});
