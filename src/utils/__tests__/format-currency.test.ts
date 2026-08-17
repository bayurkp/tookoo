import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../format-currency';

describe('formatCurrency', () => {
  it('formats positive numbers as IDR correctly', () => {
    const formatted = formatCurrency(25000);
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

  it('formats USD currency correctly with 2 decimals', () => {
    const formatted = formatCurrency(15.5, 'USD');
    expect(formatted).toContain('15.50');
    expect(formatted).toContain('$');
  });

  it('formats EUR and JPY correctly', () => {
    const eur = formatCurrency(20.5, 'EUR');
    expect(eur).toContain('20,50');
    expect(eur).toContain('€');

    const jpy = formatCurrency(1500, 'JPY');
    expect(jpy).toContain('1,500');
    expect(jpy).toMatch(/[¥￥]/);
  });
});
