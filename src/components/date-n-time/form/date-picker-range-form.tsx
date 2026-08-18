'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { DateRange } from 'react-day-picker';
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

const FormSchema = z.object({
  dateRange: z.object({
    from: z.date({
      message: 'Tanggal awal harus diisi.',
    }),
    to: z.date().optional(),
  }),
});

export interface DatePickerWithRangeFormProps {
  onSubmitSuccess?: (dateRange: { from: Date; to?: Date }) => void;
}

export function DatePickerWithRangeForm({ onSubmitSuccess }: DatePickerWithRangeFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema) as any,
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (onSubmitSuccess) {
      onSubmitSuccess(data.dateRange);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Rentang Tanggal</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-between text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, 'LLL dd, y', { locale: idLocale })} -{' '}
                            {format(field.value.to, 'LLL dd, y', { locale: idLocale })}
                          </>
                        ) : (
                          format(field.value.from, 'LLL dd, y', { locale: idLocale })
                        )
                      ) : (
                        <span>Pilih rentang tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={field.value?.from}
                    selected={field.value as DateRange | undefined}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Pilih rentang tanggal transaksi atau laporan.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="cursor-pointer">
          Simpan Rentang Tanggal
        </Button>
      </form>
    </Form>
  );
}
