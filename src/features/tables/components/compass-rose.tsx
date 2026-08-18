import React from 'react';
import { Compass, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompassRoseProps {
  rotation: number; // 0, 90, 180, 270 degrees
  onRotate?: () => void;
  className?: string;
}

export const CompassRose: React.FC<CompassRoseProps> = ({
  rotation,
  onRotate,
  className = '',
}) => {
  const getDirectionName = (deg: number) => {
    const normalized = ((deg % 360) + 360) % 360;
    if (normalized === 0) return 'Utara (U)';
    if (normalized === 90) return 'Timur (T)';
    if (normalized === 180) return 'Selatan (S)';
    if (normalized === 270) return 'Barat (B)';
    return `${normalized}°`;
  };

  return (
    <div
      className={`group flex items-center gap-2 p-1.5 px-2.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border/80 shadow-md select-none transition-all hover:bg-card ${className}`}
      title="Arah Mata Angin Denah Ruangan (Klik tombol putar untuk mengubah orientasi)"
    >
      {/* Visual Compass Dial */}
      <div className="relative h-9 w-9 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-border/80 bg-muted/40 flex items-center justify-center shadow-inner">
          {/* Tick marks */}
          <div className="absolute top-0.5 h-1 w-0.5 bg-destructive rounded-full" />
          <div className="absolute bottom-0.5 h-1 w-0.5 bg-muted-foreground/50 rounded-full" />
          <div className="absolute right-0.5 h-0.5 w-1 bg-muted-foreground/50 rounded-full" />
          <div className="absolute left-0.5 h-0.5 w-1 bg-muted-foreground/50 rounded-full" />
        </div>

        {/* Rotating Needle */}
        <div
          className="relative h-7 w-7 transition-transform duration-300 ease-out flex items-center justify-center"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* North Pointer (Red) */}
          <div className="absolute -top-0.5 flex flex-col items-center">
            <span className="text-[8px] font-black text-destructive leading-none mb-0.5">U</span>
            <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[9px] border-b-destructive" />
          </div>

          {/* South Pointer (Gray) */}
          <div className="absolute -bottom-0.5 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[9px] border-t-muted-foreground/60" />
            <span className="text-[8px] font-bold text-muted-foreground leading-none mt-0.5">S</span>
          </div>

          {/* East Pointer (T) */}
          <div className="absolute -right-0.5 flex items-center">
            <span className="text-[8px] font-bold text-muted-foreground leading-none">T</span>
          </div>

          {/* West Pointer (B) */}
          <div className="absolute -left-0.5 flex items-center">
            <span className="text-[8px] font-bold text-muted-foreground leading-none">B</span>
          </div>

          {/* Center Pivot Pin */}
          <div className="h-1.5 w-1.5 rounded-full bg-foreground shadow-xs z-10" />
        </div>
      </div>

      {/* Text Info & Quick Rotate Button */}
      <div className="flex flex-col text-left pr-1">
        <div className="flex items-center gap-1">
          <Compass className="h-3 w-3 text-destructive shrink-0" />
          <span className="text-[10px] font-extrabold text-foreground tracking-tight">
            {getDirectionName(rotation)}
          </span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">Orientasi {rotation}°</span>
      </div>

      {onRotate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRotate}
          className="h-6 w-6 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted"
          title="Putar Orientasi Arah Denah (+90°)"
        >
          <RotateCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default CompassRose;
