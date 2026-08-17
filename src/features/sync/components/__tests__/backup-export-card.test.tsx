import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BackupExportCard } from '../backup-export-card';

describe('BackupExportCard', () => {
  it('triggers onExport when clicking export button', () => {
    const handleExport = vi.fn();
    const handleImport = vi.fn().mockResolvedValue({ productsCount: 0, ordersCount: 0 });

    render(<BackupExportCard onExport={handleExport} onImport={handleImport} />);

    const exportBtn = screen.getByRole('button', {
      name: /Ekspor Berkas Cadangan/i,
    });
    fireEvent.click(exportBtn);

    expect(handleExport).toHaveBeenCalledTimes(1);
  });
});
