export type CurrencyCode = 'IDR' | 'USD' | 'SGD' | 'MYR' | 'EUR' | 'JPY' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimalDigits: number;
  thousandSeparator: string;
  decimalSeparator: string;
  quickNominals: number[]; // Quick cash suggestion buttons for payment modal
}
