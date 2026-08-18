import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollArea, ScrollBar } from '../scroll-area';

describe('ScrollArea', () => {
  it('renders scroll area container and children correctly', () => {
    render(
      <ScrollArea className="h-48 w-48">
        <div>
          <p>Tag 1</p>
          <p>Tag 2</p>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    );

    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
  });
});
