import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface HeaderStatusBadgeProps {
  isOnline?: boolean;
  peerCount?: number;
}

export const HeaderStatusBadge: React.FC<HeaderStatusBadgeProps> = ({
  isOnline = true,
  peerCount = 0,
}) => {
  const { t } = useTranslation();

  if (peerCount > 0) {
    return (
      <Badge
        variant="outline"
        className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 gap-1.5 py-1 px-3"
      >
        <Wifi className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">
          {t('status.p2pConnected', { count: peerCount })}
        </span>
      </Badge>
    );
  }

  if (isOnline) {
    return (
      <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-muted-foreground border">
        <Wifi className="h-3.5 w-3.5 text-emerald-500" />
        <span>{t('status.localMode')}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 py-1 px-3 text-amber-600 border-amber-300 bg-amber-50"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>{t('status.offline')}</span>
    </Badge>
  );
};
