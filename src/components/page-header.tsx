import React from 'react';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Standardized Page Header Component for Tookoo POS application pages.
 * Enforces uniform typography, title size, subtitle contrast, and responsive action placement.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
  children,
}) => {
  return (
    <div
      className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-normal">{description}</p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
