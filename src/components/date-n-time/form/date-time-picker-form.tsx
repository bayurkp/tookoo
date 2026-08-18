'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const FormSchema = z.object({
  time: z.date({
    message: 'Tanggal dan waktu harus diisi.',
  }),
});

export interface DateTimePickerFormProps {
  onSubmitSuccess?: (date: Date) => void;
}

export function DateTimePickerForm({ onSubmitSuccess }: DateTimePickerFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema) as any,
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (onSubmitSuccess) {
      onSubmitSuccess(data.time);
    }
  }

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      const current = form.getValues('time') || new Date();
      date.setHours(current.getHours());
      date.setMinutes(current.getMinutes());
      form.setValue('time', date, { shouldValidate: true });
    }
  }

  function handleTimeChange(type: 'hour' | 'minute' | 'ampm', value: string) {
    const currentDate = form.getValues('time') || new Date();
    const newDate = new Date(currentDate);

    if (type === 'hour') {
      const hour = parseInt(value, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === 'ampm') {
      const hours = newDate.getHours();
      if (value === 'AM' && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === 'PM' && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    form.setValue('time', newDate, { shouldValidate: true });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal & Waktu (12 Jam AM/PM)</FormLabel>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP hh:mm a', { locale: idLocale })
                      ) : (
                        <span>Pilih tanggal dan waktu</span>
                      )}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="sm:flex">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date('1900-01-01')}
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x border-t sm:border-t-0">
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i + 1)
                            .reverse()
                            .map((hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                variant={
                                  field.value && (field.value.getHours() % 12 || 12) === hour
                                    ? 'default'
                                    : 'ghost'
                                }
                                className="sm:w-full shrink-0 aspect-square text-xs"
                                onClick={() => handleTimeChange('hour', hour.toString())}
                              >
                                {hour}
                              </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                      </ScrollArea>
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                            <Button
                              key={minute}
                              size="icon"
                              variant={
                                field.value && field.value.getMinutes() === minute
                                  ? 'default'
                                  : 'ghost'
                              }
                              className="sm:w-full shrink-0 aspect-square text-xs"
                              onClick={() => handleTimeChange('minute', minute.toString())}
                            >
                              {minute.toString().padStart(2, '0')}
                            </Button>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                      </ScrollArea>
                      <ScrollArea className="">
                        <div className="flex sm:flex-col p-2">
                          {['AM', 'PM'].map((ampm) => (
                            <Button
                              key={ampm}
                              size="icon"
                              variant={
                                field.value &&
                                ((ampm === 'AM' && field.value.getHours() < 12) ||
                                  (ampm === 'PM' && field.value.getHours() >= 12))
                                  ? 'default'
                                  : 'ghost'
                              }
                              className="sm:w-full shrink-0 aspect-square text-xs"
                              onClick={() => handleTimeChange('ampm', ampm)}
                            >
                              {ampm}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>Pilih waktu dalam format 12 jam (AM/PM).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="cursor-pointer">
          Simpan Waktu
        </Button>
      </form>
    </Form>
  );
}
