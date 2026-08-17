import type { CurrencyCode, CurrencyConfig } from '@/types/currency.types';

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Rupiah Indonesia (IDR)',
    locale: 'id-ID',
    decimalDigits: 0,
    thousandSeparator: '.',
    decimalSeparator: ',',
    quickNominals: [10000, 20000, 50000, 100000],
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    locale: 'en-US',
    decimalDigits: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    quickNominals: [5, 10, 20, 50, 100],
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar (SGD)',
    locale: 'en-SG',
    decimalDigits: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    quickNominals: [5, 10, 20, 50, 100],
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Ringgit Malaysia (MYR)',
    locale: 'ms-MY',
    decimalDigits: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    quickNominals: [5, 10, 20, 50, 100],
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    locale: 'de-DE',
    decimalDigits: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    quickNominals: [5, 10, 20, 50, 100],
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen (JPY)',
    locale: 'ja-JP',
    decimalDigits: 0,
    thousandSeparator: ',',
    decimalSeparator: '.',
    quickNominals: [500, 1000, 5000, 10000],
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    locale: 'en-GB',
    decimalDigits: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    quickNominals: [5, 10, 20, 50, 100],
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'IDR';

export const getCurrencyConfig = (code?: string): CurrencyConfig => {
  if (code && code in SUPPORTED_CURRENCIES) {
    return SUPPORTED_CURRENCIES[code as CurrencyCode];
  }
  return SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
};
