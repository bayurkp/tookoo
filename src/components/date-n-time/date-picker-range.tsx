'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface DatePickerWithRangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  date?: DateRange | undefined;
  onSelect?: (date: DateRange | undefined) => void;
  placeholder?: string;
  numberOfMonths?: number;
  disabled?: boolean;
}

export function DatePickerWithRange({
  date: controlledDate,
  onSelect: controlledOnSelect,
  placeholder = 'Pilih Rentang Tanggal',
  numberOfMonths = 2,
  className,
  disabled,
}: DatePickerWithRangeProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(controlledDate);

  const selectedRange = controlledDate !== undefined ? controlledDate : internalDate;

  const handleSelect = (range: any) => {
    if (controlledOnSelect) {
      controlledOnSelect(range);
    } else {
      setInternalDate(range);
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-range"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-9 text-xs',
              !selectedRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary shrink-0" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, 'dd MMM yyyy', { locale: idLocale })} -{' '}
                  {format(selectedRange.to, 'dd MMM yyyy', { locale: idLocale })}
                </>
              ) : (
                format(selectedRange.from, 'dd MMM yyyy', { locale: idLocale })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={selectedRange?.from}
            selected={selectedRange as any}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
