import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CurrencyInput } from '../currency-input';

describe('CurrencyInput', () => {
  it('renders with currency symbol badge and formats initial value', () => {
    render(<CurrencyInput value={50000} />);

    expect(screen.getByText('Rp')).toBeInTheDocument();
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('50.000');
  });

  it('formats input with thousand separator dots in IDR and emits raw numeric value', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput onValueChange={handleChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '150000' } });

    expect(input.value).toBe('150.000');
    expect(handleChange).toHaveBeenCalledWith(150000);
  });

  it('strips non-numeric characters in IDR mode', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput onValueChange={handleChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc25000xyz' } });

    expect(input.value).toBe('25.000');
    expect(handleChange).toHaveBeenCalledWith(25000);
  });

  it('handles USD currency with dollar symbol and commas', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput currencyCode="USD" onValueChange={handleChange} />);

    expect(screen.getByText('$')).toBeInTheDocument();
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1500.50' } });

    expect(input.value).toBe('1,500.50');
    expect(handleChange).toHaveBeenCalledWith(1500.5);
  });

  it('clears input to empty string and emits 0 when cleared', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onValueChange={handleChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });

    expect(input.value).toBe('');
    expect(handleChange).toHaveBeenCalledWith(0);
  });
});
