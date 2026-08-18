'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date: controlledDate,
  onSelect: controlledOnSelect,
  placeholder = 'Pilih Tanggal',
  className,
  disabled,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(controlledDate);
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedDate = controlledDate !== undefined ? controlledDate : internalDate;

  const handleSelect = (newDate: Date | undefined) => {
    if (controlledOnSelect) {
      controlledOnSelect(newDate);
    } else {
      setInternalDate(newDate);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9 text-xs',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary shrink-0" />
          {selectedDate ? (
            format(selectedDate, 'PPP', { locale: idLocale })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}

export function DatePickerDemo() {
  return <DatePicker />;
}
