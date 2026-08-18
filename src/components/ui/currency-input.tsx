import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { getCurrencyConfig } from '@/utils/currency-config';

export interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: number;
  onValueChange?: (val: number) => void;
  currencyCode?: string;
  className?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    { value, onValueChange, currencyCode, className, placeholder = '0', disabled, ...props },
    ref
  ) => {
    const config = getCurrencyConfig(currencyCode);

    // Format a numeric value into a display string with thousand separators
    const formatDisplay = useCallback(
      (num?: number): string => {
        if (num === undefined || num === null || isNaN(num) || num === 0) {
          return '';
        }

        if (config.decimalDigits === 0) {
          // Zero-decimal (IDR, JPY): e.g. 150000 -> 150.000
          const intStr = Math.round(num).toString();
          return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
        } else {
          // Decimal currencies (USD, EUR, etc.): e.g. 15.5 -> 15.50 or raw typing
          const parts = num.toString().split('.');
          const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
          if (parts.length > 1) {
            return `${intPart}${config.decimalSeparator}${parts[1].slice(0, config.decimalDigits)}`;
          }
          return intPart;
        }
      },
      [config]
    );

    const [displayValue, setDisplayValue] = useState<string>(() => formatDisplay(value));

    // Keep display synchronized when external value changes
    useEffect(() => {
      setDisplayValue(formatDisplay(value));
    }, [value, formatDisplay]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputStr = e.target.value;

      if (!inputStr) {
        setDisplayValue('');
        onValueChange?.(0);
        return;
      }

      if (config.decimalDigits === 0) {
        // Zero-decimal (IDR, JPY): Strip everything except digits
        const cleanDigits = inputStr.replace(/\D/g, '');
        if (!cleanDigits) {
          setDisplayValue('');
          onValueChange?.(0);
          return;
        }

        const numericVal = parseInt(cleanDigits, 10);
        // Format with thousand separator
        const formatted = cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
        setDisplayValue(formatted);
        onValueChange?.(numericVal);
      } else {
        // Decimal currencies (USD, EUR):
        // Normalize decimal separator to standard '.'
        const sanitized = inputStr
          .replace(new RegExp(`\\${config.thousandSeparator}`, 'g'), '')
          .replace(config.decimalSeparator, '.');

        // Allow only digits and optional decimal point
        const validMatch = sanitized.match(/^\d*(\.\d{0,2})?/);
        const validNumStr = validMatch ? validMatch[0] : '';

        if (!validNumStr) {
          setDisplayValue('');
          onValueChange?.(0);
          return;
        }

        const numericVal = parseFloat(validNumStr) || 0;

        // Split integer and decimal for display formatting
        const parts = validNumStr.split('.');
        const intFormatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
        const finalDisplay =
          parts.length > 1 ? `${intFormatted}${config.decimalSeparator}${parts[1]}` : intFormatted;

        setDisplayValue(finalDisplay);
        onValueChange?.(numericVal);
      }
    };

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        {/* Currency Symbol Badge */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground select-none pointer-events-none">
          {config.symbol}
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm font-bold text-foreground ring-offset-background placeholder:text-muted-foreground placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
export default CurrencyInput;
