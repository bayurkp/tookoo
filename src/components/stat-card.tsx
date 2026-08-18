import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

export type StatCardVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  variant?: StatCardVariant;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<
  StatCardVariant,
  {
    iconBg: string;
    iconColor: string;
    valueColor: string;
  }
> = {
  default: {
    iconBg: 'bg-muted/80',
    iconColor: 'text-muted-foreground',
    valueColor: 'text-foreground',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
  },
  danger: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    valueColor: 'text-rose-600 dark:text-rose-400',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    valueColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    valueColor: 'text-blue-600 dark:text-blue-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  variant = 'default',
  className,
  onClick,
}) => {
  const styles = variantStyles[variant];

  return (
    <Card
      onClick={onClick}
      className={cn(
        'border bg-card rounded-xl shadow-none p-4 flex flex-col justify-between transition-colors',
        onClick && 'cursor-pointer hover:border-primary/50',
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </span>
          {badge}
        </div>

        {Icon && (
          <div
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold',
              styles.iconBg,
              styles.iconColor
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value Row */}
      <div className="mt-2.5">
        <div className={cn('text-2xl font-bold tracking-tight font-mono', styles.valueColor)}>
          {value}
        </div>

        {/* Subtitle / Caption Row */}
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  );
};
