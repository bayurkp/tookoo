'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface DateTimePicker24hProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker24h({
  date: controlledDate,
  onSelect: controlledOnSelect,
  placeholder = 'Pilih Tanggal & Waktu',
  className,
  disabled,
}: DateTimePicker24hProps = {}) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(controlledDate);
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedDate = controlledDate !== undefined ? controlledDate : internalDate;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      if (selectedDate) {
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
      }
      if (controlledOnSelect) {
        controlledOnSelect(newDate);
      } else {
        setInternalDate(newDate);
      }
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    if (type === 'hour') {
      baseDate.setHours(parseInt(value, 10));
    } else if (type === 'minute') {
      baseDate.setMinutes(parseInt(value, 10));
    }
    if (controlledOnSelect) {
      controlledOnSelect(baseDate);
    } else {
      setInternalDate(baseDate);
    }
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
            format(selectedDate, 'dd/MM/yyyy HH:mm', { locale: idLocale })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2 gap-1">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={selectedDate && selectedDate.getHours() === hour ? 'default' : 'ghost'}
                    className="h-7 w-7 text-xs font-mono shrink-0"
                    onClick={() => handleTimeChange('hour', hour.toString())}
                  >
                    {hour.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2 gap-1">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      selectedDate && selectedDate.getMinutes() === minute ? 'default' : 'ghost'
                    }
                    className="h-7 w-7 text-xs font-mono shrink-0"
                    onClick={() => handleTimeChange('minute', minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
