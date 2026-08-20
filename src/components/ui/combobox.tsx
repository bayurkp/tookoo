import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Check, Search } from 'lucide-react';

import { cn } from '@/lib/cn';

const Combobox = ComboboxPrimitive.Root;

const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Trigger ref={ref} className={cn(className)} {...props} />
));
ComboboxTrigger.displayName = 'ComboboxTrigger';

const ComboboxValue = ComboboxPrimitive.Value;

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Popup> & {
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'bottom' | 'left' | 'right';
    sideOffset?: number;
  }
>(({ className, align = 'start', side = 'bottom', sideOffset = 4, children, ...props }, ref) => (
  <ComboboxPrimitive.Portal>
    <ComboboxPrimitive.Positioner
      align={align}
      side={side}
      sideOffset={sideOffset}
      className="z-50"
    >
      <ComboboxPrimitive.Popup
        ref={ref}
        className={cn(
          'min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className
        )}
        {...props}
      >
        {children}
      </ComboboxPrimitive.Popup>
    </ComboboxPrimitive.Positioner>
  </ComboboxPrimitive.Portal>
));
ComboboxContent.displayName = 'ComboboxContent';

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input> & {
    showTrigger?: boolean;
  }
>(({ className, showTrigger: _showTrigger, ...props }, ref) => (
  <div className="flex items-center border-b px-3">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <ComboboxPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
));
ComboboxInput.displayName = 'ComboboxInput';

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.List>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden p-1', className)}
    {...props}
  />
));
ComboboxList.displayName = 'ComboboxList';

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Empty
    ref={ref}
    className={cn('py-6 text-center text-xs text-muted-foreground', className)}
    {...props}
  />
));
ComboboxEmpty.displayName = 'ComboboxEmpty';

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-xs outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2 truncate flex-1">{children}</div>
    <ComboboxPrimitive.ItemIndicator className="ml-auto flex items-center justify-center">
      <Check className="h-3.5 w-3.5 text-primary" />
    </ComboboxPrimitive.ItemIndicator>
  </ComboboxPrimitive.Item>
));
ComboboxItem.displayName = 'ComboboxItem';

const ComboboxGroup = ComboboxPrimitive.Group;
const ComboboxGroupLabel = ComboboxPrimitive.GroupLabel;
const ComboboxSeparator = ComboboxPrimitive.Separator;

export {
  Combobox,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxSeparator,
};
