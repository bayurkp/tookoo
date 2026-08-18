import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../select';

describe('Select Component', () => {
  it('renders select trigger with placeholder', () => {
    render(
      <Select defaultValue="id">
        <SelectTrigger>
          <SelectValue placeholder="Pilih Bahasa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="id">Bahasa Indonesia</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
