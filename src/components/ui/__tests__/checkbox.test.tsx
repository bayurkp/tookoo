import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default and toggles on click', () => {
    const onCheckedChange = vi.fn();
    render(
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" onCheckedChange={onCheckedChange} />
        <label htmlFor="terms">Accept terms</label>
      </div>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');

    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('renders disabled state', () => {
    render(<Checkbox disabled id="disabled-box" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });
});
