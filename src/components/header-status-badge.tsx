import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn';

interface HeaderStatusBadgeProps {
  isOnline?: boolean;
  peerCount?: number;
  className?: string;
}

export const HeaderStatusBadge: React.FC<HeaderStatusBadgeProps> = ({
  isOnline = true,
  peerCount = 0,
  className,
}) => {
  const { t } = useTranslation();

  if (peerCount > 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'h-8 px-2.5 gap-1.5 rounded-full border text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shrink-0 shadow-2xs transition-all',
          className
        )}
      >
        <Wifi className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">
          {t('status.p2pConnected', { count: peerCount })}
        </span>
      </Badge>
    );
  }

  if (isOnline) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'h-8 px-2.5 gap-1.5 rounded-full border text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shrink-0 shadow-2xs transition-all',
          className
        )}
      >
        <Wifi className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="hidden sm:inline">{t('status.connected', 'Terhubung')}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-8 px-2.5 gap-1.5 rounded-full border text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 shrink-0 shadow-2xs transition-all',
        className
      )}
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">{t('status.disconnected', 'Terputus')}</span>
    </Badge>
  );
};

export default HeaderStatusBadge;
