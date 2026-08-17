import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../alert-dialog';

describe('AlertDialog', () => {
  it('renders trigger and shows alert dialog content when opened', () => {
    const handleAction = vi.fn();
    const handleCancel = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button type="button">Buka Konfirmasi</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Tindakan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data ini secara permanen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    // Initial state: dialog is closed
    expect(screen.getByRole('button', { name: /Buka Konfirmasi/i })).toBeInTheDocument();
    expect(screen.queryByText(/Konfirmasi Tindakan/i)).not.toBeInTheDocument();

    // Click trigger
    fireEvent.click(screen.getByRole('button', { name: /Buka Konfirmasi/i }));

    // Dialog is now open
    expect(screen.getByText(/Konfirmasi Tindakan/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Apakah Anda yakin ingin menghapus data ini secara permanen\?/i)
    ).toBeInTheDocument();

    // Click confirm action
    const actionBtn = screen.getByRole('button', { name: /Lanjutkan/i });
    fireEvent.click(actionBtn);

    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
