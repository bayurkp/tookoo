import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../tooltip';

describe('Tooltip', () => {
  it('renders trigger element within TooltipProvider', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Tombol Bantuan</button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Petunjuk Aksi</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByText('Tombol Bantuan')).toBeInTheDocument();
  });
});
