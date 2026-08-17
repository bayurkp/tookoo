import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../format-currency';

describe('formatCurrency', () => {
  it('formats positive numbers as IDR correctly', () => {
    const formatted = formatCurrency(25000);
    // id-ID currency output uses non-breaking space or standard space depending on Node version
    expect(formatted.replace(/\s/g, ' ')).toMatch(/Rp\s*25\.000/);
  });

  it('formats 0 as IDR correctly', () => {
    const formatted = formatCurrency(0);
    expect(formatted.replace(/\s/g, ' ')).toMatch(/Rp\s*0/);
  });

  it('formats large numbers as IDR correctly', () => {
    const formatted = formatCurrency(1500000);
    expect(formatted.replace(/\s/g, ' ')).toMatch(/Rp\s*1\.500\.000/);
  });
});
