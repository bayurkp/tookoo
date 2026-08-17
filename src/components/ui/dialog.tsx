import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg p-6 bg-background rounded-xl border shadow-lg sm:max-w-[425px]">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('space-y-4', className)}>{children}</div>;

export const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('flex flex-col space-y-1.5 text-left', className)}>{children}</div>;

export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4', className)}>
    {children}
  </div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>{children}</h3>;

export const DialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
