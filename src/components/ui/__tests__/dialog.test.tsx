import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../dialog';

describe('Dialog', () => {
  it('does not render when open is false', () => {
    render(
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Judul Modal</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Judul Modal')).not.toBeInTheDocument();
  });

  it('renders content when open is true', () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Judul Modal</DialogTitle>
            <DialogDescription>Deskripsi Modal</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Judul Modal')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi Modal')).toBeInTheDocument();
  });

  it('triggers onOpenChange when close button is clicked', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle>Judul Modal</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
