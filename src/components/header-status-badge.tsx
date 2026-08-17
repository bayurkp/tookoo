import React from 'react';
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
  if (peerCount > 0) {
    return (
      <Badge variant="success" className="gap-1.5 py-1 px-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span>P2P Terhubung ({peerCount})</span>
      </Badge>
    );
  }

  if (isOnline) {
    return (
      <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-muted-foreground border">
        <Wifi className="h-3.5 w-3.5 text-emerald-500" />
        <span>Mode Lokal (Siap)</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 py-1 px-3 text-amber-600 border-amber-300 bg-amber-50">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline</span>
    </Badge>
  );
};
