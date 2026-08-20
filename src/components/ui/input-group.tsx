import * as React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-group"
      className={cn(
        'group/input-group relative flex items-center w-full rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
        className
      )}
      {...props}
    />
  )
);
InputGroup.displayName = 'InputGroup';

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    data-slot="input-group-input"
    className={cn(
      'flex h-9 w-full min-w-0 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
InputGroupInput.displayName = 'InputGroupInput';

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'inline-start' | 'inline-end' }
>(({ className, align = 'inline-end', ...props }, ref) => (
  <div
    ref={ref}
    data-slot="input-group-addon"
    data-align={align}
    className={cn(
      'flex items-center gap-1 text-muted-foreground',
      align === 'inline-start' ? 'order-first pl-2.5 pr-0' : 'order-last pr-2.5 pl-0',
      className
    )}
    {...props}
  />
));
InputGroupAddon.displayName = 'InputGroupAddon';

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { render?: React.ReactNode }
>(({ className, size = 'sm', variant = 'ghost', render, children, ...props }, ref) => {
  if (render && React.isValidElement(render)) {
    return React.cloneElement(render as React.ReactElement<any>, {
      ref,
      'data-slot': 'input-group-button',
      className: cn('h-7 px-2 text-xs', className, (render.props as any).className),
      ...props,
    });
  }

  return (
    <Button
      ref={ref}
      data-slot="input-group-button"
      size={size}
      variant={variant}
      className={cn('h-7 px-2 text-xs', className)}
      {...props}
    >
      {children}
    </Button>
  );
});
InputGroupButton.displayName = 'InputGroupButton';

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton };
