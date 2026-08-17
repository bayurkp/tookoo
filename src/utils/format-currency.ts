import { getCurrencyConfig } from './currency-config';

/**
 * Formats a numeric value into localized Currency format
 */
export const formatCurrency = (amount: number, currencyCode?: string): string => {
  const config = getCurrencyConfig(currencyCode);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimalDigits,
    maximumFractionDigits: config.decimalDigits,
  }).format(amount);
};
